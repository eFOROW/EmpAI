"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { useRouter } from "next/navigation";
import { Button, Card, Col, Row, Typography, Input, Modal } from "antd";
import { LeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

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

const { Text } = Typography;

const ListPage = ({ user }: ListPageProps) => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [updatedAnswers, setUpdatedAnswers] = useState<{ [key: string]: string }>({}); // 사용자가 수정한 답변을 저장하는 상태
  const [selectedJobCode, setSelectedJobCode] = useState<string>(""); // 선택된 직무 코드

  const [modal, contextHolder] = Modal.useModal();
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({});

    
  const handleFlip = (documentId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [documentId]: !prev[documentId],
    }));
  };

  const jobOptions = [
    "기획·전략", "마케팅·홍보·조사", "회계·세무·재무", "인사·노무·HRD",
    "총무·법무·사무", "IT개발·데이터", "디자인", "영업·판매·무역",
    "고객상담·TM", "구매·자재·물류", "상품기획·MD", "운전·운송·배송",
    "서비스", "생산", "건설·건축", "의료", "연구·R&D", "교육", "미디어·문화·스포츠",
    "금융·보험", "공공·복지"
  ];

  const fetchDocuments = async () => {
    try {
      const API_URL = `/api/self-introduction?uid=${user.uid}`;
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data: Document[] = await response.json();
      const transformedData = data.map((doc) => ({
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
          title: '알림',
          centered: true,
          icon: <ExclamationCircleOutlined />,
          content: (
            <div>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>정말로 수정하시겠습니까?</span>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>수정 후 되돌릴 수 없습니다.</p>
            </div>
          ),
          okText: '수정하기',
          cancelText: '취소',
          okButtonProps: {
              style: {
                  backgroundColor: '#3B82F6',
                  borderColor: '#3B82F6',
                  color: 'white',
              }
          },
          onOk: () => {
            handleSaveAnswers()
          },
      });
    };

  const handleSaveAnswers = async () => {
    if (!selectedDocument) {
      console.error("selectedDocument is null.");
      return;
    }
  
    // 기존 문서의 데이터를 업데이트
    const updatedData = selectedDocument.data.map((item) => ({
      question: item.question,
      answer: updatedAnswers[item.question] || item.answer,
    }));
  
    // _id 포함한 업데이트된 문서 생성
    const updatedDocument: Document = {
      _id: selectedDocument._id, // _id 추가
      title: selectedDocument.title,
      job_code: selectedDocument.job_code,
      last_modified: new Date(),
      data: updatedData,
    };
  
    try {
      const response = await fetch("/api/self-introduction", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDocument),
      });
  
      if (response.ok) {
        // ...
      } else {
        console.error("Failed to update document:", await response.json());
      }
    } catch (error) {
      console.error("Error while updating document:", error);
    } finally {
      fetchDocuments();
      setSelectedDocument(null);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류 발생: {error}</div>;
  }

  if (selectedDocument) {
    return (
      <div className="p-4 max-w-3xl w-full mt-8" style={{width: 800}}>
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setSelectedDocument(null)}
            icon={<LeftOutlined />}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
          />
          <h2 className="text-2xl font-bold flex-grow text-center text-gray-800">
            {selectedDocument.title}
          </h2>
        </div>


        <div className="text-gray-700">
          <p>직무 분야 : {selectedDocument.job_code}</p>
          <p>
            최근 수정 : {selectedDocument.last_modified.toLocaleDateString()}{" "}
            {selectedDocument.last_modified.toLocaleTimeString()}
          </p>
          <ul className="mt-4">
            {selectedDocument.data.map((item, index) => (
              <li key={index} className="mb-4">
                <p className="font-semibold">{item.question}</p>
                <Input.TextArea
                  value={updatedAnswers[item.question] || ""}
                  onChange={(e) => handleAnswerChange(item.question, e.target.value)}
                  rows={8}
                  className="mt-2"
                />
              </li>
            ))}
          </ul>
          <div className="mt-4">
          <div className="flex justify-center items-center">
            <Button
              type="primary"
              onClick={confirm}
              className="bg-blue-500 text-white px-12 py-4 rounded-lg font-semibold text-xl transition-all duration-300 transform hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              수정
            </Button>
            {contextHolder}
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minWidth: 520, maxWidth: 1000}}>
      <div className="relative mb-4 mt-8" style={{minWidth: 860, maxWidth: 1000}}>
        <div className="flex items-center justify-between sticky top-0 bg-white z-10 py-2 px-4">
          {/* "자기소개서 리스트" */}
          <h1 className="text-2xl font-bold" style={{ flex: '0 0 auto' }}>
            자기소개서 리스트
          </h1>
          {/* 직무 선택 드롭다운 */}
          <select
            value={selectedJobCode}
            onChange={(e) => setSelectedJobCode(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
            style={{ flex: '0 0 auto', minWidth: '200px' }}
          >
            <option value="">직무 선택</option>
            {jobOptions.map((job, index) => (
              <option key={index} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {filteredDocuments.map((document) => (
        <Col key={document._id} flex="0 1 auto" className={style.imageWrapper}>
          <div className={`${style.flipCard} ${flippedCards[document._id] ? style.flipped : ""}`}>
            <div className={`${style.front}`}>
              <Card
                hoverable
                cover={
                  <div>
                    <Text
                      type="secondary"
                      className="text-xs"
                      style={{
                        border: "1px solid #e9d5ff",
                        backgroundColor: "#faf5ff",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        color: "#9333ea"
                      }}
                    >
                      {document?.job_code || "N/A"}
                    </Text>
                    <button className="more-button flex items-center text-gray-800 bg-transparent border-none cursor-pointer"
                      onClick={() => handleFlip(document._id)}>
                      <span className="mr-2 text-xl">...</span>
                    </button>
                  </div>
                }
                style={{ padding: "10px 0px 0 10px", maxWidth: 320 }}
              >
                <div className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                  onClick={() => handleDocumentClick(document)}>
                  {document.title.length > 20 ? `${document.title.substring(0, 15)}...` : document.title}
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {document.last_modified.toLocaleDateString()}{" "}
                    {document.last_modified.toLocaleTimeString()}
                  </Text>
                </div>
              </Card>
            </div>
            <div className={`${style.back} border-2 border-gray-300 shadow-lg`}>
                <p>Success~~~!</p>
                <button className="more-button flex items-center text-gray-800 bg-transparent border-none cursor-pointer"
                    onClick={() => handleFlip(document._id)}>
                    <span className="mr-2 text-xl">...</span>
                </button>
            </div>
          </div>
        </Col>
      ))}
        <Col>
          <Card
            hoverable
            onClick={handleAddNewDocument}
            className="flex items-center justify-center cursor-pointer"
            style={{
              height: 130,
              minWidth: 250  // 고정 너비
            }}
          >
            <Text className="text-3xl text-blue-500 font-bold">+</Text>
          </Card>
        </Col>
      </Row>
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
    <div className="flex flex-col items-center min-h-screen p-4">
      {user ? (
        <div>
          <ListPage user={user} />
        </div>
      ) : (
        <div className="text-center">
          <p>해당 서비스는 로그인 후 사용 가능합니다.</p>
          <Button
            onClick={handleLoginRedirect}
            type="primary"
            className="mt-4"
          >
            로그인 하러 가기
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;