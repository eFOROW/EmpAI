import { app } from "@/lib/firebase/firebase"
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

const auth = getAuth(app);

/**
 * 로그인 상태를 관리하는 함수
 * @returns {Promise<User | null>} 현재 로그인된 사용자 또는 null
 */
const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // 유저가 로그인 상태일 때
        resolve(user);
      } else {
        // 유저가 로그아웃 상태일 때
        resolve(null);
      }
    }, reject);
  });
};

export default getCurrentUser;