import React from 'react';
import { Layout, Avatar, Dropdown, Typography, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import useAuth from '../../../modules/auth/hooks/useAuth';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const StyledHeader = styled(AntHeader)`
  background-color: #ffffff;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2563eb;
  font-size: 1.25rem;
  font-weight: 700;
`;

const Header = ({ user }) => {
  const { logout } = useAuth();
  
  const menuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    }
  };

  return (
    <StyledHeader>
      <Brand>
        <MedicineBoxOutlined style={{ fontSize: '1.5rem' }} />
        <span>MedPortal Unified</span>
      </Brand>
      
      <Dropdown 
        menu={{ items: menuItems, onClick: handleMenuClick }} 
        placement="bottomRight" 
        arrow
      >
        <Space style={{ cursor: 'pointer' }}>
          <Avatar style={{ backgroundColor: '#eff6ff', color: '#2563eb' }} icon={<UserOutlined />} />
          <Text style={{ color: '#334155', fontWeight: 500 }}>
            {user?.name || 'User'}
          </Text>
        </Space>
      </Dropdown>
    </StyledHeader>
  );
};

export default Header;