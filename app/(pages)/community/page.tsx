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

const HeaderSection = () => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 opacity-90" />
      <div className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            취업 커뮤니티
          </h1>
          <div className="mt-6 space-y-4">
            <p className="text-xm text-gray-100">
              취업을 준비하는 취준생들을 위한 이야기 공간
            </p>
            <p className="text-xl text-gray-100">
              면접 후기부터 기술 스택까지, 모든 정보를 공유해요
            </p>
            <p className="text-xl text-gray-100">
              여러분의 소중한 경험이 다른 누군가에게 힘이 됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const postsPerPage = 5;
  
  const resetWritePostStates = useCallback(() => {
    setShowWritePost(false);
    setSelectedPost(null);
  }, []);

  
  const fetchPosts = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/community/posts?page=${currentPage}&limit=${postsPerPage}&category=${selectedCategory}&sortBy=${sortBy}&search=${searchQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
    
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      
      if (data.posts && typeof data.total === 'number') {
        // createdAt과 updatedAt을 Date 객체로 변환
        const formattedPosts = data.posts.map((post: Post) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt)
        }));
  
        setCurrentPosts(formattedPosts);
        setTotalPosts(data.total);
      }
    
      return data.posts;
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      message.error('게시글을 불러오는 데 실패했습니다.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, postsPerPage, selectedCategory, sortBy, searchQuery]);
  
  
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
    <div className="min-h-screen bg-[#f8f9fc]">
      <HeaderSection />

      <main className="max-w-7xl mx-auto px-3 -mt-5">
      <PostList 
        user={user}
        currentPosts={currentPosts}
        totalPosts={totalPosts}
        currentPage={currentPage}
        onSearch={(value) => {
          setSearchQuery(value);
          setCurrentPage(1); // 페이지 리셋 추가
        }}
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
        title="새 글 작성"
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