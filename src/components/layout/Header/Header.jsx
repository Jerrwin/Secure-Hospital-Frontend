import React from 'react';
import { Layout, Button, message } from 'antd';
import { MedicineBoxOutlined, LogoutOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import useAuth from '../../../modules/auth/hooks/useAuth';

const { Header: AntHeader } = Layout;

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

  @media (max-width: 576px) {
    font-size: 1.1rem;
    gap: 8px;
  }
`;

const LogoutButton = styled(Button)`
  display: flex;
  align-items: center;
  border-radius: 6px;
  font-weight: 500;
  color: #ef4444;
  border-color: #fee2e2;
  background: #fef2f2;
  
  &:hover {
    background: #fee2e2 !important;
    color: #dc2626 !important;
    border-color: #fecaca !important;
  }
`;

const Header = () => {
  const { logout } = useAuth();
  
  // Dynamic Hospital Name from Subdomain
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isSubdomain = subdomain !== "localhost" && subdomain !== "www" && hostname.includes(".");
  
  const hospitalName = isSubdomain 
    ? subdomain.charAt(0).toUpperCase() + subdomain.slice(1) 
    : "MedPortal";

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
  };

  return (
    <StyledHeader>
      <Brand>
        <MedicineBoxOutlined style={{ fontSize: '1.5rem' }} />
        <span>{hospitalName}</span>
      </Brand>
      
      <LogoutButton 
        icon={<LogoutOutlined />} 
        onClick={handleLogout}
      >
        Logout
      </LogoutButton>
    </StyledHeader>
  );
};

export default Header;