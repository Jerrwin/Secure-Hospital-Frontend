import React, { useMemo } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography, Space } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  BankOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useTheme } from "../../../context/ThemeContext";

const { Sider } = Layout;
const { Text } = Typography;

// ─── Styled Components ──────────────────────────────────
const StyledSider = styled(Sider)`
  background: ${(props) =>
    props.theme.name === "dark"
      ? props.theme.background.card
      : props.theme.secondary} !important;
  box-shadow: ${(props) => props.theme.shadow};

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  @media (max-width: 992px) {
    display: none !important;
  }
`;

const SidebarProfile = styled.div`
  margin-top: auto;
  margin-left: 12px;
  margin-right: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  overflow: hidden;
  display: flex;
  justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};
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

// ─── Sidebar Content Component ─────────────────────────
export const SidebarContent = ({
  currentPath,
  role,
  user,
  collapsed,
  onMobileClick,
  onClose,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const handleClose = onMobileClick || onClose;

  const profileMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  ];

  const handleProfileClick = ({ key }) => {
    if (key === "profile") navigate("/profile");
    if (key === "settings") navigate("/settings");
    if (handleClose) handleClose();
  };

  const navItems = useMemo(() => {
    const rawRole = (role || "").toUpperCase();
    const isPatient = rawRole === "PATIENT";
    const isPharmacistOrDoctor =
      rawRole === "PHARMACIST" ||
      rawRole === "DOCTOR" ||
      rawRole === "PROVIDER";
    const isDoctorOrNurse =
      rawRole === "DOCTOR" || rawRole === "NURSE" || rawRole === "PROVIDER";

    const baseItems = [
      { key: "/dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    ];

    if (rawRole === "RECEPTIONIST" || isDoctorOrNurse || isPatient) {
      baseItems.push({
        key: "/appointments",
        icon: <CalendarOutlined />,
        label: isPatient ? "My Appointments" : "Appointments",
      });
    }

    if (isDoctorOrNurse) {
      baseItems.push({
        key: "/patients",
        icon: <TeamOutlined />,
        label: "Patients",
      });
    }

    if (isPharmacistOrDoctor || isPatient) {
      baseItems.push({
        key: "/prescriptions",
        icon: <FileTextOutlined />,
        label: isPatient ? "My Medications" : "Prescriptions",
      });
    }

    if (rawRole === "RECEPTIONIST" || isPatient) {
      baseItems.push({
        key: "/billing",
        icon: <BankOutlined />,
        label: isPatient ? "Bills & Invoices" : "Billing",
      });
    }

    if (rawRole === "ADMIN") {
      baseItems.push({
        key: "/staff",
        icon: <IdcardOutlined />,
        label: "Staff Management",
      });
    }

    return baseItems;
  }, [role]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (onMobileClick) onMobileClick();
  };

  return (
    <>
      <Menu
        mode="inline"
        selectedKeys={[currentPath || "/dashboard"]}
        items={navItems}
        onClick={handleMenuClick}
        theme="dark"
        style={{
          marginTop: "24px",
          background: "transparent",
          borderRight: "none",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      />

      <SidebarProfile $collapsed={collapsed}>
        <Dropdown
          menu={{ items: profileMenuItems, onClick: handleProfileClick }}
          placement="topRight"
          arrow
        >
          <UserProfile>
            <Avatar
              style={{
                backgroundColor: theme.primaryLight,
                color: theme.primary,
              }}
              icon={<UserOutlined />}
            />
            {!collapsed && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  {user?.name || "User"}
                </Text>
                <Text
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}
                >
                  {role}
                </Text>
              </div>
            )}
          </UserProfile>
        </Dropdown>
      </SidebarProfile>
    </>
  );
};

// ─── Main Sidebar (Desktop) ─────────────────────────────
const Sidebar = ({ currentPath, role, user, collapsed, setCollapsed }) => {
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
        user={user}
        collapsed={collapsed}
      />
    </StyledSider>
  );
};

export default Sidebar;
