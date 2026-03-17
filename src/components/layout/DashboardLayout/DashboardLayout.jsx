import React from "react";
import { Layout } from "antd";
import styled from "styled-components";
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
`;

const DashboardLayout = ({ children, user, currentPath }) => {
  // Fallback for user role to prevent crashes if auth state is delayed
  const safeUser = user || { role: "GUEST", name: "Guest User" };
  console.log(safeUser);

  return (
    <MainLayout>
      <Sidebar role={safeUser.role} currentPath={currentPath} />
      <Layout style={{ background: "#eff6ff" }}>
        <Header user={safeUser} />
        <StyledContent>{children}</StyledContent>
        <Footer />
      </Layout>
    </MainLayout>
  );
};

export default React.memo(DashboardLayout);
