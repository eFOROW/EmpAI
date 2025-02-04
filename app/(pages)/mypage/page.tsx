"use client";

import { useEffect, useState, useCallback } from "react";
import { Button, Modal, Input } from "antd";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";

import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { MyProfile, LoginForm, Career } from "@/app/components/mypage";
import { Note } from "@/app/types/note";

const BlockNoteEditor = dynamic(
  () => import("@/app/components/note/Editor").then((mod) => mod.default),
  { ssr: false }
);

export default function Page() {
  const [control_id, setID] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [modal, contextHolder] = Modal.useModal();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditorSaving, setIsEditorSaving] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 5;
  const pageCount = Math.ceil(notes.length / pageSize);
  const currentNotes = notes.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pageCount - 1, prev + 1));
  };

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
      setID(user ? 0 : 1);
    });
  }, []);

  const confirm = () => {
    modal.confirm({
      title: "알림",
      centered: true,
      icon: <ExclamationCircleOutlined />,
      content: "정말로 로그아웃 하시겠습니까?",
      okText: "로그아웃",
      cancelText: "취소",
      okButtonProps: {
        style: {
          backgroundColor: "red",
          borderColor: "red",
          color: "white",
        },
      },
      onOk: () => {
        handleLogout();
      },
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const loadNotes = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch(`/api/note?uid=${user.uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setNotes(data.notes);
  }, [user]); // user를 의존성으로 추가

  useEffect(() => {
    if (user && control_id === 3) {
      loadNotes();
    }
  }, [user, control_id, loadNotes]);

  const createNewNote = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    await fetch("/api/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: user.uid,
        title: `새 노트 ${notes.length + 1}`,
        content: [],
      }),
    });
    loadNotes();
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;
    const token = await user.getIdToken();
    await fetch(`/api/note?noteId=${noteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadNotes();
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Modal.confirm({
      title: "노트 삭제",
      content: "정말로 이 노트를 삭제하시겠습니까?",
      centered: true,
      okText: "삭제",
      cancelText: "취소",
      okButtonProps: {
        danger: true,
      },
      onOk: () => deleteNote(noteId),
    });
  };

  const handleNoteSelection = async (noteId: string) => {
    try {
      setIsNoteLoading(true);
      if (selectedNoteId && selectedNoteId !== noteId) {
        await new Promise((resolve) => {
          const checkSaveStatus = setInterval(() => {
            if (!isEditorSaving) {
              clearInterval(checkSaveStatus);
              resolve(true);
            }
          }, 100);
        });
      }
      setSelectedNoteId(noteId);
    } finally {
      setIsNoteLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow">
        {user ? (
          <div className="w-80 min-h-screen bg-white border-r border-gray-100">
            <div className="py-12 px-6">
              {/* 헤더 섹션 - 럭셔리한 텍스트 디자인 */}
              <div className="mb-16 text-center">
                <div className="inline-block">
                  <h2 className="text-4xl font-semibold tracking-wide text-gray-900 relative">
                    My Page
                    <div className="absolute -bottom-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                  </h2>
                  <p className="mt-4 text-sx font-medium tracking-widest text-gray-500 uppercase">
                    마이페이지
                  </p>
                </div>
              </div>
              {/* 메뉴 버튼 그룹 */}
              <div className="space-y-6">
                <Button
                  type="text"
                  className={`w-full flex items-center px-5 py-4 rounded-lg
                        ${
                          control_id === 0
                            ? "bg-gray-800 text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                  onClick={() => setID(0)}
                >
                  <div className="flex items-center gap-4">
                    <UserOutlined className="text-xl" />
                    <span className="text-lg font-bold">내 정보</span>
                  </div>
                </Button>

                <Button
                  type="text"
                  className={`w-full flex items-center px-5 py-4 rounded-lg
                        ${
                          control_id === 2
                            ? "bg-gray-800 text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                  onClick={() => setID(2)}
                >
                  <div className="flex items-center gap-4">
                    <FileTextOutlined className="text-xl" />
                    <span className="text-lg font-bold">이력정보 등록</span>
                  </div>
                </Button>

                <Button
                  type="text"
                  className={`w-full flex items-center px-5 py-4 rounded-lg
                        ${
                          control_id === 3
                            ? "bg-gray-800 text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                  onClick={() => setID(3)}
                >
                  <div className="flex items-center gap-4">
                    <BookOutlined className="text-xl" />
                    <span className="text-lg font-bold">내 취업노트</span>
                  </div>
                </Button>
              </div>

              {/* 로그아웃 버튼 */}
              <div className="mt-20">
                <Button
                  onClick={confirm}
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 
                             rounded-lg border border-gray-200 text-gray-600
                             hover:border-gray-300 hover:bg-gray-50"
                >
                  <LogoutOutlined className="text-xl" />
                  <span className="text-lg font-bold">로그아웃</span>
                </Button>
              </div>
            </div>
            {contextHolder}
          </div>
        ) : null}

        <section className="flex-1 p-8">
          <div className="max-w-[1200px] mx-auto">
            {user ? (
              <>
                {control_id === 0 && <MyProfile user={user} />}
                {control_id === 2 && <Career user={user} />}
                {control_id === 3 && (
                  <div className="mx-0">
                    {/* 상단 헤더 섹션 - 더 연한 색상으로 변경 */}
                    <div className="bg-gradient-to-r from-blue-400/80 to-purple-400/80 rounded-xl p-8 mb-8 shadow-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                          <BookOutlined className="text-3xl text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl text-white font-bold">
                            나만의 취업노트 ✨
                          </h1>
                          <p className="text-white/90 mt-2">
                            면접 준비, 자기소개서, 포트폴리오 등 취업 준비에
                            필요한 모든 것을 기록해보세요.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 메인 콘텐츠 영역 */}
                    <div className="flex space-x-6">
                      {/* 노트 목록 패널 - 고정 높이 설정 */}
                      <div className="w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col max-h-[550px]">
                        {/* 노트 목록 헤더 */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">
                              내 노트 목록
                            </h3>
                            <Button
                              icon={<PlusOutlined />}
                              onClick={createNewNote}
                              type="primary"
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              새 노트
                            </Button>
                          </div>
                        </div>

                        {/* 노트 목록 - 고정 높이와 스크롤 */}
                        <div className="h-[400px] overflow-hidden">
                          {/* 현재 페이지의 노트만 표시 */}
                          {notes
                            .slice(currentPage * 5, (currentPage + 1) * 5)
                            .map((note) => (
                              <div
                                key={note._id}
                                className={`group transition-all duration-200 ${
                                  selectedNoteId === note._id
                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                    : "hover:bg-gray-50 border-l-4 border-transparent"
                                }`}
                              >
                                <div className="p-4 flex justify-between items-center">
                                  <div
                                    onClick={() =>
                                      handleNoteSelection(note._id)
                                    }
                                    className="flex-1 cursor-pointer"
                                  >
                                    <h4 className="font-medium text-gray-800 truncate">
                                      {note.title}
                                    </h4>
                                  </div>

                                  {/* 액션 버튼 */}
                                  <div
                                    className={`flex gap-2 ${
                                      selectedNoteId === note._id
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100"
                                    } transition-opacity duration-200`}
                                  >
                                    <Button
                                      icon={
                                        <EditOutlined className="text-gray-600" />
                                      }
                                      onClick={() => {
                                        Modal.confirm({
                                          title: "노트 제목 수정",
                                          centered: true,
                                          content: (
                                            <Input
                                              defaultValue={note.title}
                                              onChange={(e) => {
                                                (e.target as any).value =
                                                  e.target.value;
                                              }}
                                            />
                                          ),
                                          async onOk(close) {
                                            const input =
                                              document.querySelector(
                                                ".ant-modal-content input"
                                              ) as HTMLInputElement;
                                            const newTitle = input.value;
                                            if (
                                              newTitle &&
                                              newTitle !== note.title
                                            ) {
                                              const token =
                                                await user?.getIdToken();
                                              await fetch("/api/note", {
                                                method: "POST",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                  Authorization: `Bearer ${token}`,
                                                },
                                                body: JSON.stringify({
                                                  uid: user?.uid,
                                                  noteId: note._id,
                                                  title: newTitle,
                                                }),
                                              });
                                              loadNotes();
                                            }
                                          },
                                          okText: "수정",
                                          cancelText: "취소",
                                        });
                                      }}
                                      type="text"
                                      className="hover:bg-blue-50"
                                    />
                                    <Button
                                      icon={
                                        <DeleteOutlined className="text-red-500" />
                                      }
                                      onClick={() => handleDeleteNote(note._id)}
                                      type="text"
                                      className="hover:bg-red-50"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* 페이지네이션 */}
                        <div className="border-t border-gray-100 p-4 mt-auto">
                          <div className="flex justify-center gap-2">
                            <Button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(0, prev - 1))
                              }
                              disabled={currentPage === 0}
                              type="text"
                              className="hover:bg-blue-50"
                            >
                              이전
                            </Button>
                            <span className="flex items-center px-3 bg-gray-50 rounded">
                              {currentPage + 1} / {Math.ceil(notes.length / 5)}
                            </span>
                            <Button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(
                                    Math.ceil(notes.length / 5) - 1,
                                    prev + 1
                                  )
                                )
                              }
                              disabled={
                                currentPage >= Math.ceil(notes.length / 5) - 1
                              }
                              type="text"
                              className="hover:bg-blue-50"
                            >
                              다음
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* 에디터 영역 */}
                      <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-h-[550px] ">
                        {isNoteLoading ? (
                          <div className="flex items-center justify-center h-[600px] bg-gray-50">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                              <h2 className="text-xl font-semibold text-gray-700">
                                노트 불러오는 중...
                              </h2>
                            </div>
                          </div>
                        ) : selectedNoteId ? (
                          <BlockNoteEditor
                            noteId={selectedNoteId}
                            onSaveStart={() => setIsEditorSaving(true)}
                            onSaveEnd={() => setIsEditorSaving(false)}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50">
                            <BookOutlined className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-xl font-medium text-gray-600 mb-2">
                              노트를 선택해주세요
                            </h3>
                            <p className="text-gray-500">
                              왼쪽 목록에서 노트를 선택하거나 새로운 노트를
                              만들어보세요
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <LoginForm />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
