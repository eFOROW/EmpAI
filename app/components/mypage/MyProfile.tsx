import { User } from "firebase/auth";
import { Spin, Alert, Card, Descriptions, Avatar, Upload, Button, Tabs } from "antd";
import { useState, useEffect } from "react";
import { Input, Modal } from 'antd';
import { EditOutlined, UploadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { message } from 'antd';

interface MyProfileProps {
  user: User | null;
}

const MyProfile: React.FC<MyProfileProps> = ({ user }) => {
  const [profileData, setProfileData] = useState<any | null>(null); // 사용자 데이터 상태
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태
  const [error, setError] = useState<string>(""); // 에러 상태
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [showFullImgUrl, setShowFullImgUrl] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const fetchUserData = async () => {
        setLoading(true);
        setError("");
        try {
          const token = await user.getIdToken();
          const response = await fetch(`/api/db/Users?uid=${user.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          setProfileData(data); // 사용자 데이터 설정
        } catch (error: any) {
          setError(error.message); // 에러 설정
        } finally {
          setLoading(false); // 로딩 상태 종료
        }
      };

      fetchUserData();
    }
  }, [user]); // `user`가 변경될 때마다 API 호출

  const updateUserInfo = async (data: any) => {
    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }
      const token = await user.getIdToken();
      const response = await fetch(`/api/db/Users?uid=${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update user info');
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      message.success('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error('Error updating user info:', error);
      message.error('프로필 업데이트에 실패했습니다.');
    }
  };

  const handleImageEdit = () => {
    setIsEditingImage(true);
    setNewImageUrl(profileData?.imgUrl || '');
  };

  const handleImageUpdate = async () => {
    if (newImageUrl.startsWith('data:')) {
      message.error('올바른 URL을 입력해주세요.');
      return;
    }
    try {
      await updateUserInfo({ imgUrl: newImageUrl });
      setIsEditingImage(false);
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('이미지 파일만 업로드 가능합니다.');
    }
    return isImage;
  };

  const handleUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const uploadUrl = `upload:${base64}`;
        await updateUserInfo({ imgUrl: uploadUrl });
        setIsEditingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error('이미지 업로드에 실패했습니다.');
    }
    return false;
  };

  const getImageSource = (imgUrl: string) => {
    if (!imgUrl) {
      return "https://www.studiopeople.kr/common/img/default_profile.png";
    }

    if (imgUrl.startsWith('upload:')) {
      const base64Data = imgUrl.split('upload:')[1];
      // base64 데이터가 'data:' 로 시작하지 않으면 추가
      if (!base64Data.startsWith('data:')) {
        return `data:image/png;base64,${base64Data}`;
      }
      return base64Data;
    }

    return imgUrl;
  };

  const getDisplayImgUrl = (url: string) => {
    if (!url) return "null";
    if (url.length > 100 && !showFullImgUrl) {
      return url.substring(0, 100) + "...";
    }
    return url;
  };

  return (
    <div className="profile-container p-5 max-w-4xl mx-auto">
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" tip="로딩중..." />
        </div>
      )}
      {error && <Alert message="오류 발생" description={error} type="error" showIcon className="mb-4" />}
      {user ? (
        <Card className="bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar
                size={120}
                src={getImageSource(profileData?.imgUrl)}
                alt={user.email || "Profile Image"}
                className="border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={handleImageEdit}
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              >
                <EditOutlined className="text-gray-600" />
              </button>
            </div>
            {profileData && (
              <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
            )}
          </div>

          {profileData && (
            <div className="mt-8 px-6">
              <Descriptions 
                title={
                  <span className="text-xl font-semibold text-gray-700 block pb-4 pt-2 px-4">
                    내 정보
                  </span>
                } 
                bordered 
                column={1} 
                className="rounded-lg bg-gray-50 shadow-inner"
                labelStyle={{ 
                  fontWeight: 600,
                  backgroundColor: '#f8fafc',
                  padding: '16px 24px'
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  padding: '16px 24px'
                }}
              >
                <Descriptions.Item label="이메일">{profileData.email}</Descriptions.Item>
                <Descriptions.Item label="Uid">{profileData.uid}</Descriptions.Item>
                <Descriptions.Item label="프로필 이미지">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="break-all">
                        {getDisplayImgUrl(profileData?.imgUrl)}
                      </span>
                      {profileData?.imgUrl && profileData.imgUrl.length > 100 && (
                        <Button
                          type="text"
                          size="small"
                          icon={showFullImgUrl ? <UpOutlined /> : <DownOutlined />}
                          onClick={() => setShowFullImgUrl(!showFullImgUrl)}
                        >
                          {showFullImgUrl ? '접기' : '더보기'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="이름">{profileData.name}</Descriptions.Item>
                <Descriptions.Item label="성별">{profileData.gender}</Descriptions.Item>
                <Descriptions.Item label="나이대">{profileData.ageRange}</Descriptions.Item>
                <Descriptions.Item label="가입일">
                  {new Date(profileData.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Card>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow">
          <p className="text-gray-500 text-lg">사용자 정보를 불러오는 중입니다...</p>
        </div>
      )}

      <Modal
        title="프로필 이미지 수정"
        open={isEditingImage}
        onOk={handleImageUpdate}
        onCancel={() => setIsEditingImage(false)}
        okText="저장"
        cancelText="취소"
        okButtonProps={{
          style: { display: activeTab === '1' ? 'none' : 'inline' }
        }}
      >
        <Tabs
          defaultActiveKey="1"
          onChange={(key) => setActiveTab(key)}
          items={[
            {
              key: '1',
              label: '파일 업로드',
              children: (
                <Upload
                  beforeUpload={beforeUpload}
                  customRequest={({ file }) => handleUpload(file as File)}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>파일 선택</Button>
                </Upload>
              ),
            },
            {
              key: '2',
              label: 'URL 직접입력',
              children: (
                <Input
                  placeholder="이미지 URL을 입력하세요"
                  value={newImageUrl}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value.startsWith('data:')) {
                      setNewImageUrl(value);
                    }
                  }}
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default MyProfile;
