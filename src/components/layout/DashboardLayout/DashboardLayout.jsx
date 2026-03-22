import React, { Suspense } from "react";
import { Layout, Spin, Drawer } from "antd";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { setSidebarCollapsed, setMobileDrawerOpen } from "../../../modules/ui/uiSlice";
import Sidebar, { SidebarContent } from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import ErrorBoundary from "../../common/ErrorBoundary";
import useAuth from "../../../modules/auth/hooks/useAuth";
import useIdleLogout from "../../../hooks/useIdleLogout";

const { Content } = Layout;

// The main background is set to your specified #eff6ff token
const MainLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden;
  background: #eff6ff;
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
`;

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
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
      
      <Layout style={{ background: "#eff6ff" }}>
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
          title={<span style={{ color: '#1e3a8a', fontWeight: 700 }}>Navigation</span>}
          placement="left"
          onClose={closeMobileDrawer}
          open={mobileDrawerOpen}
          styles={{
            body: { padding: 0, background: '#1e3a8a' },
            header: { borderBottom: '1px solid rgba(255,255,255,0.1)' }
          }}
          width={280}
        >
          <div style={{ background: '#1e3a8a', height: '100%' }}>
            <SidebarContent 
              role={currentUserRole}
              currentPath={location.pathname}
              onMobileClick={closeMobileDrawer}
            />
          </div>
        </Drawer>

        <Layout
          style={{
            background: "#eff6ff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <StyledContent>
            <ErrorBoundary key={location.key}>
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
