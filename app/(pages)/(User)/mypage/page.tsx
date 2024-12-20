"use client";

import { Footer2 } from "@/app/components/Home";
import { useEffect, useState } from "react";
import { Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { MyProfile, LoginForm } from "@/app/components/mypage";

export default function Page() {
    const [control_id, setID] = useState(0); // 상태를 0으로 초기화
    const [user, setUser] = useState<User | null>(null);
    
    const [modal, contextHolder] = Modal.useModal();

    useEffect(() => {
        // getCurrentUser를 호출하여 현재 사용자를 확인
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
                    backgroundColor: 'red',  // 빨간색 배경
                    borderColor: 'red',      // 빨간색 테두리
                    color: 'white',          // 흰색 텍스트
                }
            },
            onOk: () => {
                handleLogout(); // 예: 로그아웃 처리
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
                {/* 좌측 메뉴 버튼들 */}
                <div className="bg-white p-6 rounded-lg w-60 space-y-4 mt-4 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
                    {/* 메뉴 제목 */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">마이페이지</h2>
                    </div>

                    {/* 버튼들 */}
                    <Button
                        type="text"
                        className="w-full text-xl text-gray-800 hover:text-blue-600 transition-colors duration-300"
                        onClick={() => setID(user ? 0 : 1)} // 내 정보
                    >
                        내 정보
                    </Button>
                    <Button
                        type="text"
                        className="w-full text-xl text-gray-800 hover:text-blue-600 transition-colors duration-300"
                    >
                        이력정보 등록
                    </Button>
                    <Button
                        color="danger"
                        variant="solid"
                        onClick={confirm}
                        className={`w-full text-xl text-white bg-red-500 hover:bg-red-600 transition-colors duration-300 ${control_id === 2 ? 'bg-red-600' : ''}`}
                    >
                        로그아웃
                    </Button>
                    {contextHolder}
                </div>


                {/* 우측 콘텐츠 */}
                <section className="flex-1 p-8">
                    <div>
                        {/* control_id 값에 따라 컴포넌트 렌더링 */}
                        {control_id === 0 && <MyProfile user={user} />}
                        {control_id === 1 && <LoginForm />}
                    </div>
                </section>
            </div>

            {/* Footer */}
            <Footer2 />
        </div>
    );
}
