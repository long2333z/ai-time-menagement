import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import PlanPage from './pages/PlanPage'
import ReviewPage from './pages/ReviewPage'
import AnalyticsPage from './pages/AnalyticsPage'
import GoalsPage from './pages/GoalsPage'
import InsightsPage from './pages/InsightsPage'
import PricingPage from './pages/PricingPage'
import SettingsPage from './pages/SettingsPage'
import ApiConfigPage from './pages/ApiConfigPage'
import AIChatPage from './pages/AIChatPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ErrorLogsPage from './pages/ErrorLogsPage'

function App() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* 受保护路由 */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="plan" element={<PlanPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="ai-chat" element={<AIChatPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="api-config" element={<ApiConfigPage />} />
        <Route path="error-logs" element={<ErrorLogsPage />} />
      </Route>
    </Routes>
  )
}

export default App