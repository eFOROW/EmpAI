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
import { Users, BookOpen, MessageCircle } from "lucide-react";
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
    <div>
      {/* 헤더 섹션 */}
      <div className="relative w-full bg-gradient-to-r from-blue-400 to-indigo-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-blue-500 to-indigo-800 opacity-90" />

        <div className="relative px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                함께 성장하는 취업 커뮤니티
              </h1>
              <p className="mt-4 text-lg text-gray-100">
                취준생들의 실전 경험과 노하우를 나누는 공간
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-6 text-center">
                <Users className="mx-auto h-8 w-8 text-white" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  현직자 멘토링
                </h3>
                <p className="mt-2 text-sm text-gray-200">
                  실무자들의 생생한 조언
                </p>
              </div>

              <div className="rounded-lg bg-white/10 p-6 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-white" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  면접 후기
                </h3>
                <p className="mt-2 text-sm text-gray-200">
                  실전 면접 경험 공유
                </p>
              </div>

              <div className="rounded-lg bg-white/10 p-6 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-white" />
                <h3 className="mt-4 text-lg font-semibold text-white">
                  스터디 모임
                </h3>
                <p className="mt-2 text-sm text-gray-200">
                  함께 준비하는 학습 그룹
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <Search
                    placeholder="관심있는 기업, 직무, 기술 스택을 검색해보세요"
                    onSearch={onSearch}
                    size="large"
                    className="custom-search w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-gray-300 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-white/30 shadow-lg transition-all duration-300"
                    enterButton={
                      <Button
                        type="text"
                        className="flex items-center justify-center"
                      >
                        <SearchOutlined className="h-5 w-5 text-white/70" />
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
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
              ? "bg-white text-purple-600 border-transparent"
              : "bg-white/20 text-white hover:bg-white/30 border-white/30"
          }
        `}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* ✅ 기존 스타일과 통일된 셀렉트 박스 */}
                <Select
                  defaultValue="latest"
                  style={{ width: 160 }}
                  className="!bg-white/10 hover:!bg-white/20 rounded-full border border-white/30 h-[48px] font-semibold"
                  onChange={onSortChange}
                  popupClassName="custom-dropdown-menu"
                >
                  <Option value="latest">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                      <ClockCircleOutlined className="text-gray-800" />
                      <span>최신순</span>
                    </div>
                  </Option>
                  <Option value="views">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                      <EyeOutlined className="text-gray-800" />
                      <span>조회순</span>
                    </div>
                  </Option>
                  <Option value="likes">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold text-base">
                      <StarOutlined className="text-gray-800" />
                      <span>인기순</span>
                    </div>
                  </Option>
                </Select>

                {/* ✅ 기존 스타일과 통일된 글쓰기 버튼 */}
                <Button
                  type="primary"
                  size="large"
                  onClick={onWritePost}
                  className="bg-white/10 border border-white/30 text-white rounded-full px-5 h-[40px] backdrop-blur-md hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  <div className="flex items-center justify-center gap-1">
                    <PlusOutlined />
                    <span>글쓰기</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-8xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <Spin size="large" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 w-[1300px] mx-auto">
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
        .custom-search .ant-input {
          background-color: transparent;
          border: none;
          box-shadow: none;
          color: white;
        }
        .custom-search .ant-input::placeholder {
          color: rgba(
            255,
            255,
            255,
            0.7
          ); /* placeholder 색상을 하얀색의 70% 불투명도로 변경 */
        }

        .custom-search .ant-input:focus {
          box-shadow: none;
        }

        .custom-search .ant-input-group-addon {
          background-color: transparent;
          border: none;
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
        .ant-select {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-select:not(.ant-select-customize-input) .ant-select-selector {
          background: transparent !important;
          border: none !important;
          color: white !important;
          height: 48px !important;
          padding: 0 16px !important;
          display: flex !important;
          align-items: center !important;
        }

        .ant-select-selection-item {
          line-height: 48px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
        }

        .ant-select-arrow {
          color: white !important;
          font-size: 12px !important;
          margin-top: -6px !important;
        }

        .custom-dropdown-menu {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px !important;
          padding: 4px !important;
        }

        .custom-dropdown-menu .ant-select-item {
          background: transparent !important;
          color: white !important;
          padding: 12px 16px !important;
          border-radius: 8px !important;
          margin: 2px 0 !important;
          font-weight: 600 !important;
        }

        .custom-dropdown-menu .ant-select-item-option-active {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .custom-dropdown-menu .ant-select-item-option-selected {
          background: rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
