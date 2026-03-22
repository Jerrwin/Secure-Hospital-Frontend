import React, { Suspense } from "react";
import { Layout, Spin } from "antd";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { setSidebarCollapsed } from "../../../modules/ui/uiSlice";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ErrorBoundary from "../../common/ErrorBoundary";
import useAuth from "../../../modules/auth/hooks/useAuth";
import useIdleLogout from "../../../hooks/useIdleLogout";

const { Content } = Layout;

// The main background is set to your specified #eff6ff token
const MainLayout = styled(Layout)`
  min-height: 100vh;
  background: #eff6ff;
`;

const StyledContent = styled(Content)`
  margin: 24px 24px 0;
  padding: 24px;
  background: transparent;
  min-height: auto;

  @media (max-width: 768px) {
    margin: 12px 12px 0;
    padding: 16px;
  }
`;

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, userRole } = useAuth();
  
  // Start inactivity timer (5 minutes auto-logout)
  useIdleLogout();
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);

  const handleToggle = (value) => {
    dispatch(setSidebarCollapsed(value));
  };

  // Fallback for user role to prevent crashes if auth state is delayed
  const currentUserRole = userRole || (user?.role || "GUEST").toUpperCase();
  const safeUser = user || { role: "GUEST", name: "Guest User" };

  return (
    <MainLayout>
      <ErrorBoundary variant="mini">
        <Header user={safeUser} />
      </ErrorBoundary>
      <Layout style={{ background: "#eff6ff" }}>
        <ErrorBoundary variant="mini">
          <Sidebar
            role={currentUserRole}
            currentPath={location.pathname}
            collapsed={collapsed}
            setCollapsed={handleToggle}
          />
        </ErrorBoundary>
        <Layout
          style={{
            background: "#eff6ff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <StyledContent>
            <ErrorBoundary key={location.key}>
              {/* Localized Suspense: Only the page content area shows a loader */}
              {/* Sidebar and Header stay visible and responsive! */}
              <Suspense
                fallback={
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "100px 0" }}>
                    <Spin size="large" description="Loading Page..." />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </StyledContent>
          <Footer />
        </Layout>
      </Layout>
    </MainLayout>
  );
};

export default React.memo(DashboardLayout);
