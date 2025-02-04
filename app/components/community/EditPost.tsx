"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input, Select, Form, message, Spin, Tabs } from "antd";
import {
  CodeOutlined,
  RocketOutlined,
  UserOutlined,
  HeartOutlined,
  SaveOutlined,
  CloseOutlined,
  PictureOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import Image from "next/image";
import imageCompression from "browser-image-compression";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

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
  image?: {
    data: Buffer;
    thumbnail: Buffer;
    contentType: string;
    dimensions?: {
      width: number;
      height: number;
    };
    imageType?: "file" | "url";
  };
  url?: {
    imgurl: string;
    imageType: "file" | "url";
  };
  views: number;
  likes: string[];
  comments: any[];
  createdAt: Date;
}

interface EditPostProps {
  postId: string;
  onSuccess?: (updatedPost: Post) => void;
  onCancel?: () => void;
}

export default function EditPost({
  postId,
  onSuccess,
  onCancel,
}: EditPostProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageSource, setImageSource] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [post, setPost] = useState<Post | null>(null);

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
  };

  const fetchPost = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        message.error("로그인이 필요합니다.");
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/community/posts?id=${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch post");

      const post = await response.json();
      setPost(post);
      form.setFieldsValue(post);

      // 이미지 자동 선택 및 상태 설정 로직 개선
      if (post.url?.imgurl) {
        // URL 이미지인 경우
        setImageSource("url");
        setImageUrl(post.url.imgurl);
        setImagePreview(post.url.imgurl);
      } else if (post.image?.data) {
        // 파일 이미지인 경우 (base64)
        setImageSource("file");
        const base64Image = `data:${post.image.contentType};base64,${post.image.data}`;
        setImagePreview(base64Image);
        setImageFile(null); // 기존 파일 초기화
      } else if (post.thumbnailUrl) {
        // 썸네일 URL이 있는 경우
        setImageSource("file");
        setImagePreview(post.thumbnailUrl);
      }
    } catch (error) {
      console.error("게시글 불러오기 오류:", error);
      message.error("게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postId, form]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // 수정된 handleSubmit 함수
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        message.error("로그인이 필요합니다.");
        return;
      }

      const token = await user.getIdToken();
      const formData = new FormData();

      // 기본 필드 추가
      formData.append("title", values.title.trim());
      formData.append("content", values.content.trim());
      formData.append("category", values.category);

      // 이미지 변경 여부 판단 로직 강화
      const isNewFileUpload = imageSource === "file" && imageFile;
      const isUrlChanged =
        imageSource === "url" && imageUrl !== post?.url?.imgurl;
      const isImageRemoved =
        !imagePreview && (post?.image || post?.url?.imgurl);

      if (isNewFileUpload || isUrlChanged) {
        // 새 이미지 업로드
        if (imageSource === "file" && imageFile) {
          formData.append("imageType", "file");
          formData.append("image", imageFile);
        } else if (imageSource === "url" && imageUrl) {
          formData.append("imageType", "url");
          formData.append("imageUrl", imageUrl);
        }
      } else if (isImageRemoved) {
        // 이미지 삭제
        formData.append("removeImage", "true");
      } else {
        // 기존 이미지 유지
        formData.append("keepExistingImage", "true");
      }

      // API 요청
      const response = await fetch(`/api/community/posts?id=${postId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "게시글 수정 실패");
      }

      const updatedPost = await response.json();

      // 갱신된 데이터로 상태 업데이트
      if (onSuccess) {
        onSuccess(updatedPost);
        setPost(updatedPost);

        // 이미지 미리보기 갱신
        if (updatedPost.url?.imgurl) {
          setImagePreview(updatedPost.url.imgurl);
        } else if (updatedPost.image) {
          const base64Image = `data:${updatedPost.image.contentType};base64,${updatedPost.image.data}`;
          setImagePreview(base64Image);
        } else {
          setImagePreview(null);
        }
      }
    } catch (error) {
      console.error("수정 오류:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="relative w-full bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">게시글 수정</h2>
          <p className="text-gray-600">게시글 내용을 수정해보세요</p>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Spin size="large" />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 왼쪽 메인 폼 영역 */}
                <div className="md:col-span-2 space-y-6">
                  <Form.Item
                    name="category"
                    label={
                      <span className="text-base font-semibold text-gray-700">
                        카테고리
                      </span>
                    }
                    rules={[
                      { required: true, message: "카테고리를 선택해주세요" },
                    ]}
                  >
                    <Select size="large" className="category-select">
                      {categories.map((cat) => (
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
                    label={
                      <span className="text-base font-semibold text-gray-700">
                        제목
                      </span>
                    }
                    rules={[{ required: true, message: "제목을 입력해주세요" }]}
                  >
                    <Input size="large" className="title-input" />
                  </Form.Item>

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
                        이미지 수정
                      </h3>
                      <Tabs
                        activeKey={imageSource}
                        onChange={(key) =>
                          setImageSource(key as "file" | "url")
                        }
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
                                if (post?.image || post?.url?.imgurl) {
                                  form.setFieldsValue({ imageDeleted: true });
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

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  size="large"
                  onClick={onCancel}
                  className="px-6 h-11 hover:bg-gray-50 flex items-center gap-2"
                >
                  취소
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="px-6 h-11 bg-purple-600 hover:bg-purple-700 flex items-center gap-2 border-0"
                >
                  <SaveOutlined />
                  수정완료
                </Button>
              </div>
            </Form>
          )}
        </div>
      </main>

      <style jsx global>{`
        .category-select .ant-select-selector {
          height: 48px !important;
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          padding: 8px 16px !important;
          display: flex !important;
          align-items: center !important;
        }

        .category-select .ant-select-selector:hover {
          border-color: #d8b4fe !important;
        }

        .category-select .ant-select-focused .ant-select-selector {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1) !important;
        }

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

        .ant-form-item-label > label {
          height: auto !important;
          margin-bottom: 4px !important;
        }
      `}</style>
    </div>
  );
}
