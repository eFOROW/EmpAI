'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, Tag, Select, Input, Tooltip, Button, Pagination, Badge } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  LikeOutlined, 
  MessageOutlined, 
  FileTextOutlined,
  FireOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { User } from 'firebase/auth';
import { 
  CodeOutlined, 
  RocketOutlined, 
  UserOutlined, 
  HeartOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

interface PostListProps {
  user: User;
  posts: Array<{
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
  }>;
  onSearch: (value: string) => void;
  onSortChange: (value: string) => void;
  onPostClick: (post: any) => void;
  onWritePost: () => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}

export default function PostList({ 
  user, 
  posts, 
  onSearch, 
  onSortChange, 
  onPostClick,
  onWritePost,
  onCategoryChange,
  selectedCategory
}: PostListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const postsPerPage = 10;

  const categories = [
    { key: 'all', label: '전체', icon: <FileTextOutlined />, color: 'default' },
    { key: 'tech', label: '기술', icon: <CodeOutlined />, color: 'blue' },
    { key: 'career', label: '커리어', icon: <RocketOutlined />, color: 'purple' },
    { key: 'interview', label: '면접', icon: <UserOutlined />, color: 'green' },
    { key: 'life', label: '라이프', icon: <HeartOutlined />, color: 'pink' }
  ];

  // 현재 페이지의 게시글 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const getPostStatus = (post: any) => {
    const isHot = post.views > 100 || post.likes.length > 10;
    const isNew = new Date().getTime() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000;
    return { isHot, isNew };
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 고정된 검색 헤더 */}
      <div className="sticky top-0 z-50 bg-white shadow-lg transform transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4">
          {/* 검색 영역 */}
          <div className="py-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-grow">
                <Search
                  placeholder="관심있는 주제나 키워드를 검색해보세요"
                  onSearch={onSearch}
                  size="large"
                  enterButton={
                    <Button 
                      type="primary" 
                      className="bg-purple-600 hover:bg-purple-700 h-12 px-8 text-lg"
                    >
                      <SearchOutlined />
                      검색
                    </Button>
                  }
                  className="searchbox-custom"
                />
              </div>
              <Select
                defaultValue="latest"
                size="large"
                style={{ width: 160 }}
                onChange={onSortChange}
                className="rounded-lg"
              >
                <Option value="latest">
                  <div className="flex items-center text-base py-1">
                    <ClockCircleOutlined className="mr-2" />
                    최신순
                  </div>
                </Option>
                <Option value="views">
                  <div className="flex items-center text-base py-1">
                    <EyeOutlined className="mr-2" />
                    조회순
                  </div>
                </Option>
                <Option value="likes">
                  <div className="flex items-center text-base py-1">
                    <StarOutlined className="mr-2" />
                    인기순
                  </div>
                </Option>
              </Select>
              <Button 
                type="primary"
                onClick={onWritePost}
                size="large"
                className="bg-purple-500 hover:bg-purple-500 h-12 px-8 text-base flex items-center"
                icon={<PlusOutlined />}
              >
                새 글 작성
              </Button>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="pb-6 flex justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category.key}
                type={selectedCategory === category.key ? 'primary' : 'default'}
                onClick={() => onCategoryChange(category.key)}
                size="large"
                className={`min-w-[120px] h-12 ${
                  selectedCategory === category.key 
                    ? 'bg-purple-600 hover:bg-purple-700 border-purple-600' 
                    : 'hover:bg-purple-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-base">
                  {category.icon}
                  <span>{category.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {currentPosts.map((post) => {
            const { isHot, isNew } = getPostStatus(post);
            return (
              <div 
                key={post._id}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform ${
                  hoveredPost === post._id ? 'scale-[1.02]' : 'scale-100'
                }`}
                onClick={() => onPostClick(post)}
                onMouseEnter={() => setHoveredPost(post._id)}
                onMouseLeave={() => setHoveredPost(null)}
              >
                <div className="p-8 cursor-pointer">
                  <div className="flex items-center mb-6">
                    <Avatar 
                      size={48}
                      className="mr-4" 
                      style={{ 
                        backgroundColor: `#${post.author.name.charCodeAt(0).toString(16).padEnd(6, '0')}`
                      }}
                    >
                      {post.author.name[0]}
                    </Avatar>
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {post.author.name}
                      </div>
                      <div className="text-base text-gray-500">
                        {format(new Date(post.createdAt), 'PPP')}
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      {isNew && (
                        <Tag color="green" className="px-3 py-1 text-base flex items-center gap-1">
                          <ThunderboltOutlined /> NEW
                        </Tag>
                      )}
                      {isHot && (
                        <Tag color="red" className="px-3 py-1 text-base flex items-center gap-1">
                          <FireOutlined /> HOT
                        </Tag>
                      )}
                      {post.category && (
                        <Tag 
                          color={categories.find(c => c.key === post.category)?.color} 
                          className="px-4 py-1 text-base"
                        >
                          <div className="flex items-center gap-1">
                            {categories.find(c => c.key === post.category)?.icon}
                            <span>{post.category}</span>
                          </div>
                        </Tag>
                      )}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {post.title}
                  </h3>
                  <p className="text-lg text-gray-600 line-clamp-2 mb-6">
                    {post.content}
                  </p>

                  <div className="flex items-center text-base text-gray-500 gap-8">
                    <Tooltip title="조회수">
                      <span className="flex items-center gap-2">
                        <EyeOutlined /> {post.views.toLocaleString()}
                      </span>
                    </Tooltip>
                    <Tooltip title="좋아요">
                      <span className="flex items-center gap-2">
                        <LikeOutlined /> {post.likes.length.toLocaleString()}
                      </span>
                    </Tooltip>
                    <Tooltip title="댓글">
                      <span className="flex items-center gap-2">
                        <MessageOutlined /> {post.comments.length.toLocaleString()}
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}

          {posts.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-16 text-center">
              <FileTextOutlined className="text-6xl text-gray-300 mb-6" />
              <p className="text-xl text-gray-500 mb-6">아직 게시글이 없습니다.</p>
              <Button 
                type="primary" 
                onClick={onWritePost}
                size="large"
                className="bg-purple-600 hover:bg-purple-700 h-12 px-8 text-base"
              >
                첫 게시글 작성하기
              </Button>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {posts.length > 0 && (
          <div className="flex justify-center mt-12">
            <Pagination
              current={currentPage}
              total={posts.length}
              pageSize={postsPerPage}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              className="text-center text-lg"
            />
          </div>
        )}
      </div>

      {/* 커스텀 스타일 */}
      <style jsx global>{`
        .searchbox-custom .ant-input {
          height: 48px;
          font-size: 1.1rem;
          padding: 8px 20px;
          border-radius: 8px;
        }
        .searchbox-custom .ant-input-search-button {
          height: 48px !important;
          padding: 0 30px;
          font-size: 1.1rem;
          border-radius: 0 8px 8px 0;
        }
        .ant-select-selector {
          height: 48px !important;
          padding: 8px 20px !important;
        }
        .ant-select-selection-item {
          line-height: 32px !important;
        }
      `}</style>
    </div>
  );
}