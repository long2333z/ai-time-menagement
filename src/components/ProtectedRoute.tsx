import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../services/authService'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * 受保护路由组件
 * 如果用户未登录,则重定向到登录页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation()
  const authenticated = isAuthenticated()

  if (!authenticated) {
    // 保存当前路径,登录后可以跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
