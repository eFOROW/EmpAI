import { User } from "firebase/auth";
import { Spin, Alert, Card, Descriptions, Avatar, Upload, Button, Tabs } from "antd";
import { useState, useEffect } from "react";
import { Input, Modal } from 'antd';
import { EditOutlined, UploadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

interface MyProfileProps {
  user: User | null;
}

const MyProfile: React.FC<MyProfileProps> = ({ user }) => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [showFullImgUrl, setShowFullImgUrl] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  
  // 기존 useEffect 및 함수들은 그대로 유지

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
          setProfileData(data);
        } catch (error: any) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [user]);

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
    <div className="profile-container p-4 max-w-4xl mx-auto">
      {loading && (
        <div className="flex justify-center items-center min-h-[500px]">
          <div className="flex flex-col items-center space-y-4">
            <Spin size="large" />
            <p className="text-gray-500 animate-pulse">프로필 불러오는 중...</p>
          </div>
        </div>
      )}
  
      {error && (
        <Alert 
          message="오류 발생" 
          description={error} 
          type="error" 
          showIcon 
          className="mb-6 shadow-lg" 
        />
      )}
  
      {user && profileData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Profile Header Card with Glassmorphism effect */}
          <Card 
            className="relative overflow-hidden backdrop-blur-lg bg-white/30 
                     border-none rounded-3xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            }}
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full 
                           bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20" />
              <div className="absolute -top-32 -right-32 w-64 h-64 
                           bg-gradient-to-br from-blue-500/30 to-purple-500/30 
                           rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 
                           bg-gradient-to-tr from-pink-500/30 to-purple-500/30 
                           rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center space-y-8 py-12"
              >
                {/* Profile Image Section */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-300 via-purple-100 to-pink-100 
                               rounded-full opacity-75 blur-lg animate-pulse" />
                  <Avatar
                    size={180}
                    src={getImageSource(profileData?.imgUrl)}
                    alt={user.email || "Profile Image"}
                    className="border-4 border-white shadow-xl relative"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleImageEdit}
                    className="absolute bottom-2 right-2 bg-white/90 rounded-full p-3 
                             shadow-lg backdrop-blur-sm"
                  >
                    <EditOutlined className="text-gray-700 text-xl" />
                  </motion.button>
                </motion.div>

                {/* Profile Info */}
                <div className="text-center space-y-3">
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-bold bg-clip-text text-transparent 
                             bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {profileData.name}
                  </motion.h2>
                  <p className="text-gray-600">{profileData.email}</p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mt-8">
                  {[
                    { label: '성별', value: profileData.gender, icon: '👤' },
                    { label: '나이대', value: profileData.ageRange, icon: '🎂' },
                    { 
                      label: '가입일', 
                      value: new Date(profileData.createdAt).toLocaleDateString(),
                      icon: '📅'
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 backdrop-blur-md bg-white/50 
                               rounded-2xl shadow-lg hover:shadow-xl 
                               transition-all duration-300"
                    >
                      <span className="text-2xl mb-2 block">{item.icon}</span>
                      <p className="text-gray-500 text-sm">{item.label}</p>
                      <p className="font-semibold text-gray-800 mt-1">{item.value}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </Card>

          {/* Detailed Info Card with Expansion */}
          <motion.div
            initial={false}
            animate={{ height: isDetailsExpanded ? 'auto' : '120px' }}
            className="overflow-hidden"
          >
            <Card 
              className="backdrop-blur-lg bg-white/90 border-none rounded-3xl shadow-xl 
                       hover:shadow-2xl transition-all duration-300"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-800">
                    상세 정보
                  </h3>
                  <Button
                    type="text"
                    onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                    icon={isDetailsExpanded ? <UpOutlined /> : <DownOutlined />}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    {isDetailsExpanded ? '접기' : '펼치기'}
                  </Button>
                </div>

                <AnimatePresence>
                  {isDetailsExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid gap-4"
                    >
                      {[
                        { label: 'UID', value: profileData.uid, icon: '🔑' },
                        { label: '이메일', value: profileData.email, icon: '✉️' },
                        { label: '이름', value: profileData.name, icon: '📝' },
                        { label: '성별', value: profileData.gender, icon: '👤' },
                        { label: '나이대', value: profileData.ageRange, icon: '🎂' },
                        { 
                          label: '프로필 이미지', 
                          value: (
                            <div className="flex items-center gap-2">
                              <span className="break-all">
                                {getDisplayImgUrl(profileData?.imgUrl)}
                              </span>
                              {profileData?.imgUrl?.length > 100 && (
                                <Button
                                  type="text"
                                  size="small"
                                  className="flex items-center gap-1"
                                  icon={showFullImgUrl ? <UpOutlined /> : <DownOutlined />}
                                  onClick={() => setShowFullImgUrl(!showFullImgUrl)}
                                >
                                  {showFullImgUrl ? '접기' : '더보기'}
                                </Button>
                              )}
                            </div>
                          ),
                          icon: '🖼️'
                        },
                        { 
                          label: '가입일', 
                          value: new Date(profileData.createdAt).toLocaleString(),
                          icon: '📅'
                        }
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 
                                   shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-xl">{item.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                              <p className="text-gray-800 font-medium">{item.value}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
  
      {/* Image Edit Modal */}
      <Modal
        title={
          <h3 className="text-xl font-bold text-gray-800">
            프로필 이미지 수정
          </h3>
        }
        open={isEditingImage}
        onOk={handleImageUpdate}
        onCancel={() => setIsEditingImage(false)}
        okText="저장"
        cancelText="취소"
        okButtonProps={{
          style: { 
            display: activeTab === '1' ? 'none' : 'inline',
            background: 'linear-gradient(to right, #3B82F6, #6366F1)'
          }
        }}
        className="modal-with-custom-footer"
        bodyStyle={{ padding: '24px' }}
      >
        <Tabs
          defaultActiveKey="1"
          onChange={(key) => setActiveTab(key)}
          className="custom-profile-tabs"
          items={[
            {
              key: '1',
              label: (
                <span className="flex items-center gap-2">
                  <UploadOutlined />
                  파일 업로드
                </span>
              ),
              children: (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center bg-gray-50/50 rounded-xl"
                >
                  <Upload
                    beforeUpload={beforeUpload}
                    customRequest={({ file }) => handleUpload(file as File)}
                    showUploadList={false}
                  >
                    <Button 
                      icon={<UploadOutlined />}
                      className="h-12 px-8 text-white 
                               bg-gradient-to-r from-blue-500 to-purple-500 
                               border-none hover:opacity-90 transition-all duration-300
                               shadow-md hover:shadow-lg"
                    >
                      이미지 선택하기
                    </Button>
                  </Upload>
                  <p className="text-gray-500 text-sm mt-4">
                    클릭하여 이미지를 선택하거나 드래그하여 업로드하세요
                  </p>
                </motion.div>
              ),
            },
            {
              key: '2',
              label: (
                <span className="flex items-center gap-2">
                  <EditOutlined />
                  URL 직접입력
                </span>
              ),
              children: (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 font-medium">
                      이미지 URL
                    </label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={newImageUrl}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value.startsWith('data:')) {
                          setNewImageUrl(value);
                        }
                      }}
                      className="h-12 border-gray-300 rounded-lg"
                    />
                  </div>
                  <p className="text-gray-500 text-sm">
                    유효한 이미지 URL을 입력해주세요
                  </p>
                </motion.div>
              ),
            },
          ]}
        />
      </Modal>

      {/* Custom styles for modal - can be moved to CSS file */}
      <style jsx global>{`
        .modal-with-custom-footer .ant-modal-footer {
          border-top: none;
          padding: 16px 24px;
        }
        
        .custom-profile-tabs .ant-tabs-nav {
          margin-bottom: 16px;
        }
        
        .custom-profile-tabs .ant-tabs-tab {
          padding: 12px 16px;
          margin: 0 8px 0 0;
        }
        
        .custom-profile-tabs .ant-tabs-tab-active {
          background: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
          border-radius: 8px;
        }
        
        .custom-profile-tabs .ant-tabs-ink-bar {
          background: linear-gradient(to right, #3B82F6, #6366F1);
        }
      `}</style>
    </div>
  );
}

export default MyProfile;
          