"use client";
import Image from "next/image";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Avatar,
  Tag,
  Select,
  Input,
  Tooltip,
  Button,
  Pagination,
  Spin,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CodeOutlined,
  RocketOutlined,
  UserOutlined,
  HeartOutlined,
  PlusOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { User } from "firebase/auth";
import { getAuthorImage } from "@/app/components/community/PostDetail";

const { Search } = Input;
const { Option } = Select;

interface PostListProps {
  user: User;
  currentPosts: Array<{
    _id: string;
    title: string;
    content: string;
    category: string;
    author: {
      uid: string;
      name: string;
      email?: string;
      imgUrl: string;
    };
    image?: {
      data: Buffer;
      thumbnail: Buffer;
      contentType: string;
      dimensions?: {
        width: number;
        height: number;
      };
    };
    views: number;
    likesCount: number;
    commentsCount: number;
    isDeleted: boolean;
    createdAt: Date;
  }>;
  totalPosts: number;
  currentPage: number;
  onSearch: (value: string) => void;
  onSortChange: (value: string) => void;
  onPostClick: (post: any) => void;
  onWritePost: () => void;
  onCategoryChange: (category: string) => void;
  onPageChange: (page: number) => void;
  selectedCategory: string;
  isLoading: boolean;
}

interface AuthorImageMap {
  [key: string]: string;
}

export default function PostList({
  user,
  currentPosts,
  totalPosts,
  currentPage,
  onSearch,
  onSortChange,
  onPostClick,
  onWritePost,
  onCategoryChange,
  onPageChange,
  selectedCategory,
  isLoading,
}: PostListProps) {
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [authorImages, setAuthorImages] = useState<AuthorImageMap>({});
  const postsPerPage = 10;
  const prevProcessedUids = useRef(new Set<string>());

  const categories = [
    { key: "all", label: "전체", icon: <FileTextOutlined />, color: "default" },
    { key: "tech", label: "기술", icon: <CodeOutlined />, color: "blue" },
    {
      key: "career",
      label: "커리어",
      icon: <RocketOutlined />,
      color: "purple",
    },
    { key: "interview", label: "면접", icon: <UserOutlined />, color: "green" },
    { key: "life", label: "라이프", icon: <HeartOutlined />, color: "pink" },
  ];

  const getPostStatus = (post: any) => {
    const isHot = post.views > 100 || post.likesCount > 10;
    const isNew =
      new Date().getTime() - new Date(post.createdAt).getTime() <
      24 * 60 * 60 * 1000;
    return { isHot, isNew };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  const getImageSource = (imgUrl?: string) => {
    if (!imgUrl) return undefined;
    if (imgUrl.startsWith("upload:")) {
      const base64Data = imgUrl.split("upload:")[1];
      return !base64Data.startsWith("data:")
        ? `data:image/png;base64,${base64Data}`
        : base64Data;
    }
    return imgUrl;
  };

  const loadAuthorImage = useCallback(
    async (uid: string) => {
      if (!authorImages[uid] && !prevProcessedUids.current.has(uid)) {
        prevProcessedUids.current.add(uid);
        try {
          const imageUrl = await getAuthorImage(uid);
          if (imageUrl) {
            setAuthorImages((prev) => ({ ...prev, [uid]: imageUrl }));
          }
        } catch (error) {
          console.error(`Failed to fetch image for ${uid}:`, error);
        }
      }
    },
    [authorImages]
  );

  useEffect(() => {
    const loadImages = async () => {
      await Promise.all(
        currentPosts.map((post) => loadAuthorImage(post.author.uid))
      );
    };
    loadImages();
  }, [currentPosts, loadAuthorImage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 고정된 검색 헤더 */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto">
          {/* 검색 및 필터 영역 */}
          <div className="px-6 py-5">
            {/* 상단 검색바 및 액션 버튼 */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="w-[480px]">
                <Search
                  placeholder="검색어를 입력하세요"
                  onSearch={onSearch}
                  size="large"
                  className="search-input"
                  enterButton={
                    <Button
                      type="primary"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <SearchOutlined className="text-lg" />
                    </Button>
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <Select
                  defaultValue="latest"
                  style={{ width: 120 }}
                  size="large"
                  className="custom-select"
                  onChange={onSortChange}
                >
                  <Option value="latest">
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined />
                      <span>최신순</span>
                    </div>
                  </Option>
                  <Option value="views">
                    <div className="flex items-center gap-1">
                      <EyeOutlined />
                      <span>조회순</span>
                    </div>
                  </Option>
                  <Option value="likes">
                    <div className="flex items-center gap-1">
                      <StarOutlined />
                      <span>인기순</span>
                    </div>
                  </Option>
                </Select>

                <Button
                  type="primary"
                  size="large"
                  onClick={onWritePost}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 min-w-[120px]"
                >
                  <div className="flex items-center justify-center gap-1">
                    <PlusOutlined />
                    <span>글쓰기</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  onClick={() => onCategoryChange(category.key)}
                  icon={category.icon}
                  className={`
              h-9 px-4 rounded-full border transition-all duration-200
              ${
                selectedCategory === category.key
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-transparent"
                  : "bg-white hover:border-purple-400 hover:text-purple-500 border-gray-200"
              }
            `}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* 게시글 목록 */}
      <div className="max-w-8xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Spin size="large" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                    작성자
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    구분
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    조회
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    좋아요
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentPosts.map((post) => {
                  const { isHot, isNew } = getPostStatus(post);
                  return (
                    <tr
                      key={post._id}
                      onClick={() => onPostClick(post)}
                      className="hover:bg-gray-50 cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredPost(post._id)}
                      onMouseLeave={() => setHoveredPost(null)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-grow">
                            <span className="font-medium text-gray-900">
                              {post.title}
                              {post.commentsCount > 0 && (
                                <span className="ml-2 text-sm text-blue-500">
                                  [{post.commentsCount}]
                                </span>
                              )}
                            </span>
                            {post.image && (
                              <Tooltip title="이미지 포함">
                                <PictureOutlined className="text-blue-500" />
                              </Tooltip>
                            )}
                            {isNew && (
                              <Tag
                                color="success"
                                className="flex items-center gap-1 m-0 rounded"
                              >
                                <ThunderboltOutlined /> NEW
                              </Tag>
                            )}
                            {isHot && (
                              <Tag
                                color="error"
                                className="flex items-center gap-1 m-0 rounded"
                              >
                                <FireOutlined /> HOT
                              </Tag>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={getImageSource(
                              authorImages[post.author.uid] ||
                                post.author.imgUrl
                            )}
                            size="small"
                            className="border border-gray-200"
                          >
                            {post.author.name[0]}
                          </Avatar>
                          <span className="text-sm text-gray-900">
                            {post.author.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Tag
                          color={
                            categories.find((c) => c.key === post.category)
                              ?.color
                          }
                          className="flex items-center gap-1 justify-center m-0 rounded"
                        >
                          {
                            categories.find((c) => c.key === post.category)
                              ?.icon
                          }
                          <span>
                            {
                              categories.find((c) => c.key === post.category)
                                ?.label
                            }
                          </span>
                        </Tag>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center text-gray-500">
                          <EyeOutlined className="mr-1.5" />
                          {post.views.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center text-gray-500">
                          <LikeOutlined className="mr-1.5" />
                          {post.likesCount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {formatTimeAgo(new Date(post.createdAt))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {currentPosts.length === 0 && (
              <div className="text-center py-16">
                <FileTextOutlined className="text-5xl text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">등록된 게시글이 없습니다</p>
                <Button
                  type="primary"
                  onClick={onWritePost}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  첫 게시글 작성하기
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPosts > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              current={currentPage}
              total={totalPosts}
              pageSize={postsPerPage}
              onChange={onPageChange}
              showSizeChanger={false}
              className="custom-pagination"
            />
          </div>
        )}
      </div>

      {/* 스타일 커스터마이징 */}
      <style jsx global>{`
        .search-input .ant-input {
          height: 40px;
          font-size: 14px;
          border-radius: 8px 0 0 8px;
          border-color: #e5e7eb;
        }

        .search-input .ant-input-search-button {
          height: 40px !important;
          width: 50px !important;
          border-radius: 0 8px 8px 0 !important;
        }

        .custom-select .ant-select-selector {
          height: 40px !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          padding: 0 16px !important;
          border-color: #e5e7eb !important;
        }

        .ant-tag {
          border-radius: 4px;
          font-size: 12px;
          line-height: 1.5;
          padding: 0 8px;
        }

        .custom-pagination .ant-pagination-item {
          border-radius: 8px;
          margin: 0 3px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .custom-pagination .ant-pagination-item:hover {
          border-color: #a855f7;
          color: #a855f7;
        }

        .custom-pagination .ant-pagination-item-active {
          background-color: #a855f7;
          border: none;
        }

        .custom-pagination .ant-pagination-item-active:hover {
          background-color: #9333ea;
        }

        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }

        .custom-pagination .ant-pagination-prev,
        .custom-pagination .ant-pagination-next {
          border-radius: 8px;
        }

        .custom-pagination .ant-pagination-prev button,
        .custom-pagination .ant-pagination-next button {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .custom-pagination .ant-pagination-prev:hover button,
        .custom-pagination .ant-pagination-next:hover button {
          border-color: #a855f7;
          color: #a855f7;
        }
      `}</style>
    </div>
  );
}
