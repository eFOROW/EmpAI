"use client";
import { useEffect, useState } from "react";
import { locales, filterSuggestionItems, insertOrUpdateBlock } from "@blocknote/core";
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

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    divider: Divider,
  },
});

const insertDivider = (editor: typeof schema.BlockNoteEditor) => ({
    title: "구분선",
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: "divider",
      });
    },
    group: "기타",
    icon: <RiDivideLine />,
});

export default function Editor() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const editor = useCreateBlockNote({
    schema,
    dictionary: locales.ko,
    placeholders: {
        ...locales.ko.placeholders,
        default: "'/'를 입력해 명령어 사용"
    },
    initialContent: [
      {
        type: "divider",
      },
    ],
  });
  useEffect(() => {
    const loadContent = async () => {
      if (!user?.uid) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/note?uid=${user.uid}`, {
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
      }
    };

    loadContent();
  }, [user, editor]);

  useEffect(() => {
    if (!user?.uid) return;

    const saveContent = async () => {
      const blocks = editor.topLevelBlocks;
      try {
        const token = await user.getIdToken();
        await fetch('/api/note', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            uid: user.uid,
            content: blocks
          })
        });
      } catch (error) {
        console.error('저장 실패:', error);
      }
    };

    let timeoutId: NodeJS.Timeout;

    const debouncedSave = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveContent, 1000);
    };

    const handleBeforeUnload = () => {
      clearTimeout(timeoutId);
      saveContent();
    };

    const unsubscribe = editor.onChange(debouncedSave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timeoutId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, editor]);

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
      <div className="p-4 bg-blue-50 mb-4 rounded-lg">
        <h1 className="text-xl text-blue-700 font-semibold">
          나만의 취업노트를 꾸며보세요! ✨
        </h1>
        <p className="text-blue-600 mt-1">
          면접 준비, 자기소개서, 포트폴리오 등 취업 준비에 필요한 모든 것을 기록해보세요.
        </p>
      </div>
      <BlockNoteView editor={editor} slashMenu={false}>
      <SuggestionMenuController
        triggerCharacter={"/"}
        getItems={async (query) =>
          filterSuggestionItems(
            [...getDefaultReactSlashMenuItems(editor), insertDivider(editor)],
            query
          )
        }
      />
    </BlockNoteView>
    </div>
  );
} 