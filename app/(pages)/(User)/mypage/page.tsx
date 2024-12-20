"use client";

import Footer from "@/app/components/Home/Footer2";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { MyProfile, LoginForm, RegisterForm } from "@/app/components/mypage";

export default function Page() {
    const [control_id, setID] = useState(0); // 상태를 0으로 초기화
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // getCurrentUser를 호출하여 현재 사용자를 확인
        getCurrentUser().then((user) => {
        setUser(user);
        setID(user ? 0 : 1);
        });
    }, []);

    return (
        <div>
            <section>
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    {/* control_id 값에 따라 컴포넌트 렌더링 */}
                    {control_id === 0 && <MyProfile user={user} />}
                    {control_id === 1 && <LoginForm />}
                    {control_id === 2 && <RegisterForm />}
                </div>
            </section>
            <Footer />
        </div>
    );
}
