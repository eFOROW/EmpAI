'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, Form, message, Spin } from 'antd';
import { 
  CodeOutlined, 
  RocketOutlined, 
  UserOutlined, 
  HeartOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import getCurrentUser from '@/lib/firebase/auth_state_listener';

const { TextArea } = Input;
const { Option } = Select;

interface Post {
  _id: string;
  title: string;
  content: string;
  category?: string;
  author: {
    uid: string;
    name: string;
    email: string;
  };
  views: number;
  likes: string[];
  comments: any[];
  createdAt: Date;
}
interface EditPostProps {
  postId: string;
  onSuccess?: (updatedPost: Post) => void;  // 타입 수정
  onCancel?: () => void;
}
export default function EditPost({ postId, onSuccess, onCancel }: EditPostProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false); // 삭제 중 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // 삭제 확인 모달

  const categories = [
    { key: 'tech', label: '기술', icon: <CodeOutlined className="text-blue-500" /> },
    { key: 'career', label: '커리어', icon: <RocketOutlined className="text-purple-500" /> },
    { key: 'interview', label: '면접', icon: <UserOutlined className="text-green-500" /> },
    { key: 'life', label: '라이프', icon: <HeartOutlined className="text-pink-500" /> },
  ];
  const fetchPost = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        message.error('로그인이 필요합니다.');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/community/posts?id=${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch post');

      const post = await response.json();
      form.setFieldsValue(post);
    } catch (error) {
      message.error('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId, form]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        message.error('로그인이 필요합니다.');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/community/posts?id=${postId}`, {
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

      if (!response.ok) throw new Error('Failed to update post');
      
      const updatedPost = await response.json();

      message.success('게시글이 수정되었습니다.');

      // 수정 후 onSuccess를 호출하여 부모 컴포넌트로 갱신된 게시글 전달
      if (onSuccess) {
        onSuccess(updatedPost);
      }
    } catch (error) {
      message.error('게시글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
};

const handleDelete = async () => {
  setDeleting(true);
  try {
    const user = await getCurrentUser();
    if (!user) {
      message.error('로그인이 필요합니다.');
      return;
    }

    const token = await user.getIdToken();
    const response = await fetch(`/api/community/posts?id=${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to delete post');
    
    message.success('게시글이 삭제되었습니다.');

    // 삭제 후 onCancel 콜백 호출하여 부모 컴포넌트에서 취소 처리
    if (onCancel) {
      onCancel();
    }
  } catch (error) {
    message.error('게시글 삭제에 실패했습니다.');
  } finally {
    setDeleting(false);
    setShowDeleteConfirm(false); // 삭제 확인 모달 닫기
  }
};

// 삭제 확인 모달 열기
const showDeleteModal = () => {
  setShowDeleteConfirm(true);
};



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">게시글 수정</h2>

      <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
        <Form.Item
          name="category"
          label={<span className="text-lg font-semibold">카테고리</span>}
          rules={[{ required: true, message: '카테고리를 선택해주세요' }]}
        >
          <Select size="large" className="category-select">
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
          <Input size="large" className="title-input" />
        </Form.Item>

        <Form.Item
          name="content"
          label={<span className="text-lg font-semibold">내용</span>}
          rules={[{ required: true, message: '내용을 입력해주세요' }]}
        >
          <TextArea
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
            htmlType="submit"
            loading={submitting}
            icon={<SaveOutlined />}
            className="px-6 h-11 bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            수정완료
          </Button>
        </div>
      </Form>

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