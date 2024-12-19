import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { getAuth, User } from 'firebase/auth';
import Cookies from 'js-cookie';

const AuthContext = createContext<{ user: User | null, isLoading: boolean }>({
  user: null,
  isLoading: true, // 로딩 상태를 기본적으로 true로 설정
});

export const AuthProvider = ({ children }: any) => {
  const [userState, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const unsubscribe = getAuth().onIdTokenChanged(async (user) => {
      if (!user) {
        setUserState(null);
        Cookies.remove('token', { path: '/' });
      } else {
        setUserState(user);
        const token = await user.getIdToken();
        Cookies.set('token', token, { path: '/' });
      }
      setIsLoading(false); // 인증 상태가 갱신되면 로딩 상태 false로 설정
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const refreshToken = setInterval(async () => {
      const { currentUser } = getAuth();
      if (currentUser) await currentUser.getIdToken(true);
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshToken);
  }, []);

  const user = useMemo(() => ({
    user: userState,
    isLoading,
  }), [userState, isLoading]);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
