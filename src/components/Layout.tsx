import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Badge, Drawer } from 'antd'
import {
  HomeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  TrophyOutlined,
  BulbOutlined,
  CrownOutlined,
  SettingOutlined,
  MenuOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Header, Content } = AntLayout

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem
}

const Layout = () => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const mainMenuItems: MenuItem[] = [
    getItem('首页', '/', <HomeOutlined />),
    getItem('AI助手', '/ai-chat', <RobotOutlined />),
    getItem('早晨计划', '/plan', <CalendarOutlined />),
    getItem('晚间复盘', '/review', <CheckCircleOutlined />),
    getItem('数据分析', '/analytics', <BarChartOutlined />),
    getItem('目标习惯', '/goals', <TrophyOutlined />),
  ]

  const secondaryMenuItems: MenuItem[] = [
    getItem('AI洞察', '/insights', <Badge count={3} offset={[10, 0]}><BulbOutlined /></Badge>),
    getItem('API配置', '/api-config', <SettingOutlined />),
    getItem('升级会员', '/pricing', <CrownOutlined />),
    getItem('设置', '/settings', <SettingOutlined />),
  ]

  const allMenuItems = [...mainMenuItems, ...secondaryMenuItems]

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
    setDrawerVisible(false)
  }

  // 移动端底部导航栏
  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {mainMenuItems.map((item: any) => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              location.pathname === item.key
                ? 'text-primary-600'
                : 'text-gray-600'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <AntLayout className="min-h-screen">
      {/* 顶部导航栏 */}
      <Header className="!bg-white border-b border-gray-200 !px-4 md:!px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="text-lg"
            />
          )}
          <h1 className="text-lg md:text-xl font-bold text-primary-600 flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <span className="hidden sm:inline">AI时间管理大师</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Badge dot>
            <BulbOutlined 
              className="text-xl text-gray-600 cursor-pointer hover:text-primary-600" 
              onClick={() => navigate('/insights')}
            />
          </Badge>
          {!isMobile && (
            <>
              <Button 
                type="text" 
                icon={<CrownOutlined />}
                onClick={() => navigate('/pricing')}
              >
                升级
              </Button>
              <Button 
                type="text" 
                icon={<SettingOutlined />}
                onClick={() => navigate('/settings')}
              />
            </>
          )}
        </div>
      </Header>

      {/* 侧边抽屉（移动端） */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <span className="font-bold text-primary-600">AI时间管理大师</span>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={allMenuItems}
          onClick={handleMenuClick}
          className="border-r-0"
        />
      </Drawer>

      {/* 主内容区 */}
      <Content 
        className="mt-16 mb-16 md:mb-0 p-4 md:p-6 bg-gray-50"
        style={{ minHeight: 'calc(100vh - 128px)' }}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </Content>

      {/* 移动端底部导航 */}
      {isMobile && <MobileBottomNav />}
    </AntLayout>
  )
}

export default Layout
