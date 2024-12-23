"use client";

import { useEffect, useState } from "react";
import { Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { MyProfile, LoginForm, Career } from "@/app/components/mypage";

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
                    <div className="bg-white p-6 rounded-lg w-60 space-y-4 mt-4 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">마이페이지</h2>
                        </div>

                        <Button
                            type="text"
                            className="w-full text-xl text-gray-800 hover:text-blue-600 transition-colors duration-300"
                            onClick={() => setID(0)} // user가 있으므로 항상 0
                        >
                            내 정보
                        </Button>
                        <Button
                            type="text"
                            className="w-full text-xl text-gray-800 hover:text-blue-600 transition-colors duration-300"
                            onClick={() => setID(2)}
                        >
                            이력정보 등록
                        </Button>
                        <Button
                            color="danger"
                            variant="solid"
                            onClick={confirm}
                            className={`w-full text-xl text-white bg-red-500 hover:bg-red-600 transition-colors duration-300`}
                        >
                            로그아웃
                        </Button>
                        {contextHolder}
                    </div>
                ) : null} {/* user가 없으면 null을 렌더링하여 메뉴 숨김 */}

                <section className="flex-1 p-8">
                    <div>
                        {user ? ( // user가 있을 때
                            <>
                                {control_id === 0 && <MyProfile user={user} />}
                                {control_id === 2 && <Career />}
                            </>
                        ) : ( // user가 없을 때
                            <LoginForm />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}