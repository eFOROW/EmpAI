import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { Button, Spin, Alert, Card, Descriptions, Avatar } from "antd";
import { useState, useEffect } from "react";

interface MyProfileProps {
  user: User | null;
}

const MyProfile: React.FC<MyProfileProps> = ({ user }) => {
  const [profileData, setProfileData] = useState<any | null>(null); // 사용자 데이터 상태
  const [loading, setLoading] = useState<boolean>(false); // 로딩 상태
  const [error, setError] = useState<string>(""); // 에러 상태

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      const fetchUserData = async () => {
        setLoading(true);
        setError("");
        try {
          // Firebase uid를 사용하여 API에서 사용자 데이터 요청
          const response = await fetch(`/api/db/Users?uid=${user.uid}`);
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

  return (
    <div className="profile-container p-5 max-w-4xl mx-auto">
      {loading && <Spin tip="Loading..." />}
      {error && <Alert message="Error" description={error} type="error" showIcon />}
      {user ? (
        <Card className="bg-white shadow-lg rounded-lg">
          <div className="text-center">
            {/* 프로필 이미지 */}
            <Avatar
              size={100}
              src={profileData?.imgUrl || "https://www.studiopeople.kr/common/img/default_profile.png"}
              alt={user.email || "Profile Image"}
              className="mx-auto"
            />
          </div>

          {profileData && (
            <div className="mt-6">
              <Descriptions title="User Info" bordered column={1} className="rounded-md bg-gray-50 p-4">
                <Descriptions.Item label="email">{profileData.email}</Descriptions.Item>
                <Descriptions.Item label="uid">{profileData.uid}</Descriptions.Item>
                <Descriptions.Item label="imgUrl">{profileData?.imgUrl || "null"}</Descriptions.Item>
                <Descriptions.Item label="name">{profileData.name}</Descriptions.Item>
                <Descriptions.Item label="Gender">{profileData.gender}</Descriptions.Item>
                <Descriptions.Item label="ageRange">{profileData.ageRange}</Descriptions.Item>
                <Descriptions.Item label="createdAt">
                  {new Date(profileData.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button type="primary" danger onClick={handleLogout} className="w-full">
              Logout
            </Button>
          </div>
        </Card>
      ) : (
        <p className="text-center text-gray-500">Loading..</p>
      )}
    </div>
  );
};

export default MyProfile;
