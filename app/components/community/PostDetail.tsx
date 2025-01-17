'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Avatar, Tag, message, Spin, Input, Pagination ,Modal} from 'antd';
import { 
  EyeOutlined, 
  LikeOutlined, 
  LikeFilled,
  MessageOutlined, 
  EditOutlined,
  CloseOutlined,
  SendOutlined,
  DeleteOutlined  
} from '@ant-design/icons';
import getCurrentUser from '@/lib/firebase/auth_state_listener';

const { TextArea } = Input;

interface PostDetailProps {
  postId: string;
  onClose?: () => void;
  onEdit?: () => Promise<boolean>; // 수정 성공 여부를 반환하는 함수
  onUpdate?: () => Promise<void>;
  shouldRefresh?: boolean; // 강제 새로고침을 위한 prop
  onEditSuccess?: (updatedPost: any) => void; // 수정 성공 시 호출되는 콜백
  onDelete?: () => Promise<void>;
}

export default function PostDetail({ 
  postId, 
  onClose, 
  onEdit, 
  onUpdate, 
  shouldRefresh = false,
  onEditSuccess // 새로운 prop 추가
}: PostDetailProps) {
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const commentsPerPage = 5;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [originalPosts, setOriginalPosts] = useState<any[]>([]);

  const fetchPost = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        message.error('로그인이 필요합니다.');
        setLoading(false);
        return null;
      }
  
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/community/posts?id=${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '게시글을 불러오는데 실패했습니다.');
      }
  
      const data = await response.json();
      
      // 게시글 상태 직접 업데이트
      setPost(data);
      setUser(currentUser);
  
      // onUpdate 콜백 호출
      if (onUpdate) {
        await onUpdate();
      }
  
      return data; // 가져온 데이터 반환
    } catch (error) {
      console.error('게시글 불러오기 오류:', error);
      message.error(error instanceof Error ? error.message : '게시글을 불러오는데 실패했습니다.');
      throw error; // 오류 다시 throw
    } finally {
      setLoading(false);
    }
  }, [postId, onUpdate]);

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        fetchPost();
      }
    };
    init();
  }, [fetchPost, postId, shouldRefresh]);

  const handleEdit = async () => {
    try {
      if (onEdit) {
        const editSuccess = await onEdit();
        
        if (editSuccess) {
          // 즉시 최신 게시글 데이터로 업데이트
          const updatedPost = await fetchPost();
          
          if (updatedPost) {
            // 수정 성공 콜백 호출
            if (onEditSuccess) {
              onEditSuccess(updatedPost);
            }
            
            // 선택적으로 onUpdate 호출
            if (onUpdate) {
              await onUpdate();
            }
            
            
          }
        }
      }
    } catch (error) {
      console.error('게시글 수정 중 오류:', error);
      message.error('게시글 수정에 실패했습니다.');
    }
  };

  // 나머지 코드는 이전과 동일
  const isLikedByCurrentUser = useMemo(() => {
    return post?.likes?.includes(user?.uid);
  }, [post?.likes, user?.uid]);

  const handleLike = async () => {
    if (!user) {
      message.error('로그인이 필요합니다.');
      return;
    }

    setLikeLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/community/like_comment?id=${postId}&action=like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '좋아요 처리에 실패했습니다.');
      }

      setPost((prevPost: any) => ({
        ...prevPost,
        likes: data.likes
      }));

      message.success(data.message);
      if (onUpdate) await onUpdate();  
    } catch (error) {
      console.error('Like error:', error);
      message.error('좋아요 처리에 실패했습니다.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      message.warning('댓글 내용을 입력해주세요.');
      return;
    }

    setSendingComment(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/community/like_comment?id=${postId}&action=comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: comment,
          authorName: user.displayName || user.email?.split('@')[0]
        })
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      message.success('댓글이 등록되었습니다.');
      setComment('');
      fetchPost();
    } catch (error) {
      message.error('댓글 등록에 실패했습니다.');
    } finally {
      setSendingComment(false);
    }
  };

 const handleDelete = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/community/posts?id=${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '게시글 삭제에 실패했습니다.');
      }

      
      message.success('게시글이 삭제되었습니다.');
      setDeleteModalVisible(false); // 삭제 후 모달 닫기
      if (onClose) onClose(); // 삭제 후 창을 닫기
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      message.error(error instanceof Error ? error.message : '게시글 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const showDeleteModal = () => {
    setDeleteModalVisible(true);
  };

  const handleCancel = () => {
    setDeleteModalVisible(false);
  };

  // ... 이하 컴포넌트의 나머지 부분은 이전 코드와 동일
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'tech': 'blue',
      'career': 'purple',
      'interview': 'green',
      'life': 'pink'
    };
    return colors[category] || 'purple';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  // 나머지 렌더링 부분은 이전 코드와 동일
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* 게시글 헤더 */}
      <div className="relative p-8 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${post?.author?.name}`}
              size={44}
              className="border-2 border-purple-100"
            />
            <div>
              <div className="font-semibold text-lg text-gray-900">
                {post?.author?.name}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(post?.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
          {post?.category && (
            <Tag 
              color={getCategoryColor(post.category)}
              className="px-4 py-1 text-sm rounded-full"
            >
              {post.category}
            </Tag>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {post?.title}
        </h1>

        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-8">
          {post?.content}
        </p>
        {/* 좋아요, 조회수, 댓글 수 표시 부분 */}
        <div className="flex items-center gap-6 text-base">
          <Button
            onClick={handleLike}
            icon={<LikeOutlined />}
            loading={likeLoading}
            className={`flex items-center gap-2 ${isLikedByCurrentUser ? 'text-blue-500' : ''}`}
          >
            좋아요 {post?.likes?.length || 0}
          </Button>
          <span className="flex items-center gap-1 text-gray-500">
            <EyeOutlined /> {post?.views}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <MessageOutlined /> {post?.comments?.length || 0}
          </span>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="p-8 bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MessageOutlined className="text-purple-500" />
          댓글 {post?.comments?.length || 0}개
        </h3>

        {/* 댓글 작성 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="댓글을 작성해주세요..."
            rows={3}
            className="mb-4 resize-none border-2 hover:border-purple-400 focus:border-purple-500"
          />
          <div className="flex justify-end">
            <Button
              type="primary"
              onClick={handleComment}
              loading={sendingComment}
              icon={<SendOutlined />}
              className="bg-purple-600 hover:bg-purple-700 h-10 px-6 flex items-center gap-2"
            >
              댓글 작성
            </Button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {post?.comments
            ?.slice(
              (currentCommentPage - 1) * commentsPerPage,
              currentCommentPage * commentsPerPage
            )
            .map((comment: any, index: number) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar 
                    size={32} 
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author.name}`}
                    className="border border-purple-100"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {comment.author.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 pl-11">{comment.content}</p>
              </div>
            ))}

          {post?.comments?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <MessageOutlined className="text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                첫 번째 댓글을 작성해보세요!
              </p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {post?.comments?.length > commentsPerPage && (
          <div className="flex justify-center mt-8">
            <Pagination
              current={currentCommentPage}
              total={post?.comments?.length}
              pageSize={commentsPerPage}
              onChange={(page) => setCurrentCommentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-3 p-6 bg-white border-t border-gray-100">
        <Button 
          onClick={onClose}
          className="hover:bg-gray-100 h-10 px-6"
          icon={<CloseOutlined />}
        >
          닫기
        </Button>
        {user?.uid === post?.author?.uid && (
          <Button
            type="primary"
            onClick={handleEdit}
            className="bg-purple-600 hover:bg-purple-700 h-10 px-6 flex items-center gap-2"
            icon={<EditOutlined />}
          >
            수정
          </Button>
        )}
        {user?.uid === post?.author?.uid && (
          <Button
          onClick={showDeleteModal}
          className="bg-red-600 hover:bg-red-700 h-10 px-6 flex items-center gap-2"
          icon={<DeleteOutlined />}
        >
          삭제
        </Button>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        title="게시글 삭제"
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        confirmLoading={deleting}
        okText="삭제"
        cancelText="취소"
      >
        <p>정말로 게시글을 삭제하시겠습니까?</p>
      </Modal>

      {/* 커스텀 스타일 */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        .ant-btn-primary {
          background: #8b5cf6 !important;
        }
        .ant-btn-primary:hover {
          background: #7c3aed !important;
        }
      `}</style>
    </div>
  );
};