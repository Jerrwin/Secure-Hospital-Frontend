import React from "react";
import { Layout } from "antd";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { setSidebarCollapsed } from "../../../modules/ui/uiSlice";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

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
  min-height: 280px;

  @media (max-width: 768px) {
    margin: 12px 12px 0;
    padding: 16px;
  }
`;

const DashboardLayout = ({ children, user, currentPath }) => {
  const dispatch = useDispatch();
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);

  const handleToggle = (value) => {
    dispatch(setSidebarCollapsed(value));
  };

  // Fallback for user role to prevent crashes if auth state is delayed
  const safeUser = user || { role: "GUEST", name: "Guest User" };

  return (
    <MainLayout>
      <Header user={safeUser} />
      <Layout style={{ background: "#eff6ff" }}>
        <Sidebar 
          role={safeUser.role} 
          currentPath={currentPath} 
          collapsed={collapsed}
          setCollapsed={handleToggle}
        />
        <Layout style={{ background: "#eff6ff", display: 'flex', flexDirection: 'column' }}>
          <StyledContent>{children}</StyledContent>
          <Footer />
        </Layout>
      </Layout>
    </MainLayout>
  );
};

export default React.memo(DashboardLayout);
