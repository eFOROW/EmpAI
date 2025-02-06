'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, message, Spin, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { User } from 'firebase/auth';
import getCurrentUser from '@/lib/firebase/auth_state_listener';
import PostList from '@/app/components/community/PostList';
import PostDetail from '@/app/components/community/PostDetail';
import WritePost from '@/app/components/community/WritePost';
import EditPost from '@/app/components/community/EditPost';

const { Search } = Input;
const { Option } = Select;

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: {
    uid: string;
    name: string;
    email: string;
    imgUrl: string;
  };
  views: number;
  likesCount: number;
  commentsCount: number;
  isDeleted: boolean;
  createdAt: Date;  // string에서 Date로 변경
  updatedAt: Date;  // string에서 Date로 변경
  __v: number;
  image?: {
    data: Buffer;
    thumbnail: Buffer;
    contentType: string;
    dimensions?: {
      width: number;
      height: number;
    };
  url: {
    imgurl: String,
    imageType: String,
    };
  };
}



export default function CommunityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPosts, setCurrentPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showWritePost, setShowWritePost] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [refreshDetail, setRefreshDetail] = useState(false);
  const postsPerPage = 10;
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const resetWritePostStates = useCallback(() => {
    setShowWritePost(false);
    setSelectedPost(null);
  }, []);

  
  const fetchPosts = useCallback(async () => {
    if (!user) return [];  // 빈 배열 반환
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/community/posts?page=${currentPage}&limit=${postsPerPage}&category=${selectedCategory}&sortBy=${sortBy}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
    
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      
      if (data.posts && typeof data.total === 'number') {
        const formattedPosts = data.posts.map((post: Post) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt)
        }));
  
        setCurrentPosts(formattedPosts);
        setTotalPosts(data.total);
        setAllPosts(data.posts);
  
        return data.posts;  // 데이터 반환 추가
      }
      return [];  // 데이터가 없을 경우 빈 배열 반환
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      message.error('게시글을 불러오는 데 실패했습니다.');
      return [];  // 에러 발생 시 빈 배열 반환
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, postsPerPage, selectedCategory, sortBy]);
  // 검색 전용 함수 추가
  const onSearch = useCallback((value: string) => {
    if (!value.trim()) {
      // 검색어가 없을 경우 전체 게시글 보여주기
      setCurrentPosts(allPosts);
      setTotalPosts(allPosts.length);
      setSearchQuery('');
      return;
    }
  
    const lowercasedValue = value.toLowerCase();
    const filteredPosts = allPosts.filter(post =>
      post.title.toLowerCase().includes(lowercasedValue) ||
      post.content.toLowerCase().includes(lowercasedValue) ||
      post.author.name.toLowerCase().includes(lowercasedValue)
    );
  
    setSearchQuery(value);
    setCurrentPosts(filteredPosts);
    setCurrentPage(1);
    setTotalPosts(filteredPosts.length);
  }, [allPosts]);
  
  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);;

  

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };
  
    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-gray-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md w-full">
          <ExclamationCircleOutlined className="text-6xl text-blue-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            로그인 필요
          </h2>
          <p className="text-gray-600 mb-8">
            커뮤니티 게시판은 로그인 후 이용 가능합니다.
          </p>
          <Button 
            type="primary"
            href="/mypage"
            size="large"
            className="w-full h-12 text-lg bg-blue-500"
          >
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0">
      <main className="w-full px-0">
      <PostList 
        user={user}
        currentPosts={currentPosts}
        totalPosts={totalPosts}
        currentPage={currentPage}
        onSearch={onSearch}
        onSortChange={setSortBy}
        onPostClick={(post) => {
            setSelectedPost(post);
            setShowDetail(true);
        }}
        onWritePost={() => setShowWritePost(true)}
        onCategoryChange={setSelectedCategory}
        onPageChange={setCurrentPage}
        selectedCategory={selectedCategory}
        isLoading={isLoading}  // 추가된 prop
        />
      </main>

      <Modal
        title=""
        open={showWritePost}
        onCancel={() => setShowWritePost(false)}
        
        height="40vw"
        footer={null}
        width="65vw"
        afterClose={resetWritePostStates}
        
      >
       <WritePost
        isModalMode={true} 
        isVisible={showWritePost}  // showWritePost를 isVisible로 사용
        onSuccess={() => {
          setShowWritePost(false);
          fetchPosts();
        }}
        onCancel={() => setShowWritePost(false)}
      />
      </Modal>

      <Modal
      open={showDetail}
      onCancel={() => {
        setShowDetail(false);
        setRefreshDetail(false);
      }}
      footer={null}
      width={800}
      closeIcon={false}  // X 버튼 제거
    >
      {selectedPost && (
        <PostDetail
          postId={selectedPost._id}
          onClose={() => setShowDetail(false)}
          onEdit={async () => {
            setShowDetail(false);
            setShowEdit(true);
            return true;
          }}
          shouldRefresh={refreshDetail}
          onUpdate={fetchPosts}
        />
      )}
    </Modal>

      {/* 수정하기 모달 */}
      <Modal
        
        title="게시글 수정"
        open={showEdit}
        onCancel={() => {
          setShowEdit(false);
          setShowDetail(true);
        }}
        height="40vw"
        footer={null}
        width="50vw"
      >
        {selectedPost && (
          <EditPost
            postId={selectedPost._id}
            onSuccess={async (updatedPost) => {
              try {
                // 1. 게시글 목록 업데이트
                const latestPosts = await fetchPosts();
                
                // 2. 선택된 게시글 정보 업데이트
                const freshUpdatedPost = latestPosts.find(
                  (post: Post) => post._id === updatedPost._id
                );
                
                if (freshUpdatedPost) {
                  setSelectedPost(freshUpdatedPost);
                }
                
                // 3. 상세보기 모달로 전환 및 갱신 플래그 설정
                setShowEdit(false);
                setRefreshDetail(true);
                setShowDetail(true);
                
                message.success('게시글이 성공적으로 수정되었습니다.');
              } catch (error) {
                console.error('게시글 업데이트 중 오류:', error);
                message.error('게시글 업데이트에 실패했습니다.');
              }
            }}
            onCancel={() => {
              setShowEdit(false);
              setShowDetail(true);
            }}
          />
        )}
      </Modal>

      

      <style jsx global>{`
        .searchbox-custom .ant-input-search-button {
          background-color: #6B46C1;
          border-color: #6B46C1;
        }
        .searchbox-custom .ant-input-search-button:hover {
          background-color: #553C9A;
          border-color: #553C9A;
        }
      `}</style>
    </div>
  );
}