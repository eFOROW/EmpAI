'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Input, Select, message, Form, Radio, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import {
  CodeOutlined,
  RocketOutlined,
  UserOutlined,
  HeartOutlined,
  SendOutlined,
  CloseOutlined,
  PictureOutlined,
  LinkOutlined,
  CopyOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import getCurrentUser from '@/lib/firebase/auth_state_listener';
import { useForm } from 'antd/es/form/Form';
import imageCompression from 'browser-image-compression';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface WritePostProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModalMode?: boolean;
  isVisible?: boolean;
}

interface PostFormData {
  title: string;
  content: string;
  category: 'tech' | 'career' | 'interview' | 'life';
  imageUrl?: string;
}

export default function WritePost({ onSuccess, onCancel, isModalMode = false, isVisible = true }: WritePostProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageSource, setImageSource] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [form] = Form.useForm();

  const resetStates = useCallback(() => {
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    setImageSource('file');
    setLoading(false);
    setUploading(false);
  
    // 파일 입력 초기화 - fileInputRef가 현재 연결된 input element를 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // 이 부분이 파일 이름을 초기화합니다
    }
  }, [form]);
  
  // 모달이 닫힐 때 확실하게 초기화
  useEffect(() => {
    if (!isVisible) {
      resetStates();
    }
  }, [isVisible, resetStates]);

  const categories = [
    { key: 'tech', label: '기술', icon: <CodeOutlined className="text-blue-500" /> },
    { key: 'career', label: '커리어', icon: <RocketOutlined className="text-purple-500" /> },
    { key: 'interview', label: '면접', icon: <UserOutlined className="text-green-500" /> },
    { key: 'life', label: '라이프', icon: <HeartOutlined className="text-pink-500" /> },
  ];

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      throw error;
    }
  };

  const processImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('이미지 파일만 업로드 가능합니다.');
      return;
    }
  
    if (file.size > 2 * 1024 * 1024) {
      message.error('이미지 크기는 2MB 이하여야 합니다.');
      return;
    }
  
    try {
      setUploading(true);
      const compressedFile = await compressImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
  
      setImageFile(compressedFile);
      message.success('이미지가 선택되었습니다.');
    } catch (error) {
      message.error('이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
  
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          await processImageFile(file);
          break;
        }
      }
    }
  }, [processImageFile]);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processImageFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
  };
  useEffect(() => {
    resetStates(); // 마운트 시 즉시 초기화
    return () => {
      resetStates(); // 언마운트 시 초기화
    };
  }, [resetStates]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const handleSubmit = async (values: PostFormData) => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        message.error('로그인이 필요합니다.');
        return;
      }
  
      const token = await user.getIdToken();
      const formData = new FormData();
      
      formData.append('title', values.title.trim());
      formData.append('content', values.content.trim());
      formData.append('category', values.category);
      formData.append('authorName', user.displayName || user.email?.split('@')[0] || 'Anonymous');
      
      // 이미지 소스에 따른 처리
      if (imageSource === 'file' && imageFile) {
        formData.append('imageType', 'file');
        formData.append('image', imageFile);
      } else if (imageSource === 'url' && imageUrl) {
        formData.append('imageType', 'url');
        formData.append('imageUrl', imageUrl);
      }
      console.log(imageUrl)

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('게시글 작성에 실패했습니다.');
      }
  
      message.success('게시글이 작성되었습니다.');
      resetStates();
      onSuccess?.();
  
    } catch (error) {
      console.error('Error:', error);
      message.error('게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    resetStates();
    onCancel?.();
  };
  
  if (!isVisible) {
    return null; // 모달이 보이지 않을 때는 아무것도 렌더링하지 않음
  }

  const handleImageTabChange = (key: string) => {
    setImageSource(key as 'file' | 'url');
    setImageFile(null);
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative w-full bg-gradient-to-r from-purple-400 to-purple-400 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 relative">
          <h1 className="text-4xl font-bold mb-4">새로운 이야기 작성하기</h1>
          <p className="text-lg text-purple-200">
            당신의 경험과 지식을 다른 취준생들과 공유해보세요
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Form 
            form={form}
            layout="vertical" 
            onFinish={handleSubmit}
            
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
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
                  rules={[
                    { required: true, message: '제목을 입력해주세요' },
                    { max: 100, message: '제목은 100자 이내로 작성해주세요' }
                  ]}
                >
                  <Input 
                    placeholder="제목을 입력하세요"
                    size="large"
                    className="title-input"
                    maxLength={100}
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
              </div>

              <div className="md:col-span-1">
                <div className="sticky top-4">
                  <span className="text-lg font-semibold block mb-4">이미지 첨부</span>
                  <Tabs 
                    activeKey={imageSource} 
                    onChange={(key) => setImageSource(key as 'file' | 'url')}
                  >
                    <TabPane 
                      tab={<span><PictureOutlined />파일 업로드</span>} 
                      key="file"
                    >
                      <div className="space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center" 
                      onDrop={handleDrop} 
                      onDragOver={handleDragOver}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                        ref={fileInputRef}
                        disabled={uploading}
                        key={imageFile ? 'hasFile' : 'noFile'} // key를 추가하여 input을 강제로 리렌더링
                      />
                      <label
                        htmlFor="image-upload"
                        className={`block w-full px-4 py-3 border-2 border-purple-500 text-purple-500 
                          rounded-lg cursor-pointer hover:bg-purple-50 transition-colors
                          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <PictureOutlined className="text-xl mb-2" />
                        <div>클릭하여 업로드</div>
                        <div className="text-sm text-gray-500">
                          또는 이미지를 여기에 끌어다 놓거나<br />
                          붙여넣기(Ctrl+V)하세요
                        </div>
                      </label>
                    </div>
                    </TabPane>
                    <TabPane tab={<span><LinkOutlined />이미지 URL</span>} key="url">
                    <Input
                      placeholder="이미지 URL을 입력하세요 (예: https://...)"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      className="mb-4"
                    />
                    <div className="text-sm text-gray-500">
                      * 외부 이미지 URL을 입력하면 자동으로 최적화됩니다
                    </div>
                  </TabPane>
                </Tabs>

                  {imagePreview && (
                    <div className="mt-4">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={imagePreview}
                          alt="미리보기"
                          layout="fill"
                          objectFit="contain"
                          className="rounded-lg"
                        />
                        <Button
                          icon={<CloseOutlined />}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                            setImageUrl('');
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        * 이미지는 자동으로 최적화됩니다
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button 
                size="large"
                onClick={handleCancel}
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
          min-height: 400px !important;
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
          height: 10px !important;
        }

        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #8b5cf6 !important;
        }

        .ant-tabs-ink-bar {
          background: #8b5cf6 !important;
        }

        .ant-tabs-tab:hover {
          color: #a855f7 !important;
        }

        .image-upload-area {
          transition: all 0.3s ease;
        }

        .image-upload-area:hover {
          background-color: #faf5ff;
          border-color: #8b5cf6;
        }

        @media (max-width: 768px) {
          .content-textarea {
            min-height: 300px !important;
          }
        }
      `}</style>
    </div>
  );
}