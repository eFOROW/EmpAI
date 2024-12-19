import { User, signOut } from "firebase/auth";
import { auth } from '@/lib/firebase/firebase'
import { Button } from 'antd';

interface MyProfileProps {
  user: User | null;
}

const MyProfile: React.FC<MyProfileProps> = ({ user }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="profile-container">
      {user ? (
        <div>
          <p>Email : {user.email}</p>
          <p>UID : {user.uid}</p>
          <Button type="primary" danger onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </div>
  );
};

export default MyProfile;
