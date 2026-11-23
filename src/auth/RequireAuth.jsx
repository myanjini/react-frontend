import { Navigate, useLocation } from 'react-router';
import { useAuth } from './useAuth';

// 로그인하지 않은 사용자를 로그인 화면으로 보냅니다.
// 화면을 가리는 장치일 뿐이며, 실제 권한 검사는 백엔드가 합니다.
export default function RequireAuth({ children, adminOnly = false }) {
  const { user, initializing, isAdmin } = useAuth();
  const location = useLocation();

  if (initializing) return <p className="muted">로그인 상태를 확인하는 중입니다.</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) return <p className="error">관리자만 사용할 수 있는 화면입니다.</p>;
  return children;
}
