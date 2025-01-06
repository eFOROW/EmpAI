import { User } from "firebase/auth";
import { Spin, Alert, Card, Descriptions, Avatar } from "antd";
import { useState, useEffect } from "react";

interface MyProfileProps {
  user: User | null;
}

const MyProfile: React.FC<MyProfileProps> = ({ user }) => {
  const [profileData, setProfileData] = useState<any | null>(null); // 사용자 데이터 상태
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태
  const [error, setError] = useState<string>(""); // 에러 상태

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
      const response = await fetch(`/api/user?uid=${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      // ... 나머지 처리 코드
    } catch (error) {
      console.error('Error updating user info:', error);
    }
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
                src={profileData?.imgUrl || "https://www.studiopeople.kr/common/img/default_profile.png"}
                alt={user.email || "Profile Image"}
                className="border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300"
              />
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
                <Descriptions.Item label="프로필 이미지">{profileData?.imgUrl || "null"}</Descriptions.Item>
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
    </div>
  );
};

export default MyProfile;
