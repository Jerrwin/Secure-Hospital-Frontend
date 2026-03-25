import React, { Suspense } from "react";
import { Layout, Drawer } from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import {
  setSidebarCollapsed,
  setMobileDrawerOpen,
} from "../../../modules/ui/uiSlice";
import Sidebar, { SidebarContent } from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ErrorBoundary from "../../common/ErrorBoundary";
import useAuth from "../../../modules/auth/hooks/useAuth";
import useIdleLogout from "../../../hooks/useIdleLogout";
import LoadingScreen from "../../common/LoadingScreen";
import { useTheme } from "../../../context/ThemeContext";

const { Content } = Layout;

// The main background is set to your specified theme token
const MainLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden;
  background: ${(props) => props.theme.background.main};
`;

const StyledContent = styled(Content)`
  margin: 0;
  padding: 24px;
  background: transparent;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: 992px) {
    margin: 12px 12px 0;
    padding: 16px;
  }

  display: flex;
  flex-direction: column;
`;

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme } = useTheme();
  const { user, userRole } = useAuth();

  // Start inactivity timer (5 minutes auto-logout)
  useIdleLogout();
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const mobileDrawerOpen = useSelector((state) => state.ui.mobileDrawerOpen);

  const handleToggle = (value) => {
    dispatch(setSidebarCollapsed(value));
  };

  const closeMobileDrawer = () => {
    dispatch(setMobileDrawerOpen(false));
  };

  // Fallback for user role to prevent crashes if auth state is delayed
  const currentUserRole = userRole || (user?.role || "GUEST").toUpperCase();
  const safeUser = user || { role: "GUEST", name: "Guest User" };

  return (
    <MainLayout>
      <ErrorBoundary variant="mini">
        <Header user={safeUser} />
      </ErrorBoundary>

      <Layout style={{ background: "transparent" }}>
        {/* Persistent Sidebar for Desktop */}
        <Sidebar
          role={currentUserRole}
          user={safeUser}
          currentPath={location.pathname}
          collapsed={collapsed}
          setCollapsed={handleToggle}
        />

        {/* Slide-out Drawer for Mobile */}
        <Drawer
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: theme.primary,
              }}
            >
              <MedicineBoxOutlined style={{ fontSize: "1.4rem" }} />
              <span style={{ fontWeight: 700 }}>MedPortal</span>
            </div>
          }
          placement="left"
          onClose={closeMobileDrawer}
          open={mobileDrawerOpen}
          closeIcon={<span style={{ color: theme.primary }}>×</span>}
          styles={{
            body: { padding: 0, background: theme.secondary },
            header: {
              background: theme.background.card,
              borderBottom: `1px solid ${theme.border}`,
              padding: "16px 20px",
            },
            wrapper: { width: 280 },
          }}
        >
          <div
            style={{
              background: theme.secondary,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SidebarContent
              role={currentUserRole}
              user={safeUser}
              currentPath={location.pathname}
              collapsed={false}
              onMobileClick={closeMobileDrawer}
            />
          </div>
        </Drawer>

        <Layout
          style={{
            background: "transparent",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <StyledContent>
            <ErrorBoundary key={location.key}>
              <Suspense fallback={<LoadingScreen label="Loading Page..." />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
            <div style={{ marginTop: "auto" }}>
              <Footer />
            </div>
          </StyledContent>
        </Layout>
      </Layout>
    </MainLayout>
  );
};

export default React.memo(DashboardLayout);
