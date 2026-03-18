import React, { useMemo } from 'react';
import { Layout, Menu, Button } from 'antd';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  IdcardOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  background: #1e3a8a !important;
  height: 100vh;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 100;
  border-right: none;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) !important;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.05);

  .ant-menu {
    background: transparent !important;
    border: none !important;
  }
  
  .ant-menu-item {
    height: 44px !important;
    line-height: 44px !important;
    width: calc(100% - 24px) !important;
    margin: 8px 12px !important;
    border-radius: 8px !important;
    color: rgba(255, 255, 255, 0.75) !important;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease !important;
    
    &:hover {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.08) !important;
    }
    
    &.ant-menu-item-selected {
      background: #2563eb !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      
      .anticon {
        color: #ffffff !important;
      }
    }

    .anticon {
      font-size: 18px !important;
      min-width: 20px;
    }
    
    .ant-menu-title-content {
      margin-left: 12px;
      opacity: ${props => props.collapsed ? 0 : 1};
      transition: opacity 0.2s ease;
    }
  }

  .ant-menu-inline-collapsed {
    width: 80px !important;
    .ant-menu-item {
      width: 48px !important;
      margin: 8px 16px !important;
      padding: 0 14px !important;
    }
  }
`;

const HeaderArea = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const ToggleButton = styled(Button)`
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    color: #ffffff !important;
    transform: rotate(${props => props.collapsed ? '180deg' : '0deg'});
  }

  .anticon {
    font-size: 14px;
    opacity: 0.8;
  }
`;

const Sidebar = ({ currentPath, role, collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    const rawRole = (role || '').toUpperCase();
    const isClinical = rawRole === 'PROVIDER' || rawRole === 'NURSE';
    const isPharmacistOrProv = rawRole === 'PHARMACIST' || rawRole === 'PROVIDER';

    const baseItems = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/appointments', icon: <CalendarOutlined />, label: 'Appointments' },
    ];

    if (isClinical) {
      baseItems.push({ key: '/patients', icon: <TeamOutlined />, label: 'Patients' });
    }
    if (isPharmacistOrProv) {
      baseItems.push({ key: '/prescriptions', icon: <FileTextOutlined />, label: 'Prescriptions' });
    }
    if (rawRole === 'ADMIN') {
      baseItems.push({ key: '/staff', icon: <IdcardOutlined />, label: 'Staff Management' });
    }

    return baseItems;
  }, [role]);

  return (
    <StyledSider 
      width={250} 
      collapsedWidth={80}
      collapsed={collapsed}
      trigger={null}
    >
      <HeaderArea>
        <ToggleButton 
          collapsed={collapsed}
          icon={collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
          onClick={() => setCollapsed(!collapsed)}
        />
      </HeaderArea>

      <Menu
        mode="inline"
        selectedKeys={[currentPath || '/dashboard']}
        items={navItems}
        onClick={({ key }) => navigate(key)}
      />
    </StyledSider>
  );
};

export default Sidebar;