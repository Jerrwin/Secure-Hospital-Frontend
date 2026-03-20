import React, { useMemo } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Avatar, Dropdown, Typography, Space } from 'antd';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const StyledSider = styled(Sider)`
  background: #1e3a8a !important;
  box-shadow: 2px 0 8px rgba(37, 99, 235, 0.05);

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .ant-menu {
    background: transparent;
    border-right: none;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .ant-menu-item {
    color: rgba(255, 255, 255, 0.7);
    border-radius: 6px;
    margin: 8px 12px;
    width: calc(100% - 24px);
    
    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1) !important;
    }
    
    &.ant-menu-item-selected {
      background: #2563eb !important;
      color: #ffffff;
    }
  }
`;

const SidebarProfile = styled.div`
  margin-top: auto;
  margin-left: 12px;
  margin-right: 12px;
  padding-bottom: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  transition: all 0.3s;
  overflow: hidden;
  display: flex;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
`;

const UserProfile = styled(Space)`
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
`;

const Sidebar = ({ currentPath, role, user, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  
  // Memoize navigation items to prevent unnecessary re-renders
  const navItems = useMemo(() => {
    const rawRole = (role || '').toUpperCase();
    const isDoctorOrAdmin = rawRole === 'ADMIN' || rawRole === 'DOCTOR' || rawRole === 'PROVIDER';
    const isPharmacistOrDoctor = rawRole === 'PHARMACIST' || rawRole === 'DOCTOR' || rawRole === 'PROVIDER';

    const baseItems = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/appointments', icon: <CalendarOutlined />, label: 'Appointments' },
    ];

    // Role-based rendering
    if (isDoctorOrAdmin) {
      baseItems.push({ key: '/patients', icon: <TeamOutlined />, label: 'Patients' });
    }
    if (isPharmacistOrDoctor) {
      baseItems.push({ key: '/prescriptions', icon: <FileTextOutlined />, label: 'Prescriptions' });
    }
    if (rawRole === 'ADMIN' || rawRole === 'RECEPTIONIST' || rawRole === 'PROVIDER') {
      baseItems.push({ key: '/billing', icon: <DollarOutlined />, label: 'Billing' });
    }
    if (rawRole === 'ADMIN') {
      baseItems.push({ key: '/staff', icon: <IdcardOutlined />, label: 'Staff Management' });
    }

    return baseItems;
  }, [role]);

  const menuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile');
    }
  };

  return (
    <StyledSider
      width={240}
      breakpoint="lg"
      collapsedWidth="80"
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <Menu
        mode="inline"
        selectedKeys={[currentPath || '/dashboard']}
        items={navItems}
        onClick={({ key }) => navigate(key)}
        style={{ marginTop: '24px' }}
      />

      <SidebarProfile collapsed={collapsed}>
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="topRight"
          arrow
        >
          <UserProfile>
            <Avatar
              style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb'
              }}
              icon={<UserOutlined />}
            />
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text style={{ color: '#fff', fontSize: '13px', fontWeight: 600, display: 'block' }}>
                  {user?.name || 'User'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                  {role}
                </Text>
              </div>
            )}
          </UserProfile>
        </Dropdown>
      </SidebarProfile>
    </StyledSider>
  );
};

export default Sidebar;