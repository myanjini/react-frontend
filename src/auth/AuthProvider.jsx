import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { setOnAuthExpired } from '../api/client';
import { tokenStore } from './tokenStore';
import { AuthContext } from './useAuth';

export default function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null); // { id, email, role }
  // 리프레시 토큰이 남아 있을 때만 "확인 중" 상태로 시작합니다.
  const [initializing, setInitializing] = useState(() => Boolean(tokenStore.getRefresh()));

  const loadMe = useCallback(async () => {
    const me = await authApi.fetchMe();
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    // 재발급까지 실패하면 client.js가 이 함수를 불러 로그인 상태를 지웁니다.
    setOnAuthExpired(() => {
      setUser(null);
      queryClient.clear();
    });
  }, [queryClient]);

  // 새로고침 직후: 액세스 토큰은 메모리에서 사라졌지만 리프레시 토큰이 남아 있으면
  // /auth/me 호출이 401 -> 재발급 -> 재요청 흐름을 거쳐 로그인 상태를 되살립니다.
  useEffect(() => {
    if (!tokenStore.getRefresh()) return;
    loadMe()
      .catch(() => tokenStore.clear())
      .finally(() => setInitializing(false));
  }, [loadMe]);

  const login = useCallback(
    async (email, password) => {
      const tokens = await authApi.login(email, password);
      tokenStore.save(tokens);
      return loadMe();
    },
    [loadMe],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefresh();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      // 서버 호출이 실패해도 브라우저의 토큰은 반드시 지웁니다.
      tokenStore.clear();
      setUser(null);
      // 다른 사용자가 같은 브라우저를 쓰더라도 이전 사용자의 데이터가 보이지 않게 캐시를 비웁니다.
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, initializing, isAdmin: user?.role === 'admin', login, logout }),
    [user, initializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
