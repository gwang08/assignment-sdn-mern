import React, { useState } from 'react';
import { 
  Layout, 
  Menu, 
  Avatar, 
  Dropdown, 
  Button, 
  Typography,
  Badge,
  Space
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  HeartOutlined,
  NotificationOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const getMenuItems = () => {
    const commonItems = [
      {
        key: '/home',
        icon: <HomeOutlined />,
        label: 'Trang chủ',
      },
      {
        key: '/blog',
        icon: <FileTextOutlined />,
        label: 'Tài liệu & Blog',
      },
    ];

    if (user?.role === 'super_admin' || user?.role === 'student_manager') {
      return [
        ...commonItems,
        {
          key: '/admin/dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
      ];
    }

    if (user?.role === 'Nurse' || user?.role === 'Doctor' || user?.role === 'Healthcare Assistant') {
      return [
        ...commonItems,
        {
          key: '/nurse/dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/nurse/medical-events',
          icon: <MedicineBoxOutlined />,
          label: 'Sự kiện y tế',
        },
        {
          key: '/nurse/health-profiles',
          icon: <HeartOutlined />,
          label: 'Hồ sơ sức khỏe',
        },
        {
          key: '/nurse/medicine-requests',
          icon: <FileTextOutlined />,
          label: 'Yêu cầu thuốc',
        },
        {
          key: '/nurse/campaigns',
          icon: <CalendarOutlined />,
          label: 'Chiến dịch y tế',
        },
        {
          key: '/nurse/consultations',
          icon: <UserOutlined />,
          label: 'Lịch tư vấn',
        },
      ];
    }

    if (user?.role === 'parent') {
      return [
        ...commonItems,
        {
          key: '/parent/dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/parent/students',
          icon: <TeamOutlined />,
          label: 'Con em của tôi',
        },
        {
          key: '/parent/health-profiles',
          icon: <HeartOutlined />,
          label: 'Hồ sơ sức khỏe',
        },
        {
          key: '/parent/medicine-requests',
          icon: <MedicineBoxOutlined />,
          label: 'Gửi thuốc',
        },
        {
          key: '/parent/campaigns',
          icon: <SafetyOutlined />,
          label: 'Chiến dịch y tế',
        },
        {
          key: '/parent/consultations',
          icon: <CalendarOutlined />,
          label: 'Lịch tư vấn',
        },
      ];
    }

    if (user?.role === 'student') {
      return [
        ...commonItems,
        {
          key: '/student/dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        {
          key: '/student/health-profile',
          icon: <HeartOutlined />,
          label: 'Hồ sơ sức khỏe',
        },
        {
          key: '/student/medical-history',
          icon: <FileTextOutlined />,
          label: 'Lịch sử y tế',
        },
        {
          key: '/student/campaigns',
          icon: <SafetyOutlined />,
          label: 'Chiến dịch y tế',
        },
      ];
    }

    return commonItems;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{ background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.1)' }}
          width={250}
        >
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#3b82f6', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <HeartOutlined style={{ color: 'white', fontSize: '18px' }} />
            </div>
            {!collapsed && (
              <div>
                <Title level={5} style={{ margin: 0, color: '#1d4ed8' }}>
                  Y tế học đường
                </Title>
                <Text style={{ color: '#6b7280', fontSize: '12px' }}>
                  Trường THPT ABC
                </Text>
              </div>
            )}
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => handleMenuClick(key)}
          style={{ borderRight: 'none' }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          backgroundColor: 'white', 
          padding: '0', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '18px', width: '64px', height: '64px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingRight: '24px' }}>
            <Badge count={5} size="small">
              <Button 
                type="text" 
                icon={<NotificationOutlined />} 
                style={{ fontSize: '18px' }}
              />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer', 
                padding: '8px 12px', 
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#1890ff' }}
                />
                <Space direction="horizontal" size={14}>
                  <Text strong style={{ fontSize: '14px' }}>
                   {user?.last_name} {user?.first_name} 
                  </Text>
                  
                  <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                    {user?.role === 'super_admin' && 'Quản trị viên'}
                    {user?.role === 'student_manager' && 'Quản lý học sinh'}
                    {user?.role === 'Nurse' && 'Y tá'}
                    {user?.role === 'Doctor' && 'Bác sĩ'}
                    {user?.role === 'Healthcare Assistant' && 'Trợ lý y tế'}
                    {user?.role === 'parent' && 'Phụ huynh'}
                    {user?.role === 'student' && 'Học sinh'}
                  </Text>
                </Space>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100%' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
