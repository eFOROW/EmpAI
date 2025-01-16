"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';

import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { MyProfile, LoginForm, Career } from "@/app/components/mypage";

const BlockNoteEditor = dynamic(() => 
  import('@/app/components/note/Editor').then((mod) => mod.default), 
  { ssr: false }
);

export default function Page() {
    const [control_id, setID] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const [modal, contextHolder] = Modal.useModal();

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
                                    <div className="container mx-auto px-4">
                                        <BlockNoteEditor />
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