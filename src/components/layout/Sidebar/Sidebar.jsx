import React, { useMemo } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  background: #1e3a8a !important;
  min-height: 100vh;
  box-shadow: 2px 0 8px rgba(37, 99, 235, 0.05);

  .ant-menu {
    background: transparent;
    border-right: none;
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

const Sidebar = ({ currentPath, role }) => {
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

    return baseItems;
  }, [role]);

  return (
    <StyledSider width={240} breakpoint="lg" collapsedWidth="80">
      <Menu
        mode="inline"
        selectedKeys={[currentPath || '/dashboard']}
        items={navItems}
        onClick={({ key }) => navigate(key)}
        style={{ marginTop: '24px' }}
      />
    </StyledSider>
  );
};

export default Sidebar;