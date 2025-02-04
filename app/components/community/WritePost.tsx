"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button, Input, Select, message, Form, Radio, Tabs } from "antd";
import { useRouter } from "next/navigation";
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
  InfoCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { useForm } from "antd/es/form/Form";
import imageCompression from "browser-image-compression";

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
  category: "tech" | "career" | "interview" | "life";
  imageUrl?: string;
}

export default function WritePost({
  onSuccess,
  onCancel,
  isModalMode = false,
  isVisible = true,
}: WritePostProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageSource, setImageSource] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [form] = Form.useForm();

  const resetStates = useCallback(() => {
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");
    setImageSource("file");
    setLoading(false);
    setUploading(false);

    // 파일 입력 초기화 - fileInputRef가 현재 연결된 input element를 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 이 부분이 파일 이름을 초기화합니다
    }
  }, [form]);

  // 모달이 닫힐 때 확실하게 초기화
  useEffect(() => {
    if (!isVisible) {
      resetStates();
    }
  }, [isVisible, resetStates]);

  const categories = [
    {
      key: "tech",
      label: "기술",
      icon: <CodeOutlined className="text-blue-500" />,
    },
    {
      key: "career",
      label: "커리어",
      icon: <RocketOutlined className="text-purple-500" />,
    },
    {
      key: "interview",
      label: "면접",
      icon: <UserOutlined className="text-green-500" />,
    },
    {
      key: "life",
      label: "라이프",
      icon: <HeartOutlined className="text-pink-500" />,
    },
  ];

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("이미지 압축 실패:", error);
      throw error;
    }
  };

  const processImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      message.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.error("이미지 크기는 2MB 이하여야 합니다.");
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
      message.success("이미지가 선택되었습니다.");
    } catch (error) {
      message.error("이미지 처리 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            await processImageFile(file);
            break;
          }
        }
      }
    },
    [processImageFile]
  );

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      await processImageFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove("drag-over");
  };
  useEffect(() => {
    resetStates(); // 마운트 시 즉시 초기화
    return () => {
      resetStates(); // 언마운트 시 초기화
    };
  }, [resetStates]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  const handleSubmit = async (values: PostFormData) => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        message.error("로그인이 필요합니다.");
        return;
      }

      const token = await user.getIdToken();
      const formData = new FormData();

      formData.append("title", values.title.trim());
      formData.append("content", values.content.trim());
      formData.append("category", values.category);
      formData.append(
        "authorName",
        user.displayName || user.email?.split("@")[0] || "Anonymous"
      );

      // 이미지 소스에 따른 처리
      if (imageSource === "file" && imageFile) {
        formData.append("imageType", "file");
        formData.append("image", imageFile);
      } else if (imageSource === "url" && imageUrl) {
        formData.append("imageType", "url");
        formData.append("imageUrl", imageUrl);
      }
      console.log(imageUrl);

      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("게시글 작성에 실패했습니다.");
      }

      message.success("게시글이 작성되었습니다.");
      resetStates();
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      message.error("게시글 작성에 실패했습니다.");
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
    setImageSource(key as "file" | "url");
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="relative w-full bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900">
            새로운 이야기 작성하기
          </h1>
          <p className="text-gray-600 mt-2">
            당신의 경험과 지식을 다른 취준생들과 공유해보세요
          </p>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 왼쪽 메인 폼 영역 */}
              <div className="md:col-span-2 space-y-6">
                {/* 카테고리 선택 */}
                <Form.Item
                  name="category"
                  label={
                    <span className="text-base font-semibold text-gray-700">
                      카테고리 선택
                    </span>
                  }
                  rules={[
                    { required: true, message: "카테고리를 선택해주세요" },
                  ]}
                >
                  <Radio.Group className="w-full grid grid-cols-4 gap-1">
                    {categories.map((cat) => (
                      <Radio.Button
                        key={cat.key}
                        value={cat.key}
                        className="h-12 flex items-center justify-center gap-2 border hover:border-purple-300 transition-colors"
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Form.Item>

                {/* 제목 입력 */}
                <Form.Item
                  name="title"
                  label={
                    <span className="text-base font-semibold text-gray-700">
                      제목
                    </span>
                  }
                  rules={[
                    { required: true, message: "제목을 입력해주세요" },
                    { max: 100, message: "제목은 100자 이내로 작성해주세요" },
                  ]}
                >
                  <Input
                    placeholder="제목을 입력하세요"
                    size="large"
                    className="title-input"
                    maxLength={100}
                  />
                </Form.Item>

                {/* 내용 입력 */}
                <Form.Item
                  name="content"
                  label={
                    <span className="text-base font-semibold text-gray-700">
                      내용
                    </span>
                  }
                  rules={[{ required: true, message: "내용을 입력해주세요" }]}
                >
                  <TextArea
                    placeholder="내용을 입력하세요"
                    autoSize={{ minRows: 15, maxRows: 30 }}
                    className="content-textarea"
                  />
                </Form.Item>
              </div>

              {/* 오른쪽 이미지 업로드 영역 */}
              <div className="md:col-span-1">
                <div className="sticky top-4">
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-base font-semibold text-gray-700 mb-4">
                      이미지 첨부
                    </h3>
                    <Tabs
                      activeKey={imageSource}
                      onChange={handleImageTabChange}
                      className="image-tabs"
                    >
                      <TabPane
                        tab={
                          <span className="flex items-center gap-2">
                            <PictureOutlined />
                            파일
                          </span>
                        }
                        key="file"
                      >
                        <div
                          className="mt-4 border-2 border-dashed border-purple-200 rounded-xl p-6 text-center transition-all
                            hover:border-purple-400 hover:bg-purple-100/50 bg-white"
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="image-upload"
                            ref={fileInputRef}
                            disabled={uploading}
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer block"
                          >
                            <PictureOutlined className="text-2xl text-purple-400 mb-2" />
                            <div className="font-medium text-gray-600">
                              클릭하여 업로드
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              또는 이미지를 여기에 드래그하세요
                            </div>
                          </label>
                        </div>
                      </TabPane>
                      <TabPane
                        tab={
                          <span className="flex items-center gap-2">
                            <LinkOutlined />
                            URL
                          </span>
                        }
                        key="url"
                      >
                        <div className="mt-4">
                          <Input
                            placeholder="이미지 URL을 입력하세요"
                            value={imageUrl}
                            onChange={(e) => {
                              setImageUrl(e.target.value);
                              setImagePreview(e.target.value);
                            }}
                            className="url-input bg-white"
                          />
                          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <InfoCircleOutlined />
                            <span>외부 이미지 URL을 입력하세요</span>
                          </div>
                        </div>
                      </TabPane>
                    </Tabs>

                    {imagePreview && (
                      <div className="mt-6">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white">
                          <Image
                            src={imagePreview}
                            alt="미리보기"
                            layout="fill"
                            objectFit="contain"
                            className="rounded-lg"
                          />
                          <Button
                            icon={<CloseOutlined />}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-sm"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                              setImageUrl("");
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 버튼 영역 */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button
                size="large"
                onClick={handleCancel}
                className="px-6 h-11 hover:bg-gray-50 flex items-center gap-2"
              >
                취소
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                className="px-6 h-11 bg-purple-600 hover:bg-purple-700 flex items-center gap-2 border-0"
              >
                <SendOutlined />
                작성완료
              </Button>
            </div>
          </Form>
        </div>
      </main>

      <style jsx global>{`
        .title-input {
          height: 48px !important;
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          padding: 8px 16px !important;
          font-size: 1rem !important;
          transition: all 0.2s ease;
        }

        .title-input:hover {
          border-color: #d8b4fe !important;
        }

        .title-input:focus {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1) !important;
        }

        .content-textarea {
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          padding: 16px !important;
          font-size: 1rem !important;
          line-height: 1.6 !important;
          resize: none !important;
          min-height: 400px !important;
          transition: all 0.2s ease;
        }

        .content-textarea:hover {
          border-color: #d8b4fe !important;
        }

        .content-textarea:focus {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1) !important;
        }

        .url-input {
          border-radius: 8px !important;
          border: 2px solid #e5e7eb !important;
          transition: all 0.2s ease;
        }

        .url-input:hover {
          border-color: #d8b4fe !important;
        }

        .url-input:focus {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1) !important;
        }

        .ant-radio-button-wrapper {
          border-radius: 8px !important;
          margin: 0 !important;
          transition: all 0.2s ease !important;
          border: 2px solid #e5e7eb !important;
        }

        .ant-radio-button-wrapper:hover {
          border-color: #d8b4fe !important;
          color: #a855f7 !important;
        }

        .ant-radio-button-wrapper-checked {
          border-color: #a855f7 !important;
          color: #a855f7 !important;
          background-color: #faf5ff !important;
        }

        /* 선 제거 */
        .ant-radio-button-wrapper::before {
          display: none !important;
        }

        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #a855f7 !important;
        }

        .ant-tabs-ink-bar {
          background: #a855f7 !important;
        }

        .ant-tabs-tab:hover {
          color: #d8b4fe !important;
        }

        .image-tabs .ant-tabs-nav::before {
          border-bottom-color: #e5e7eb !important;
        }
      `}</style>
    </div>
  );
}
