'use client';
import Image from 'next/image';
import React, { useState, useCallback,useEffect,useRef  } from 'react';
import { Avatar, Tag, Select, Input, Tooltip, Button, Pagination, Spin } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  LikeOutlined, 
  MessageOutlined, 
  FileTextOutlined,
  FireOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ThunderboltOutlined,
  CodeOutlined, 
  RocketOutlined, 
  UserOutlined, 
  HeartOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { User } from 'firebase/auth';
import { getAuthorImage } from '@/app/components/community/PostDetail';
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
  isLoading
}: PostListProps) {
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [authorImages, setAuthorImages] = useState<AuthorImageMap>({});
  const postsPerPage = 5;
  const prevProcessedUids = useRef(new Set<string>());
  const categories = [
    { key: 'all', label: '전체', icon: <FileTextOutlined />, color: 'default' },
    { key: 'tech', label: '기술', icon: <CodeOutlined />, color: 'blue' },
    { key: 'career', label: '커리어', icon: <RocketOutlined />, color: 'purple' },
    { key: 'interview', label: '면접', icon: <UserOutlined />, color: 'green' },
    { key: 'life', label: '라이프', icon: <HeartOutlined />, color: 'pink' }
  ];

  const getPostStatus = (post: any) => {
    const isHot = post.views > 100 || post.likesCount > 10;
    const isNew = new Date().getTime() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000;
    return { isHot, isNew };
  };

  const getImageSource = (imgUrl?: string) => {
    if (!imgUrl) {
      return undefined;
    }
  
    if (imgUrl.startsWith('upload:')) {
      const base64Data = imgUrl.split('upload:')[1];
      if (!base64Data.startsWith('data:')) {
        return `data:image/png;base64,${base64Data}`;
      }
      return base64Data;
    }
  
    return imgUrl;
  };

  const loadAuthorImage = useCallback(async (uid: string) => {
    if (!authorImages[uid] && !prevProcessedUids.current.has(uid)) {
      prevProcessedUids.current.add(uid);
      try {
        const imageUrl = await getAuthorImage(uid);
        if (imageUrl) {
          setAuthorImages(prev => ({
            ...prev,
            [uid]: imageUrl
          }));
        }
      } catch (error) {
        console.error(`Failed to fetch image for ${uid}:`, error);
      }
    }
  }, [authorImages]);
  
  useEffect(() => {
    const loadImages = async () => {
      await Promise.all(
        currentPosts.map(post => loadAuthorImage(post.author.uid))
      );
    };
    
    loadImages();
  }, [currentPosts, loadAuthorImage]);

  const renderThumbnail = useCallback((post: any) => {
    // URL 또는 Base64 이미지 확인
    const thumbnailSrc = post.url?.imgurl || post.thumbnailUrl;
   
    if (!thumbnailSrc) {
      return null;
    }
   
    // URL 이미지인 경우 바로 사용
    if (post.url?.imgurl) {
      return (
        <div className="mb-4 rounded-lg overflow-hidden relative w-full max-w-[320px] aspect-video float-left mr-4">
          <Image
            src={thumbnailSrc}
            alt="포스트 썸네일"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.error('이미지 로드 실패:', e);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      );
    }
   
    // Base64 이미지 처리
    if (!thumbnailSrc.startsWith('data:image/')) {
      console.error('잘못된 썸네일 형식:', thumbnailSrc.substring(0, 50));
      return null;
    }
   
    return (
      <div className="mb-4 rounded-lg overflow-hidden relative w-full max-w-[320px] aspect-video float-left mr-4">
        <Image
          src={thumbnailSrc}
          alt="포스트 썸네일"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            console.error('이미지 로드 실패:', e);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
    );
   }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 고정된 검색 헤더 */}
      <div className="sticky top-0 z-50 bg-white shadow-sm transform transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4">
          {/* 검색 영역 */}
          <div className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-grow">
                <Search
                  placeholder="검색어를 입력하세요"
                  onSearch={onSearch}
                  size="middle"
                  enterButton={
                    <Button 
                      type="primary" 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-10 px-6 text-sm font-medium shadow-sm"
                    >
                      <SearchOutlined className="text-base" />
                      <span className="ml-2">검색</span>
                    </Button>
                  }
                  className="searchbox-custom"
                />
              </div>
              <Select
                defaultValue="latest"
                size="middle"
                style={{ width: 120 }}
                onChange={onSortChange}
                className="rounded-lg text-sm"
              >
                <Option value="latest">
                  <div className="flex items-center text-sm py-1">
                    <ClockCircleOutlined className="mr-2 text-xs" />
                    최신순
                  </div>
                </Option>
                <Option value="views">
                  <div className="flex items-center text-sm py-1">
                    <EyeOutlined className="mr-2 text-xs" />
                    조회순
                  </div>
                </Option>
                <Option value="likes">
                  <div className="flex items-center text-sm py-1">
                    <StarOutlined className="mr-2 text-xs" />
                    인기순
                  </div>
                </Option>
              </Select>
              <Button 
                type="primary"
                onClick={onWritePost}
                size="middle"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-10 px-6 text-sm font-medium shadow-sm flex items-center"
                icon={<PlusOutlined className="text-xs" />}
              >
                새 글 작성
              </Button>
            </div>
          </div>
  
          {/* 카테고리 필터 */}
          <div className="pb-4 flex justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                type={selectedCategory === category.key ? 'primary' : 'default'}
                onClick={() => onCategoryChange(category.key)}
                size="middle"
                className={`min-w-[90px] h-8 text-sm ${
                  selectedCategory === category.key 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:text-white border-transparent' 
                    : 'hover:bg-purple-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {category.icon}
                  <span>{category.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
  
      {/* 게시글 목록 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spin size="large" />
          </div>
        ) : currentPosts && currentPosts.length > 0 ? (
          <div className="space-y-4">
            {currentPosts.map((post) => {
            const { isHot, isNew } = getPostStatus(post);

            // Base64 변환 로직 강화
            const thumbnailSrc = post.image?.thumbnail 
              ? (() => {
                  try {
                    // Buffer나 문자열 모두 처리 가능하도록 수정
                    const thumbnailBuffer = post.image.thumbnail instanceof Buffer 
                      ? post.image.thumbnail 
                      : Buffer.from(post.image.thumbnail);
                    
                    const base64String = thumbnailBuffer.toString('base64');
                    
                    return `data:${post.image.contentType || 'image/jpeg'};base64,${base64String}`;
                  } catch (error) {
                    console.error('Thumbnail conversion error:', error);
                    return null;
                  }
                })()
              : null;
    
              return (
                <div 
                  key={post._id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform ${
                    hoveredPost === post._id ? 'scale-[1.005]' : 'scale-100'
                  }`}
                  onClick={() => onPostClick(post)}
                  onMouseEnter={() => setHoveredPost(post._id)}
                  onMouseLeave={() => setHoveredPost(null)}
                >
                  <div className="p-6 cursor-pointer">
                    <div className="flex items-center mb-4">
                    <Avatar 
                        size={48}
                        src={getImageSource(authorImages[post.author.uid] || post.author.imgUrl)}
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
                      <div className="ml-auto flex items-center gap-2">
                        {isNew && (
                          <Tag color="green" className="px-2 py-0.5 text-xs flex items-center gap-1">
                            <ThunderboltOutlined className="text-xs" /> NEW
                          </Tag>
                        )}
                        {isHot && (
                          <Tag color="red" className="px-2 py-0.5 text-xs flex items-center gap-1">
                            <FireOutlined className="text-xs" /> HOT
                          </Tag>
                        )}
                        {post.category && (
                          <Tag 
                            color={categories.find(c => c.key === post.category)?.color} 
                            className="px-2 py-0.5 text-xs"
                          >
                            <div className="flex items-center gap-1">
                              {categories.find(c => c.key === post.category)?.icon}
                              <span>{post.category}</span>
                            </div>
                          </Tag>
                        )}
                      </div>
                    </div>

                    

                    <h3 className="text-lg font-bold mb-2 text-gray-900">
                    {post.title}
                  </h3>

                  {/* 썸네일 */}
                  {renderThumbnail(post)}

                  {/* 내용 */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-5 clear-left">
                    {post.content}
                  </p>

                    <div className="flex items-center text-xs text-gray-500 gap-4">
                      <Tooltip title="조회수">
                        <span className="flex items-center gap-1">
                          <EyeOutlined className="text-xs" /> {post.views.toLocaleString()}
                        </span>
                      </Tooltip>
                      <Tooltip title="좋아요">
                        <span className="flex items-center gap-1">
                          <LikeOutlined className="text-xs" /> {post.likesCount.toLocaleString()}
                        </span>
                      </Tooltip>
                      <Tooltip title="댓글">
                        <span className="flex items-center gap-1">
                          <MessageOutlined className="text-xs" /> {post.commentsCount.toLocaleString()}
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FileTextOutlined className="text-4xl text-gray-300 mb-4" />
            <p className="text-base text-gray-500 mb-4">등록된 게시글이 없습니다</p>
            <Button 
              type="primary" 
              onClick={onWritePost}
              size="middle"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-10 px-6 text-sm font-medium shadow-sm"
            >
              첫 게시글 작성하기
            </Button>
          </div>
        )}
  
        {/* 페이지네이션 */}
        {totalPosts > 0 && (
          <div className="flex justify-center mt-8">
            <Pagination
              current={currentPage}
              total={totalPosts}
              pageSize={postsPerPage}
              onChange={onPageChange}
              showSizeChanger={false}
              className="text-sm"
              size="small"
            />
          </div>
        )}
      </div>
  
      {/* 커스텀 스타일 */}
      <style jsx global>{`
        .searchbox-custom .ant-input {
          height: 40px;
          font-size: 0.9rem;
          padding: 6px 16px;
          border-radius: 8px;
          border-color: #e5e7eb;
        }
        .searchbox-custom .ant-input-search-button {
          height: 40px !important;
          padding: 0 20px !important;
          border-radius: 0 8px 8px 0 !important;
        }
        .ant-select-selector {
          height: 40px !important;
          padding: 4px 16px !important;
          border-radius: 8px !important;
          border-color: #e5e7eb !important;
        }
        .ant-select-selection-item {
          line-height: 30px !important;
          font-size: 0.9rem !important;
        }
        .ant-tag {
          margin-right: 0 !important;
          font-size: 0.75rem !important;
          line-height: 1.5 !important;
        }
      `}</style>
    </div>
  );
}