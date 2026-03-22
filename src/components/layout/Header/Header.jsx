import React from "react";
import { Layout, Avatar, Dropdown, Typography, Space, Button } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MedicineBoxOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { setMobileDrawerOpen } from "../../../modules/ui/uiSlice";
import useSecurity from "../../../modules/security/hooks/useSecurity";
import NotificationBell from "../../common/NotificationBell";

import useAuth from "../../../modules/auth/hooks/useAuth";

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

  @media (max-width: 576px) {
    font-size: 1.1rem;
    gap: 8px;
  }
`;

const HamburgerBtn = styled(Button)`
  display: none;
  margin-right: 12px;
  
  @media (max-width: 992px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

const UserName = styled(Text)`
  color: #334155;
  font-weight: 500;

  @media (max-width: 480px) {
    display: none;
  }
`;

const Header = ({ user }) => {
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const { userRole } = useSecurity();

  // Dynamic Hospital Name from Subdomain
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isSubdomain =
    subdomain !== "localhost" && subdomain !== "www" && hostname.includes(".");

  const hospitalName = isSubdomain
    ? subdomain.charAt(0).toUpperCase() + subdomain.slice(1)
    : "MedPortal";

  const menuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
    }
  };

  return (
    <StyledHeader>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <HamburgerBtn 
          type="text" 
          icon={<MenuOutlined style={{ fontSize: '1.25rem' }} />} 
          onClick={() => dispatch(setMobileDrawerOpen(true))}
        />
        <Brand>
          <MedicineBoxOutlined style={{ fontSize: "1.5rem" }} />
          <span>{hospitalName}</span>
        </Brand>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <NotificationBell />
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow
        >
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              style={{
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.1)",
              }}
              icon={<UserOutlined />}
            />
            <UserName>
              {user?.name || "User"}{" "}
              {userRole && (
                <span style={{ opacity: 0.6, fontSize: "0.85em", marginLeft: 4 }}>
                  ({userRole})
                </span>
              )}
            </UserName>
          </Space>
        </Dropdown>
      </div>
    </StyledHeader>
  );
};

export default Header;
