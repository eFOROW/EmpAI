'use client';

import { useState } from 'react';
import { Button, Input, Select, message, Form } from 'antd';
import { useRouter } from 'next/navigation';
import {
  CodeOutlined,
  RocketOutlined,
  UserOutlined,
  HeartOutlined,
  SendOutlined,
  CloseOutlined
} from '@ant-design/icons';
import getCurrentUser from '@/lib/firebase/auth_state_listener';

const { TextArea } = Input;
const { Option } = Select;

interface WritePostProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WritePost({ onSuccess, onCancel }: WritePostProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const categories = [
    { key: 'tech', label: '기술', icon: <CodeOutlined className="text-blue-500" /> },
    { key: 'career', label: '커리어', icon: <RocketOutlined className="text-purple-500" /> },
    { key: 'interview', label: '면접', icon: <UserOutlined className="text-green-500" /> },
    { key: 'life', label: '라이프', icon: <HeartOutlined className="text-pink-500" /> },
  ];

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        message.error('로그인이 필요합니다.');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          authorName: user.displayName || user.email?.split('@')[0]
        })
      });

      if (!response.ok) throw new Error('게시글 작성 실패');

      message.success('게시글이 작성되었습니다.');
      onSuccess?.();
      router.push('/community');
    } catch (error) {
      message.error('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="relative w-full bg-gradient-to-r from-purple-400 to-purple-400 text-white py-16">
        
        <div className="max-w-4xl mx-auto px-4 relative">
          <h1 className="text-5xl font-bold mb-4">새로운 이야기 작성하기</h1>
          <p className="text-xl text-purple-200">
            당신의 경험과 지식을 다른 취준생들과 공유해보세요
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-12 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Form 
            layout="vertical" 
            onFinish={handleSubmit}
            className="space-y-6"
          >
            <Form.Item
              name="category"
              label={<span className="text-lg font-semibold">카테고리 선택</span>}
              rules={[{ required: true, message: '카테고리를 선택해주세요' }]}
            >
              <Select 
                placeholder="카테고리를 선택해주세요" 
                size="large"
                className="category-select"
              >
                {categories.map(cat => (
                  <Option key={cat.key} value={cat.key}>
                    <div className="flex items-center gap-2 py-1">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label={<span className="text-lg font-semibold">제목</span>}
              rules={[{ required: true, message: '제목을 입력해주세요' }]}
            >
              <Input 
                placeholder="제목을 입력하세요"
                size="large"
                className="title-input"
              />
            </Form.Item>

            <Form.Item
              name="content"
              label={<span className="text-lg font-semibold">내용</span>}
              rules={[{ required: true, message: '내용을 입력해주세요' }]}
            >
              <TextArea 
                placeholder="내용을 입력하세요"
                autoSize={{ minRows: 15, maxRows: 30 }}
                className="content-textarea"
              />
            </Form.Item>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button 
                size="large"
                onClick={onCancel}
                icon={<CloseOutlined />}
                className="px-6 h-11 hover:bg-gray-50 flex items-center gap-2"
              >
                취소
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                className="px-6 h-11 bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                작성완료
              </Button>
            </div>
          </Form>
        </div>
      </main>

      {/* 스타일 */}
      <style jsx global>{`
        .category-select .ant-select-selector {
          height: 48px !important;
          padding: 8px 16px !important;
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          display: flex !important;
          align-items: center !important;
        }

        .title-input {
          height: 48px !important;
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          padding: 8px 16px !important;
          font-size: 1.1rem !important;
        }

        .content-textarea {
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          padding: 16px !important;
          font-size: 1.1rem !important;
          resize: none !important;
        }

        .category-select .ant-select-selector:hover,
        .title-input:hover,
        .content-textarea:hover {
          border-color: #a855f7 !important;
        }

        .category-select .ant-select-focused .ant-select-selector,
        .title-input:focus,
        .content-textarea:focus {
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1) !important;
        }

        .ant-form-item-label > label {
          height: 32px !important;
        }
      `}</style>
    </div>
  );
}