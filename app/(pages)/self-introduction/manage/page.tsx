"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { useRouter } from "next/navigation";
import { Card, Col, Row, Typography, Input, Modal, Button, Spin } from "antd";
import {
  LeftOutlined,
  ExclamationCircleOutlined,
  CloseOutlined,
  EllipsisOutlined,
  CodeOutlined,
  ProjectOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  SketchOutlined,
  ShoppingOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  CoffeeOutlined,
  ExperimentOutlined,
  BuildOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined as ResearchIcon,
  ReadOutlined,
  PlaySquareOutlined,
  BankOutlined,
  SafetyOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import JoyRide from "react-joyride";
import { motion } from "framer-motion";

import style from "./Flip.module.css";

interface ListPageProps {
  user: User;
}

// 문서 타입 정의
interface Document {
  _id: string;
  title: string;
  job_code: string;
  last_modified: Date;
  data: {
    question: string;
    answer: string;
  }[];
}

// jobStyles 타입 정의 추가
interface JobStyle {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

// jobStyles 객체에 타입 지정
const jobStyles: { [key: string]: JobStyle } = {
  "기획·전략": {
    icon: <ProjectOutlined />,
    color: "#1890ff",
    bgColor: "#e6f7ff",
    borderColor: "#91d5ff",
  },
  "마케팅·홍보·조사": {
    icon: <ShoppingOutlined />,
    color: "#eb2f96",
    bgColor: "#fff0f6",
    borderColor: "#ffadd2",
  },
  "회계·세무·재무": {
    icon: <DollarOutlined />,
    color: "#52c41a",
    bgColor: "#f6ffed",
    borderColor: "#b7eb8f",
  },
  "인사·노무·HRD": {
    icon: <TeamOutlined />,
    color: "#722ed1",
    bgColor: "#f9f0ff",
    borderColor: "#d3adf7",
  },
  "총무·법무·사무": {
    icon: <FileTextOutlined />,
    color: "#13c2c2",
    bgColor: "#e6fffb",
    borderColor: "#87e8de",
  },
  "IT개발·데이터": {
    icon: <CodeOutlined />,
    color: "#2f54eb",
    bgColor: "#f0f5ff",
    borderColor: "#adc6ff",
  },
  디자인: {
    icon: <SketchOutlined />,
    color: "#fa541c",
    bgColor: "#fff2e8",
    borderColor: "#ffbb96",
  },
  "영업·판매·무역": {
    icon: <ShoppingCartOutlined />,
    color: "#faad14",
    bgColor: "#fffbe6",
    borderColor: "#ffe58f",
  },
  "고객상담·TM": {
    icon: <CustomerServiceOutlined />,
    color: "#a0d911",
    bgColor: "#fcffe6",
    borderColor: "#eaff8f",
  },
  "구매·자재·물류": {
    icon: <ShopOutlined />,
    color: "#1890ff",
    bgColor: "#e6f7ff",
    borderColor: "#91d5ff",
  },
  "상품기획·MD": {
    icon: <ShoppingCartOutlined />,
    color: "#eb2f96",
    bgColor: "#fff0f6",
    borderColor: "#ffadd2",
  },
  "운전·운송·배송": {
    icon: <CarOutlined />,
    color: "#52c41a",
    bgColor: "#f6ffed",
    borderColor: "#b7eb8f",
  },
  서비스: {
    icon: <CoffeeOutlined />,
    color: "#722ed1",
    bgColor: "#f9f0ff",
    borderColor: "#d3adf7",
  },
  생산: {
    icon: <ExperimentOutlined />,
    color: "#13c2c2",
    bgColor: "#e6fffb",
    borderColor: "#87e8de",
  },
  "건설·건축": {
    icon: <BuildOutlined />,
    color: "#2f54eb",
    bgColor: "#f0f5ff",
    borderColor: "#adc6ff",
  },
  의료: {
    icon: <MedicineBoxOutlined />,
    color: "#fa541c",
    bgColor: "#fff2e8",
    borderColor: "#ffbb96",
  },
  "연구·R&D": {
    icon: <ResearchIcon />,
    color: "#faad14",
    bgColor: "#fffbe6",
    borderColor: "#ffe58f",
  },
  교육: {
    icon: <ReadOutlined />,
    color: "#a0d911",
    bgColor: "#fcffe6",
    borderColor: "#eaff8f",
  },
  "미디어·문화·스포츠": {
    icon: <PlaySquareOutlined />,
    color: "#1890ff",
    bgColor: "#e6f7ff",
    borderColor: "#91d5ff",
  },
  "금융·보험": {
    icon: <BankOutlined />,
    color: "#eb2f96",
    bgColor: "#fff0f6",
    borderColor: "#ffadd2",
  },
  "공공·복지": {
    icon: <SafetyOutlined />,
    color: "#52c41a",
    bgColor: "#f6ffed",
    borderColor: "#b7'eb8f",
  },
} as const;

const { Text } = Typography;

// JoyRide 스텝 타입 정의
interface Step {
  target: string;
  content: string;
  title?: string;
  disableBeacon?: boolean;
}

const ListPage = ({ user }: ListPageProps) => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [updatedAnswers, setUpdatedAnswers] = useState<{
    [key: string]: string;
  }>({}); // 사용자가 수정한 답변을 저장하는 상태
  const [selectedJobCode, setSelectedJobCode] = useState<string>(""); // 선택된 직무 코드
  const [runTour, setRunTour] = useState(false);

  const [modal, contextHolder] = Modal.useModal();
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleFlip = (documentId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  };

  const jobOptions = [
    "기획·전략",
    "마케팅·홍보·조사",
    "회계·세무·재무",
    "인사·노무·HRD",
    "총무·법무·사무",
    "IT개발·데이터",
    "디자인",
    "영업·판매·무역",
    "고객상담·TM",
    "구매·자재·물류",
    "상품기획·MD",
    "운전·운송·배송",
    "서비스",
    "생산",
    "건설·건축",
    "의료",
    "연구·R&D",
    "교육",
    "미디어·문화·스포츠",
    "금융·보험",
    "공공·복지",
  ];

  const fetchDocuments = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/self-introduction?uid=${user.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      const transformedData = data.map((doc: any) => ({
        ...doc,
        last_modified: new Date(doc.last_modified),
      }));
      setDocuments(transformedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDocument) {
      // 선택된 문서가 변경될 때마다 답변 상태 초기화
      const initialAnswers = selectedDocument.data.reduce((acc, item) => {
        acc[item.question] = item.answer;
        return acc;
      }, {} as { [key: string]: string });
      setUpdatedAnswers(initialAnswers);
    }
  }, [selectedDocument]);

  const filteredDocuments = selectedJobCode
    ? documents.filter((doc) => doc.job_code === selectedJobCode) // 직무 코드로 필터링
    : documents; // 선택된 직무 코드가 없으면 전체 문서 표시

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleAddNewDocument = () => {
    router.push("/self-introduction/manage/edit");
  };

  const handleAnswerChange = (question: string, value: string) => {
    setUpdatedAnswers((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const confirm = () => {
    modal.confirm({
      title: "알림",
      centered: true,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>
            정말로 수정하시겠습니까?
          </span>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            수정 후 되돌릴 수 없습니다.
          </p>
        </div>
      ),
      okText: "수정하기",
      cancelText: "취소",
      okButtonProps: {
        style: {
          backgroundColor: "#3B82F6",
          borderColor: "#3B82F6",
          color: "white",
        },
      },
      onOk: () => {
        handleSaveAnswers();
      },
    });
  };

  const confirm_Delete = (_id: string) => {
    modal.confirm({
      title: "알림",
      centered: true,
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <span style={{ fontSize: "18px", fontWeight: "bold" }}>
            정말로 삭제하시겠습니까?
          </span>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
      ),
      okText: "삭제하기",
      cancelText: "취소",
      okButtonProps: {
        style: {
          backgroundColor: "#FF0000",
          borderColor: "#FF0000",
          color: "white",
        },
      },
      onOk: async () => {
        await handleDelete(_id);
      },
    });
  };

  const handleFeedbackClick = async (_id: string) => {
    router.push(`/self-introduction/feedback?_id=${_id}`);
  };

  const handleDelete = async (_id: string) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/self-introduction", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id, uid: user.uid }),
      });
      console.log(response);

      const data = await response.json();

      if (response.ok) {
        fetchDocuments();
        setSelectedDocument(null);
        window.scrollTo(0, 0);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const handleSaveAnswers = async () => {
    if (!selectedDocument) return;

    const updatedDocument = {
      ...selectedDocument,
      data: selectedDocument.data.map((item) => ({
        ...item,
        answer: updatedAnswers[item.question] || item.answer,
      })),
      last_modified: new Date(),
    };

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/self-introduction", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedDocument),
      });

      if (response.ok) {
        fetchDocuments();
        setSelectedDocument(null);
        window.scrollTo(0, 0);
      } else {
        throw new Error("Failed to update document");
      }
    } catch (error) {
      console.error("Error while updating document:", error);
    }
  };

  // Joyride 스텝 정의
  const steps: Step[] = [
    {
      target: ".job-filter",
      content: "직무별로 자기소개서를 필터링할 수 있습니다.",
      title: "직무 필터",
    },
    {
      target: ".intro-card",
      content: "자기소개서 카드를 클릭하여 내용을 확인하고 수정할 수 있습니다.",
      title: "자기소개서 카드",
    },
    {
      target: ".add-new-card",
      content: "새로운 자기소개서를 작성할 수 있습니다.",
      title: "새 자기소개서 작성",
    },
  ];

  // 투어가 끝나면 runTour를 false로 설정
  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRunTour(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div>오류 발생: {error}</div>;
  }

  if (selectedDocument) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-white">
        <div
          style={{ width: "100%", minWidth: "900px", maxWidth: "1050px" }}
          className="p-6 mx-auto"
        >
          <div className="p-6 mx-auto bg-white shadow-[0_8px_30px_rgb(0,0,0,0.15)] rounded-xl">
            <div className="flex items-start mb-8">
              <Button
                onClick={() => setSelectedDocument(null)}
                icon={<LeftOutlined />}
                className="mr-4 hover:bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center border-none absolute"
              />
              <div className="w-full flex justify-center">
                <div className="border-b pb-6 mb-8 mt-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                    {selectedDocument.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <Text
                      className="text-xs px-2 py-1 rounded flex items-center gap-2 whitespace-nowrap"
                      style={{
                        color:
                          jobStyles[selectedDocument.job_code]?.color ?? "#666",
                        backgroundColor:
                          jobStyles[selectedDocument.job_code]?.bgColor ??
                          "#f5f5f5",
                        border: `1px solid ${
                          jobStyles[selectedDocument.job_code]?.borderColor ??
                          "#d9d9d9"
                        }`,
                        width: "fit-content",
                        display: "inline-flex",
                      }}
                    >
                      {jobStyles[selectedDocument.job_code]?.icon ?? null}
                      {selectedDocument.job_code}
                    </Text>
                    <span className="text-sm text-gray-500">
                      최근 수정:{" "}
                      {selectedDocument.last_modified.toLocaleDateString()}
                      {selectedDocument.last_modified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              {selectedDocument.data.map((item, index) => (
                <div
                  key={index}
                  className="border-l-4 border-[#4A90E2] pl-6 mb-12"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-[#4A90E2] mr-3 text-xl">
                      Q{index + 1}.
                    </span>
                    {item.question}
                  </h3>
                  <Input.TextArea
                    value={updatedAnswers[item.question] || ""}
                    onChange={(e) =>
                      handleAnswerChange(item.question, e.target.value)
                    }
                    autoSize={{ minRows: 3, maxRows: 20 }}
                    className="border border-gray-200 rounded-lg focus:border-[#7C8DA6] hover:border-[#7C8DA6]/50 transition-all duration-200"
                    style={{
                      resize: "none",
                      padding: "16px",
                      fontSize: "16px",
                      lineHeight: "1.8",
                      backgroundColor: "#ffffff",
                      color: "#374151",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                type="primary"
                onClick={confirm}
                className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-2 h-auto rounded-lg text-lg font-medium transition-all duration-300 border-none shadow-md hover:shadow-lg"
              >
                수정하기
              </Button>
              {contextHolder}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {contextHolder}
      <div
        style={{ width: "100%", minWidth: "800px", maxWidth: "1400px" }}
        className="mx-auto p-6"
      >
        <JoyRide
          steps={steps}
          run={runTour}
          continuous
          showProgress
          showSkipButton
          scrollToFirstStep={true}
          scrollOffset={0}
          disableScrolling={true}
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: "#3B82F6",
              backgroundColor: "#ffffff",
              textColor: "#333",
            },
            buttonBack: {
              display: "none",
            },
          }}
          locale={{
            close: "닫기",
            last: "완료",
            next: "다음",
            skip: "건너뛰기",
          }}
        />

        {/* 헤더 섹션 수정 */}
        <div className="bg-gradient-to-r rounded-xl bg-white shadow-lg p-8 mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                자기소개서 리스트
              </h1>
              <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-sm font-medium">
                {filteredDocuments.length} 개의 문서
              </span>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedJobCode}
                onChange={(e) => setSelectedJobCode(e.target.value)}
                className="job-filter w-[200px] p-2 bg-white border border-blue-200 rounded-lg text-gray-700 
                    hover:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500
                    transition-all duration-300"
              >
                <option value="">전체 직무</option>
                {jobOptions.map((job, index) => (
                  <option key={index} value={job}>
                    {job}
                  </option>
                ))}
              </select>
              <QuestionCircleOutlined
                className="text-blue-400 hover:text-blue-600 cursor-pointer text-2xl transition-all duration-300"
                onClick={() => setRunTour(true)}
              />
            </div>
          </div>
        </div>

        {/* 카드 그리드 */}
        <Row gutter={[24, 24]}>
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
            >
              <Col className="mb-8">
                <div
                  onClick={() => handleDocumentClick(document)}
                  className="intro-card group relative w-[320px] cursor-pointer"
                >
                  {/* 메인 카드 */}
                  <div
                    className="relative h-[140px] p-6 rounded-xl border bg-white
                        shadow-md hover:shadow-lg
                        transition-all duration-300 group-hover:scale-[1.02]"
                  >
                    {/* 직무 태그 */}
                    <div className="absolute -top-3 left-4">
                      <div
                        className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm
                          backdrop-blur-sm transition-all duration-300 group-hover:shadow-md"
                        style={{
                          color:
                            jobStyles[document.job_code]?.color || "#1e40af",
                          backgroundColor:
                            `${jobStyles[document.job_code]?.bgColor}ee` ||
                            "#fff",
                          border: `1px solid ${
                            jobStyles[document.job_code]?.borderColor ||
                            "#93c5fd"
                          }`,
                        }}
                      >
                        {jobStyles[document.job_code]?.icon}
                        <span>{document.job_code || "N/A"}</span>
                      </div>
                    </div>

                    {/* 문서 제목 */}
                    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-2">
                      {document.title.length > 20
                        ? `${document.title.substring(0, 15)}...`
                        : document.title}
                    </h3>

                    {/* 수정일 */}
                    <div className="absolute bottom-4 right-6 text-gray-600 text-sm font-medium">
                      {document.last_modified.toLocaleDateString()}{" "}
                      {document.last_modified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  </div>

                  {/* 작업 버튼 스타일 수정 */}
                  <div
                    className="absolute inset-x-0 bottom-0 flex justify-center gap-2 transition-all duration-300
                        opacity-0 translate-y-0 group-hover:opacity-100 group-hover:translate-y-[120%]"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedbackClick(document._id);
                      }}
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600
                        text-white text-sm font-semibold shadow-md hover:shadow-lg
                        transition-all duration-300"
                    >
                      첨삭받기
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirm_Delete(document._id);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600
                        text-white text-sm font-semibold shadow-md hover:shadow-lg
                        transition-all duration-300"
                    >
                      삭제하기
                    </button>
                  </div>
                </div>
              </Col>
            </motion.div>
          ))}

          {/* 새 문서 추가 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: filteredDocuments.length * 0.1,
            }}
          >
            <Col>
              <div
                onClick={handleAddNewDocument}
                className="add-new-card w-[320px] h-[140px] rounded-xl cursor-pointer relative overflow-hidden
                bg-white hover:bg-blue-50
                border-2 border-dashed border-blue-200 hover:border-blue-400
                transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full bg-blue-50 hover:bg-blue-100 
                        border border-blue-200 flex items-center justify-center
                        transition-all duration-300"
                  >
                    <span className="text-4xl text-blue-500 font-semibold relative -top-[5px]">
                      +
                    </span>
                  </div>
                  <span className="text-lg text-blue-600 font-semibold">
                    새 자기소개서 작성
                  </span>
                </div>
              </div>
            </Col>
          </motion.div>
        </Row>
      </div>
    </div>
  );
};

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);

  const handleLoginRedirect = () => {
    router.push("/mypage");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {user ? (
        <div>
          <ListPage user={user} />
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center min-h-[60vh] w-[600px] 
                      mx-auto p-12 rounded-xl bg-white shadow-lg border border-gray-100"
        >
          <div className="text-center space-y-8 w-full">
            <div className="mb-8">
              <svg
                className="w-16 h-16 mx-auto text-blue-600 mb-4 drop-shadow-md"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 drop-shadow-sm">
                로그인이 필요합니다
              </h2>
              <div className="w-16 h-0.5 mx-auto bg-blue-600 rounded-full shadow-sm"></div>
            </div>
            <p className="text-gray-700 text-lg font-medium leading-relaxed">
              자기소개서 관리 서비스를 이용하시려면
              <br />
              로그인이 필요합니다.
              <br />
              로그인 후 다양한 기능을 사용해보세요.
            </p>
            <Button
              onClick={handleLoginRedirect}
              type="primary"
              size="large"
              className="mt-8 h-12 px-10 text-lg bg-blue-600 hover:bg-blue-700 
                        border-0 rounded-lg transition-all duration-200 font-bold 
                        shadow-lg hover:shadow-xl"
            >
              로그인 하러 가기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;