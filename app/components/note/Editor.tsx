"use client";
import { useEffect, useState } from "react";
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
      editor.insertBlocks([{ type: "paragraph" }], pos.block.id, 'after');
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
          editor.insertBlocks([{ type: "paragraph" }], pos.block.id, 'after');
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
        setIsContentLoaded(false); // 로딩 시작
        
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/note?noteId=${noteId}&uid=${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.content) {
                editor.replaceBlocks(editor.topLevelBlocks, data.content);
            }
        } catch (error) {
            console.error('로드 실패:', error);
        } finally {
            setIsContentLoaded(true); // 로딩 완료
        }
    };

    loadContent();
  }, [user, editor, noteId]);

  useEffect(() => {
    if (!user?.uid || !isContentLoaded || !noteId) return;

    let saveInProgress = false;
    let pendingSave = false;

    const saveContent = async () => {
        if (!user || saveInProgress) {
            pendingSave = true;
            return;
        }

        saveInProgress = true;
        onSaveStart?.();
        
        try {
            const blocks = editor.topLevelBlocks;
            const token = await user.getIdToken();
            await fetch('/api/note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    noteId: noteId,
                    content: blocks
                })
            });
        } catch (error) {
            console.error('저장 실패:', error);
        } finally {
            saveInProgress = false;
            onSaveEnd?.();
            
            if (pendingSave) {
                pendingSave = false;
                saveContent();
            }
        }
    };

    let timeoutId: NodeJS.Timeout;

    const debouncedSave = () => {
        if (!isContentLoaded) return;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(saveContent, 1000);
    };

    const unsubscribe = editor.onChange(debouncedSave);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (!isContentLoaded) return;
        clearTimeout(timeoutId);
        saveContent();
    };

    const cleanup = () => {
        if (!isContentLoaded) return;
        clearTimeout(timeoutId);
        saveContent();
        unsubscribe?.();
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return cleanup;
  }, [user, editor, isContentLoaded, noteId, onSaveStart, onSaveEnd]);

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