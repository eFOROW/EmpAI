'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, message, Spin, Avatar, Tag, Modal, Form } from 'antd';
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { User } from 'firebase/auth';
import getCurrentUser from '@/lib/firebase/auth_state_listener';
import Image from 'next/image';
import { ArrowRight, Users, Clock, MessageSquare } from 'lucide-react';
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
  author: {
    uid: string;
    name: string;
    email: string;
  };
  views: number;
  likes: string[];
  comments: any[];
  createdAt: Date;
  category?: string;
}

interface PostDetailProps {
  postId: string;
  onClose?: () => void;
  onEdit?: () => void;
  onUpdate?: () => Promise<void>;
}


const HeaderSection = () => {
    return (
      <div className="relative w-full">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 opacity-90" />
        
        {/* 메인 컨텐츠 */}
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              취업 커뮤니티
            </h1>
            <div className="mt-6 space-y-4">
              <p className="text-xl text-gray-100">
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
    const [originalPosts, setOriginalPosts] = useState<Post[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('latest');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [showWritePost, setShowWritePost] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const categories = [
      { key: 'all', label: '전체' },
      { key: 'tech', label: '기술' },
      { key: 'career', label: '커리어' },
      { key: 'interview', label: '면접' },
      { key: 'life', label: '라이프' },
    ];

    const fetchPosts = useCallback(async () => {
        if (!user) return;
        
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/community/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
      
            if (!response.ok) throw new Error('Failed to fetch posts');
            
            const data = await response.json();
            
            // 중요: 즉시 상태를 최신 데이터로 업데이트
            setOriginalPosts(data);
            setPosts(data);
      
            // 여기서 최신 데이터 반환
            return data;
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            message.error('게시글을 불러오는 데 실패했습니다.');
            return [];
        }
      }, [user]);

    useEffect(() => {
      let filteredPosts = [...originalPosts];

      if (selectedCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => 
          post.category === selectedCategory
        );
      }

      if (searchQuery) {
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      switch (sortBy) {
        case 'views':
          filteredPosts.sort((a, b) => b.views - a.views);
          break;
        case 'likes':
          filteredPosts.sort((a, b) => b.likes.length - a.likes.length);
          break;
        default:
          filteredPosts.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }

      setPosts(filteredPosts);
    }, [originalPosts, selectedCategory, searchQuery, sortBy]);

    const handleDelete = async () => {
        try {
            const token = await user?.getIdToken();
            const response = await fetch(`/api/community/posts?id=${selectedPost?._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete post');

            message.success('게시글이 삭제되었습니다.');
            setShowDeleteConfirm(false);
            setShowDetail(false);
            fetchPosts();
        } catch (error) {
            message.error('게시글 삭제에 실패했습니다.');
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                if (currentUser) {
                    fetchPosts();
                }
            } catch (error) {
                console.error('Auth error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [fetchPosts]);

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

            <main className="max-w-7xl mx-auto px-4 -mt-8">
                <PostList 
                    user={user}
                    posts={posts}
                    onSearch={setSearchQuery}
                    onSortChange={setSortBy}
                    onPostClick={(post) => {
                        setSelectedPost(post);
                        setShowDetail(true);
                    }}
                    onWritePost={() => setShowWritePost(true)}
                    onCategoryChange={setSelectedCategory}
                    selectedCategory={selectedCategory}
                />
            </main>

            {/* 모달들 */}
            <Modal
                title="새 글 작성"
                open={showWritePost}
                onCancel={() => setShowWritePost(false)}
                footer={null}
                width={800}
            >
                <WritePost 
                    onSuccess={() => {
                        setShowWritePost(false);
                        fetchPosts();
                    }}
                    onCancel={() => setShowWritePost(false)}
                />
            </Modal>

            <Modal
                title={selectedPost?.title}
                open={showDetail}
                onCancel={() => setShowDetail(false)}
                footer={null}
                width={800}
                key={selectedPost?._id}
            >
                {selectedPost && (
                  <PostDetail
                  postId={selectedPost._id}
                  onClose={() => setShowDetail(false)}
                  onEdit={async () => {
                      setShowDetail(false);
                      setShowEdit(true);
                      return Promise.resolve(true); // Return a Promise<boolean>
                  }}
                  onUpdate={fetchPosts}
              />
                )}
            </Modal>

            <Modal
            title="게시글 수정"
            open={showEdit}
            onCancel={() => {
                setShowEdit(false);
                setShowDetail(true);
            }}
            footer={null}
            width={800}
        >
            {selectedPost && (
                <EditPost
                    postId={selectedPost._id}
                    onSuccess={async (updatedPost) => {
                        // 1. 최신 게시글 목록을 즉시 가져옴
                        const latestPosts = await fetchPosts();
                        
                        // 2. 최신 목록에서 수정된 게시글을 찾아 선택
                        const freshUpdatedPost = latestPosts.find(
                            (post: Post) => post._id === updatedPost._id
                        );
                        
                        // 3. 선택된 게시글을 최신 데이터로 업데이트
                        if (freshUpdatedPost) {
                            setSelectedPost(freshUpdatedPost);
                        }
                        
                        // 4. 수정 모달 닫기
                        setShowEdit(false);
                        
                        // 5. 상세보기 모달 다시 열기
                        setShowDetail(true);

                        // 6. 성공 메시지 표시
                        message.success('게시글이 성공적으로 수정되었습니다.');
                    }}
                    onCancel={() => {
                        setShowEdit(false);
                        setShowDetail(true);
                    }}
                />
            )}
        </Modal>

            <Modal
                title="게시글 삭제"
                open={showDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(false)}
                onOk={handleDelete}
                okText="삭제"
                cancelText="취소"
                okButtonProps={{ danger: true }}
            >
                <p>정말로 이 게시글을 삭제하시겠습니까?</p>
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