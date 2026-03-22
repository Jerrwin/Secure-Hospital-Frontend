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

const { Sider } = Layout;

// ─── Styled Components ──────────────────────────────────
const StyledSider = styled(Sider)`
  background: #1e3a8a !important;
  box-shadow: 2px 0 8px rgba(37, 99, 235, 0.05);

  /* Hide sidebar completely on mobile screens */
  @media (max-width: 992px) {
    display: none !important;
  }
`;

// ─── Sidebar Content Component ─────────────────────────
// Exported so DashboardLayout can use it for the mobile drawer
export const SidebarContent = ({ currentPath, role, onMobileClick }) => {
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    const rawRole = (role || '').toUpperCase();
    const isPharmacistOrDoctor = rawRole === 'PHARMACIST' || rawRole === 'DOCTOR' || rawRole === 'PROVIDER';
    const isDoctorOrNurse = rawRole === 'DOCTOR' || rawRole === 'NURSE' || rawRole === 'PROVIDER';

    const baseItems = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' }
    ];

    if (rawRole === 'RECEPTIONIST' || isDoctorOrNurse) {
      baseItems.push({ key: '/appointments', icon: <CalendarOutlined />, label: 'Appointments' });
    }

    if (isDoctorOrNurse) {
      baseItems.push({ key: '/patients', icon: <TeamOutlined />, label: 'Patients' });
    }
    if (isPharmacistOrDoctor) {
      baseItems.push({ key: '/prescriptions', icon: <FileTextOutlined />, label: 'Prescriptions' });
    }
    if (rawRole === 'RECEPTIONIST') {
      baseItems.push({ key: '/billing', icon: <DollarOutlined />, label: 'Billing' });
    }
    if (rawRole === 'ADMIN') {
      baseItems.push({ key: '/staff', icon: <IdcardOutlined />, label: 'Staff Management' });
    }

    return baseItems;
  }, [role]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (onMobileClick) {
      onMobileClick();
    }
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[currentPath || '/dashboard']}
      items={navItems}
      onClick={handleMenuClick}
      style={{ marginTop: '24px', background: 'transparent', borderRight: 'none' }}
      theme="dark"
    />
  );
};

// ─── Main Sidebar (Desktop) ─────────────────────────────
const Sidebar = ({ currentPath, role, collapsed, setCollapsed }) => {
  return (
    <StyledSider 
      width={240} 
      breakpoint="lg" 
      collapsedWidth="80"
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <SidebarContent 
        currentPath={currentPath} 
        role={role} 
      />
    </StyledSider>
  );
};

export default Sidebar;