"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Avatar,
  Tag,
  message,
  Spin,
  Input,
  Pagination,
  Modal,
} from "antd";
import Image from "next/image";
import {
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  EditOutlined,
  CloseOutlined,
  SendOutlined,
  DeleteOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import getCurrentUser from "@/lib/firebase/auth_state_listener";

const { TextArea } = Input;

interface PostDetailProps {
  postId: string;
  onClose?: () => void;
  onEdit?: () => Promise<boolean>;
  onUpdate?: () => Promise<void>;
  shouldRefresh?: boolean;
  onEditSuccess?: (updatedPost: any) => void;
  onDelete?: () => Promise<void>;
}

export const getAuthorImage = (uid: string): Promise<string | null> => {
  return getCurrentUser().then(async (currentUser) => {
    if (!currentUser) return null;

    const token = await currentUser.getIdToken();
    try {
      const response = await fetch(`/api/community/user_image?uid=${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await response.json();
      return userData.imgUrl;
    } catch (error) {
      console.error("이미지 가져오기 오류:", error);
      return null;
    }
  });
};

export default function PostDetail({
  postId,
  onClose,
  onEdit,
  onUpdate,
  shouldRefresh = false,
  onEditSuccess,
}: PostDetailProps) {
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const commentsPerPage = 10;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const isInitialMount = useRef(true);
  const previousPostId = useRef(postId);

  const [authorImageUrl, setAuthorImageUrl] = useState<string | null>(null);

  // 게시글 이미지 렌더링 함수
  const renderPostImage = useCallback((post: any) => {
    // URL 또는 Base64 이미지 확인
    const imageSrc = post.url?.imgurl || post.imageUrl;

    if (!imageSrc) {
      return null;
    }

    // URL 이미지인 경우 바로 사용
    if (post.url?.imgurl) {
      return (
        <div className="mb-6 rounded-lg overflow-hidden relative w-full aspect-video">
          <Image
            src={imageSrc}
            alt="게시글 이미지"
            fill
            priority
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.error("이미지 로드 실패:", e);
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      );
    }

    // Base64 이미지 처리
    if (!imageSrc.startsWith("data:image/")) {
      console.error("잘못된 이미지 형식:", imageSrc.substring(0, 50));
      return null;
    }

    return (
      <div className="mb-6 rounded-lg overflow-hidden relative w-full aspect-video">
        <Image
          src={imageSrc}
          alt="게시글 이미지"
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            console.error("이미지 로드 실패:", e);
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>
    );
  }, []);

  const fetchPost = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        message.error("로그인이 필요합니다.");
        setLoading(false);
        return null;
      }

      setUser(currentUser);
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/community/posts?id=${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("게시글을 불러오는데 실패했습니다.");
      }

      const data = await response.json();

      const postWithAuthorImage = {
        ...data,
        author: {
          ...data.author,
          imgUrl: await getAuthorImage(data.author.uid),
        },
      };

      setPost(postWithAuthorImage);
      return postWithAuthorImage;
    } catch (error) {
      console.error("게시글 불러오기 오류:", error);
      message.error("게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      setLoading(true);
      await fetchPost();
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchPost, shouldRefresh]);

  useEffect(() => {
    if (
      isInitialMount.current ||
      previousPostId.current !== postId ||
      shouldRefresh
    ) {
      if (user) {
        fetchPost();
      }
      setIsCommentsVisible(false);
      isInitialMount.current = false;
      previousPostId.current = postId;
    }
  }, [user, postId, fetchPost, shouldRefresh]);

  const fetchComments = useCallback(
    async (page = 1) => {
      interface Comment {
        author: {
          uid: string;
          name: string;
          imgUrl?: string;
        };
        content: string;
        createdAt: string;
        _id: string;
      }

      if (!user) return;

      setCommentsLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `/api/community/like_comment?id=${postId}&action=comments&page=${page}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "댓글을 불러오는데 실패했습니다."
          );
        }

        const data = await response.json();
        const uidImageMap = new Map<string, string | null>();

        // 중복 UID 제거를 위해 Set 사용
        const uniqueUids = Array.from(
          new Set(data.comments.map((comment: Comment) => comment.author.uid))
        ) as string[];

        // 각 고유 UID에 대해 한 번만 이미지 요청
        await Promise.all(
          uniqueUids.map(async (uid) => {
            const imgUrl = await getAuthorImage(uid);
            uidImageMap.set(uid, imgUrl);
          })
        );

        const commentsWithImages = data.comments.map((comment: Comment) => ({
          ...comment,
          author: {
            ...comment.author,
            imgUrl: uidImageMap.get(comment.author.uid),
          },
        }));

        setComments(commentsWithImages || []);
        setTotalComments(data.total || 0);
        setIsCommentsVisible(true);
        setCurrentCommentPage(page);

        return {
          total: data.total,
          page: data.page,
          limit: data.limit,
        };
      } catch (error) {
        console.error("댓글 불러오기 오류:", error);
        message.error("댓글을 불러오는데 실패했습니다.");
      } finally {
        setCommentsLoading(false);
      }
    },
    [postId, user]
  );

  const handleEdit = async () => {
    try {
      if (onEdit) {
        const editSuccess = await onEdit();

        if (editSuccess) {
          const updatedPost = await fetchPost();

          if (updatedPost) {
            if (onEditSuccess) {
              onEditSuccess(updatedPost);
            }

            if (onUpdate) {
              await onUpdate();
            }
          }
        }
      }
    } catch (error) {
      console.error("게시글 수정 중 오류:", error);
      message.error("게시글 수정에 실패했습니다.");
    }
  };

  const handleLike = async () => {
    if (!user) {
      message.error("로그인이 필요합니다.");
      return;
    }

    setLikeLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/community/like_comment?id=${postId}&action=like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "좋아요 처리에 실패했습니다.");
      }

      // 서버에서 반환된 좋아요 카운트로 업데이트
      setPost((prevPost: any) => ({
        ...prevPost,
        likesCount: data.likesCount,
        liked: !prevPost.liked, // 토글 로직
      }));

      message.success(data.message);

      if (onUpdate) await onUpdate();
    } catch (error) {
      console.error("Like error:", error);
      message.error("좋아요 처리에 실패했습니다.");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      message.warning("댓글 내용을 입력해주세요.");
      return;
    }

    setSendingComment(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(
        `/api/community/like_comment?id=${postId}&action=comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: comment,
            authorName: user.displayName || user.email?.split("@")[0],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "댓글 등록에 실패했습니다.");
      }

      message.success("댓글이 등록되었습니다.");
      setComment("");

      setPost((prevPost: any) => ({
        ...prevPost,
        commentsCount: (prevPost.commentsCount || 0) + 1,
      }));

      if (currentCommentPage !== 1) {
        await fetchComments(1);
      } else {
        // 댓글 추가 전에 이미지 URL을 먼저 가져옴
        const authorImgUrl = await getAuthorImage(user.uid);

        setComments((prevComments: any[]) => [
          {
            _id: data._id,
            content: comment,
            author: {
              uid: user.uid,
              name: user.displayName || user.email?.split("@")[0],
              imgUrl: authorImgUrl, // 가져온 이미지 URL 사용
            },
            createdAt: new Date().toISOString(),
          },
          ...prevComments,
        ]);
      }

      if (onUpdate) await onUpdate();
    } catch (error) {
      message.error("댓글 등록에 실패했습니다.");
      console.error("Comment error:", error);
    } finally {
      setSendingComment(false);
    }
  };

  const getImageSource = (imgUrl: string) => {
    if (!imgUrl) {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${post?.author?.name}`;
    }

    if (imgUrl.startsWith("upload:")) {
      const base64Data = imgUrl.split("upload:")[1];
      if (!base64Data.startsWith("data:")) {
        return `data:image/png;base64,${base64Data}`;
      }
      return base64Data;
    }

    return imgUrl;
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(
        `/api/community/like_comment?id=${postId}&action=delete_comment&commentId=${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "댓글 삭제에 실패했습니다.");
      }

      message.success("댓글이 삭제되었습니다.");
      await fetchComments(currentCommentPage);

      setPost((prevPost: any) => ({
        ...prevPost,
        commentsCount: (prevPost.commentsCount || 1) - 1,
      }));

      if (onUpdate) await onUpdate();
    } catch (error) {
      message.error("댓글 삭제에 실패했습니다.");
      console.error("Comment delete error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/community/posts?id=${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("게시글 삭제에 실패했습니다.");
      }

      message.success("게시글이 삭제되었습니다.");
      setDeleteModalVisible(false);

      if (onUpdate) await onUpdate();
      if (onClose) onClose();
    } catch (error) {
      console.error("게시글 삭제 오류:", error);
      message.error("게시글 삭제에 실패했습니다.");
    }
  };

  const handleClose = () => {
    setIsCommentsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const showDeleteModal = () => {
    setDeleteModalVisible(true);
  };

  const handleCancel = () => {
    setDeleteModalVisible(false);
  };

  const toggleComments = () => {
    if (!isCommentsVisible) {
      fetchComments();
    } else {
      setIsCommentsVisible(false);
    }
  };

  const handleCommentPageChange = (page: number) => {
    fetchComments(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* 게시글 헤더 */}
      <div className="relative px-8 pt-8 pb-6">
        {/* 카테고리 및 상태 표시 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {post?.category && (
              <Tag
                color={getCategoryColor(post.category)}
                className="px-3 py-1 rounded-full text-sm font-medium border-0"
              >
                {post.category}
              </Tag>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <EyeOutlined className="text-gray-400" />
              <span>{post?.views?.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.uid === post?.author?.uid && (
              <>
                <Button
                  type="text"
                  onClick={handleEdit}
                  icon={<EditOutlined />}
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  수정
                </Button>
                <Button
                  type="text"
                  onClick={showDeleteModal}
                  icon={<DeleteOutlined />}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  삭제
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 제목 및 작성자 정보 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {post?.title}
          </h1>
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <Avatar
                src={getImageSource(post?.author?.imgUrl || "")}
                size={40}
                className="border-2 border-purple-100"
              >
                {post?.author?.name?.[0] || "U"}
              </Avatar>
              <div>
                <div className="font-medium text-gray-900">
                  {post?.author?.name || "익명"}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(post?.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* 상호작용 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLike}
                loading={likeLoading}
                className="h-9 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <LikeOutlined />
                <span>{post?.likesCount || 0}</span>
              </Button>
              <Button
                onClick={toggleComments}
                className={`h-9 px-4 rounded-full flex items-center gap-2 transition-colors
                  ${
                    isCommentsVisible
                      ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                      : "text-gray-600 hover:text-blue-600 hover:border-blue-200"
                  }`}
              >
                <CommentOutlined
                  className={isCommentsVisible ? "text-blue-600" : ""}
                />
                댓글보기
                <span>{post?.commentsCount || 0}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="px-8 py-6 text-gray-800">
        {/* 이미지 렌더링 */}
        {renderPostImage(post)}

        {/* 텍스트 내용 */}
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {post?.content}
        </div>
      </div>

      {/* 댓글 섹션 */}
      {isCommentsVisible && (
        <div className="bg-gray-50 border-t border-gray-100">
          {/* 댓글 작성 */}
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <TextArea
                rows={3}
                placeholder="댓글을 작성해주세요..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4 border-gray-200 hover:border-purple-300 focus:border-purple-400"
              />
              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={handleComment}
                  loading={sendingComment}
                  icon={<SendOutlined />}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 h-9 px-5"
                >
                  댓글 등록
                </Button>
              </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-5 rounded-xl shadow-sm hover:shadow transition-shadow duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      size={32}
                      src={getImageSource(comment.author.imgUrl || "")}
                      className="mt-1"
                    >
                      {comment.author.name?.[0] || "U"}
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-sm text-gray-500 ml-3">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {user?.uid === comment.author.uid && (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleCommentDelete(comment._id)}
                          />
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                  <MessageOutlined className="text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500">첫 번째 댓글을 작성해보세요!</p>
                </div>
              )}
            </div>
            {/* 페이지네이션 */}
            {totalComments > commentsPerPage && (
              <div className="w-full flex justify-center mt-6">
                <div className="flex justify-center items-center w-auto">
                  <Pagination
                    current={currentCommentPage}
                    total={totalComments}
                    pageSize={commentsPerPage}
                    onChange={handleCommentPageChange}
                    showSizeChanger={false}
                    className="custom-pagination !flex !justify-center"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 닫기 버튼 */}
      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex justify-end">
          <Button onClick={handleClose} className="h-9 px-5 hover:bg-gray-50">
            닫기
          </Button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-gray-800">
            <DeleteOutlined className="text-red-500" />
            게시글 삭제
          </div>
        }
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        confirmLoading={deleting}
        okText="삭제"
        cancelText="취소"
        okButtonProps={{
          className: "bg-red-500 hover:bg-red-600 border-0",
        }}
      >
        <p className="text-gray-600">정말로 이 게시글을 삭제하시겠습니까?</p>
      </Modal>

      {/* 커스텀 스타일 */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.2) transparent; /* 투명도를 낮춰서 약하게 */
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(139, 92, 246, 0.2); /* 투명도 조정 */
          border-radius: 3px;
        }
        .custom-pagination {
          display: flex !important;
          justify-content: center !important;
          width: 100%;
        }

        .custom-pagination .ant-pagination-prev,
        .custom-pagination .ant-pagination-next,
        .custom-pagination .ant-pagination-item {
          margin: 0 4px;
        }
      `}</style>
    </div>
  );
}

// 카테고리 색상 매핑 함수
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    tech: "blue",
    career: "purple",
    interview: "green",
    life: "pink",
  };
  return colors[category] || "purple";
}
