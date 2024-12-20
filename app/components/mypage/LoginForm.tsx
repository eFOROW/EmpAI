"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { Form, Input, Button, Alert } from "antd";

export default function Page_Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (values: { email: string; password: string }) => {
    const { email, password } = values;
    try {
      setLoading(true); // 로딩 상태 활성화
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // 성공적으로 로그인 후 메인 페이지로 이동
    } catch (err: any) {
      setError(err.message); // 에러 메시지 설정
    } finally {
      setLoading(false); // 로딩 상태 비활성화
    }
  };

  return (
    <div className="profile-container p-5 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>

        {/* 에러 메시지 표시 */}
        {error && (
          <Alert
            message="로그인 실패"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {/* 로그인 폼*/}
        <Form
          name="login"
          layout="horizontal"  // 수평 레이아웃으로 설정
          onFinish={handleLogin}
          initialValues={{ email: "", password: "" }}
        >
          {/* 이메일 입력 */}
          <Form.Item
            label="이메일"
            name="email"
            rules={[
              { required: true, message: "이메일을 입력하세요!" },
              { type: "email", message: "유효한 이메일을 입력하세요!" },
            ]}
            labelCol={{ span: 6 }} // 레이블 너비
            wrapperCol={{ span: 18 }} // 입력 필드 너비
          >
            <Input placeholder="이메일을 입력하세요" />
          </Form.Item>

          {/* 비밀번호 입력 */}
          <Form.Item
            label="비밀번호"
            name="password"
            rules={[{ required: true, message: "비밀번호를 입력하세요!" }]}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Input.Password placeholder="비밀번호를 입력하세요" />
          </Form.Item>

          {/* 로그인 버튼 */}
          <Form.Item wrapperCol={{ offset: 6, span: 18 }}> {/* 버튼이 레이블과 맞춰서 위치하도록 설정 */}
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              로그인
            </Button>
          </Form.Item>
        </Form>


        {/* 회원가입 안내 링크 */}
        <div className="text-center mt-4">
          <span>아직도 회원이 아니신가요? </span>
          <Link href="/mypage/register" className="underline text-gray-500 hover:text-blue-600">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
