import React from "react";
import { Layout, Button, message, Space } from "antd";
import {
  MedicineBoxOutlined,
  PoweroffOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { setMobileDrawerOpen } from "../../../modules/ui/uiSlice";
import useAuth from "../../../modules/auth/hooks/useAuth";
import NotificationBell from "../../common/NotificationBell";

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

  @media (max-width: 576px) {
    padding: 0 12px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HamburgerBtn = styled(Button)`
  display: none;

  @media (max-width: 992px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
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

  @media (max-width: 576px) {
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    background: #ef4444 !important; /* Solid red on mobile for visibility */
    border: none;
    .anticon {
      font-size: 18px;
      color: #ffffff;
      margin: 0;
    }
  }
`;

const Header = () => {
  const dispatch = useDispatch();
  const { logout } = useAuth();

  // Dynamic Hospital Name from Subdomain
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isSubdomain =
    subdomain !== "localhost" && subdomain !== "www" && hostname.includes(".");

  const hospitalName = isSubdomain
    ? subdomain.charAt(0).toUpperCase() + subdomain.slice(1)
    : "MedPortal";

  const handleLogout = () => {
    logout();
    message.success("Logged out successfully");
  };

  const showDrawer = () => {
    dispatch(setMobileDrawerOpen(true));
  };

  return (
    <StyledHeader>
      <LeftSection>
        <HamburgerBtn
          type="text"
          icon={<MenuOutlined />}
          onClick={showDrawer}
        />
        <Brand>
          <MedicineBoxOutlined style={{ fontSize: "1.5rem" }} />
          <span>{hospitalName}</span>
        </Brand>
      </LeftSection>

      <Space size="middle">
        <NotificationBell />
        <LogoutButton
          icon={<PoweroffOutlined />}
          onClick={handleLogout}
          title="Logout"
        />
      </Space>
    </StyledHeader>
  );
};

export default Header;
