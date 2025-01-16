"use client";
import { useEffect, useState, useRef } from "react";
import { locales, filterSuggestionItems } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { SuggestionMenuController, getDefaultReactSlashMenuItems, useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { EditOutlined } from '@ant-design/icons';
import { Divider } from "./blocks/Divider";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { RiDivideLine } from 'react-icons/ri';
import { Bookmark } from "./blocks/Bookmark";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    divider: Divider,
    bookmark: Bookmark
  },
});

const insertDivider = (editor: any) => ({
    title: "구분선",
    onItemClick: () => {
      const pos = editor.getTextCursorPosition();
      editor.insertBlocks([{ type: "divider" }], pos.block, 'after');
    },
    group: "기타",
    icon: <RiDivideLine />,
});

const insertBookmark = (editor: any) => ({
  title: "북마크 추가",
  onItemClick: async () => {
    const url = window.prompt("URL을 입력하세요");
    const pos = editor.getTextCursorPosition();
    
    if (url && /^https?:\/\/[^\s]+$/.test(url)) {
      try {
        const encodedUrl = btoa(url);
        const response = await fetch(`/api/note/metadata?encodedUrl=${encodedUrl}`);
        const metadata = await response.json();
        
        if (response.ok) {
          let imageUrl = metadata.image;
          if (imageUrl && !imageUrl.startsWith('http')) {
            const urlObj = new URL(url);
            imageUrl = new URL(imageUrl, urlObj.origin).toString();
          }
          
          editor.insertBlocks([
            {
              type: "bookmark",
              props: {
                url: url,
                title: metadata.title,
                description: metadata.description,
                image: imageUrl
              }
            }
          ], pos.block, 'after');
        } else {
          throw new Error(metadata.error);
        }
      } catch (error) {
        console.error('북마크 생성 실패:', error);
        editor.insertBlocks([
          {
            type: "bookmark",
            props: {
              url: url,
              title: url,
              description: "",
              image: ""
            }
          }
        ], pos.block, 'after');
        editor.insertBlocks([{ type: "paragraph" }], pos.block.id, 'after');
      }
    }
  },
  group: "기타",
  icon: <span>🔖</span>,
});

interface EditorProps {
  noteId: string;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
}

export default function Editor({ noteId, onSaveStart, onSaveEnd }: EditorProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedContent = useRef<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavePromiseRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const editor = useCreateBlockNote({
    schema: schema as any,
    dictionary: locales.ko,
    placeholders: {
        ...locales.ko.placeholders,
        default: "'/'를 입력해 명령어 사용"
    }
  });
  useEffect(() => {
    const loadContent = async () => {
        if (!user?.uid || !noteId) return;
        
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/note?noteId=${noteId}&uid=${user.uid}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            setIsContentLoaded(false);
            if (data.content) {
                editor.replaceBlocks(editor.topLevelBlocks, data.content);
                lastSavedContent.current = JSON.stringify(data.content);
            }
        } catch (error) {
            console.error('로드 실패:', error);
        } finally {
            setIsContentLoaded(true);
        }
    };

    loadContent();
  }, [user, editor, noteId]);

  const saveContent = async () => {
    if (!user?.uid || !noteId || !isContentLoaded) return;

    try {
      const currentContent = JSON.stringify(editor.topLevelBlocks);
      if (currentContent === lastSavedContent.current) return;

      setIsSaving(true);
      onSaveStart?.();

      // 이전 저장 작업 완료 대기
      await lastSavePromiseRef.current;

      const savePromise = (async () => {
        const token = await user.getIdToken();
        const response = await fetch('/api/note', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            uid: user.uid,
            noteId: noteId,
            content: editor.topLevelBlocks
          })
        });

        if (!response.ok) {
          throw new Error('저장 실패');
        }

        lastSavedContent.current = currentContent;
      })();

      lastSavePromiseRef.current = savePromise;
      await savePromise;

    } catch (error) {
      console.error('저장 중 오류:', error);
      // 여기서 사용자에게 오류 알림을 표시할 수 있습니다
    } finally {
      setIsSaving(false);
      onSaveEnd?.();
    }
  };

  useEffect(() => {
    if (!isContentLoaded) return;

    const debouncedSave = () => {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(saveContent, 1000);
    };

    const unsubscribe = editor.onChange(debouncedSave);

    return () => {
      clearTimeout(saveTimeoutRef.current);
      // 컴포넌트 언마운트 시 즉시 저장
      if (editor.topLevelBlocks.length > 0) {
        void saveContent();
      }
      unsubscribe?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, isContentLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <EditOutlined className="text-5xl text-blue-500 animate-bounce mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">노트 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <EditOutlined className="text-5xl text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">로그인이 필요합니다</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <BlockNoteView
        editor={editor} 
        slashMenu={false}
        spellCheck={false}
      >
      <SuggestionMenuController
        triggerCharacter={"/"}
        getItems={async (query) =>
          filterSuggestionItems(
            [...getDefaultReactSlashMenuItems(editor), insertDivider(editor), insertBookmark(editor)],
            query
          )
        }
      />
    </BlockNoteView>
    </div>
  );
} 