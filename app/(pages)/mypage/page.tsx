"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Input } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';

import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { MyProfile, LoginForm, Career } from "@/app/components/mypage";
import { Note } from '@/app/types/note';

const BlockNoteEditor = dynamic(() => 
  import('@/app/components/note/Editor').then((mod) => mod.default), 
  { ssr: false }
);

export default function Page() {
    const [control_id, setID] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const [modal, contextHolder] = Modal.useModal();
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isEditorSaving, setIsEditorSaving] = useState(false);
    const [isNoteLoading, setIsNoteLoading] = useState(false);

    useEffect(() => {
        getCurrentUser().then((user) => {
            setUser(user);
            setID(user ? 0 : 1);
        });
    }, []);

    const confirm = () => {
        modal.confirm({
            title: '알림',
            centered: true,
            icon: <ExclamationCircleOutlined />,
            content: '정말로 로그아웃 하시겠습니까?',
            okText: '로그아웃',
            cancelText: '취소',
            okButtonProps: {
                style: {
                    backgroundColor: 'red',
                    borderColor: 'red',
                    color: 'white',
                }
            },
            onOk: () => {
                handleLogout();
            },
        });
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.reload();
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const loadNotes = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/note?uid=${user.uid}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setNotes(data.notes);
    };

    useEffect(() => {
        if (user && control_id === 3) {
            loadNotes();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, control_id]);

    const createNewNote = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        await fetch('/api/note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                uid: user.uid,
                title: `새 노트 ${notes.length + 1}`,
                content: []
            })
        });
        loadNotes();
    };

    const deleteNote = async (noteId: string) => {
        if (!user) return;
        const token = await user.getIdToken();
        await fetch(`/api/note?noteId=${noteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadNotes();
        if (selectedNoteId === noteId) {
            setSelectedNoteId(null);
        }
    };

    const handleDeleteNote = (noteId: string) => {
        Modal.confirm({
            title: '노트 삭제',
            content: '정말로 이 노트를 삭제하시겠습니까?',
            centered: true,
            okText: '삭제',
            cancelText: '취소',
            okButtonProps: {
                danger: true
            },
            onOk: () => deleteNote(noteId)
        });
    };

    const handleNoteSelection = async (noteId: string) => {
        try {
            setIsNoteLoading(true);
            if (selectedNoteId && selectedNoteId !== noteId) {
                await new Promise(resolve => {
                    const checkSaveStatus = setInterval(() => {
                        if (!isEditorSaving) {
                            clearInterval(checkSaveStatus);
                            resolve(true);
                        }
                    }, 100);
                });
            }
            setSelectedNoteId(noteId);
        } finally {
            setIsNoteLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-grow">
                {/* user가 존재할 때만 메뉴를 렌더링 */}
                {user ? (
                    <div className="w-64 min-h-screen bg-gradient-to-b from-gray-50 to-white border-r">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-8">마이페이지</h2>
                            
                            <div className="space-y-2">
                                <Button
                                    type="text"
                                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all
                                        ${control_id === 0 
                                        ? 'bg-white shadow-md text-blue-700 font-semibold' 
                                        : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                                    onClick={() => setID(0)}
                                >
                                    내 정보
                                </Button>
                                <Button
                                    type="text"
                                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all
                                        ${control_id === 2 
                                        ? 'bg-white shadow-md text-blue-700 font-semibold' 
                                        : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                                    onClick={() => setID(2)}
                                >
                                    이력정보 등록
                                </Button>
                                <Button
                                    type="text"
                                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all
                                        ${control_id === 3
                                        ? 'bg-white shadow-md text-blue-700 font-semibold' 
                                        : 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                                    onClick={() => setID(3)}
                                >
                                    내 취업노트
                                </Button>
                            </div>

                            <div className="mt-8">
                                <Button
                                    onClick={confirm}
                                    className="w-full py-2.5 text-red-500 hover:text-white border border-red-500 
                                    hover:bg-red-500 rounded-lg transition-colors duration-200"
                                >
                                    로그아웃
                                </Button>
                            </div>
                        </div>
                        {contextHolder}
                    </div>
                ) : null} {/* user가 없으면 null을 렌더링하여 메뉴 숨김 */}

                <section className="flex-1 p-8">
                    <div className="max-w-[1200px] mx-auto">
                        {user ? (
                            <>
                                {control_id === 0 && <MyProfile user={user} />}
                                {control_id === 2 && <Career user={user} />}
                                {control_id === 3 && (
                                    <div className="mx-0">
                                        <div className="p-4 bg-blue-50 mb-4 rounded-lg">
                                            <h1 className="text-xl text-blue-700 font-semibold">
                                                나만의 취업노트를 꾸며보세요! ✨
                                            </h1>
                                            <p className="text-blue-600 mt-1">
                                                면접 준비, 자기소개서, 포트폴리오 등 취업 준비에 필요한 모든 것을 기록해보세요.
                                            </p>
                                        </div>
                                        <div className="flex space-x-4 pl-4">
                                            <div className="w-64 bg-white p-4 rounded-lg shadow h-fit">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-semibold">내 노트 목록</h3>
                                                    <Button
                                                        icon={<PlusOutlined />}
                                                        onClick={createNewNote}
                                                        type="primary"
                                                        size="small"
                                                    >
                                                        새 노트
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {notes.map((note) => (
                                                        <div
                                                            key={note._id}
                                                            className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                                                                selectedNoteId === note._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <span
                                                                onClick={() => handleNoteSelection(note._id)}
                                                                className="flex-1"
                                                            >
                                                                {note.title}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    icon={<EditOutlined />}
                                                                    onClick={() => {
                                                                        Modal.confirm({
                                                                            title: '노트 제목 수정',
                                                                            centered: true,
                                                                            content: (
                                                                                <Input
                                                                                    defaultValue={note.title}
                                                                                    onChange={(e) => {
                                                                                        (e.target as any).value = e.target.value;
                                                                                    }}
                                                                                />
                                                                            ),
                                                                            async onOk(close) {
                                                                                const input = document.querySelector('.ant-modal-content input') as HTMLInputElement;
                                                                                const newTitle = input.value;
                                                                                if (newTitle && newTitle !== note.title) {
                                                                                    const token = await user?.getIdToken();
                                                                                    await fetch('/api/note', {
                                                                                        method: 'POST',
                                                                                        headers: {
                                                                                            'Content-Type': 'application/json',
                                                                                            'Authorization': `Bearer ${token}`
                                                                                        },
                                                                                        body: JSON.stringify({
                                                                                            uid: user?.uid,
                                                                                            noteId: note._id,
                                                                                            title: newTitle
                                                                                        })
                                                                                    });
                                                                                    loadNotes();
                                                                                }
                                                                            },
                                                                            okText: '수정',
                                                                            cancelText: '취소'
                                                                        });
                                                                    }}
                                                                    type="text"
                                                                    size="small"
                                                                />
                                                                <Button
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => handleDeleteNote(note._id)}
                                                                    type="text"
                                                                    danger
                                                                    size="small"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                {isNoteLoading ? (
                                                    <div className="flex items-center justify-center h-[500px]">
                                                        <div className="flex flex-col items-center">
                                                            <EditOutlined className="text-5xl text-blue-500 animate-bounce mb-4" />
                                                            <h2 className="text-xl font-semibold text-gray-700">노트 불러오는 중...</h2>
                                                        </div>
                                                    </div>
                                                ) : selectedNoteId ? (
                                                    <BlockNoteEditor 
                                                        noteId={selectedNoteId} 
                                                        onSaveStart={() => setIsEditorSaving(true)}
                                                        onSaveEnd={() => setIsEditorSaving(false)}
                                                    />
                                                ) : (
                                                    <div className="text-center p-8 text-gray-500">
                                                        노트를 선택하거나 새로 만들어주세요
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <LoginForm />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}