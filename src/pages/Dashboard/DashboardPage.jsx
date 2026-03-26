import React from "react";
import { Result, Button, Spin, Tag, Space } from "antd";

import UnifiedDashboard from "../../components/layout/DashboardLayout/UnifiedDashboard";
import useDashboard from "../../components/layout/DashboardLayout/useDashboard";
import useAuth from "../../modules/auth/hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import styled from "styled-components";


import useUsers from "../../modules/users/hooks/useUsers";
import usePatients from "../../modules/patients/hooks/usePatients";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import LoadingScreen from "../../components/common/LoadingScreen";

const DashboardHeader = styled.div`
  margin-bottom: 24px;
`;

const WelcomeTitle = styled.h1`
  color: ${(props) => props.theme.secondary};
  font-size: 2.1rem;
  font-weight: 800;
  margin: 0;
`;

const SubtitleText = styled.p`
  color: ${(props) => props.theme.text.secondary};
  font-size: 1rem;
  margin-top: 4px;
`;

const DashboardPage = () => {
  const { theme } = useTheme();
  const { user, userRole } = useAuth();
  const dashboardData = useDashboard(user);
  const { patients } = usePatients();
  const { list: allAppointments } = useAppointments();
  const { staffList } = useUsers();

  // Redundant full-list fetches removed to optimize performance and bandwidth.
  // Dashboard data is now strictly handled by useDashboard (stats endpoint).

  // Guard: If user is not yet loaded, show loading
  if (!user) {
    return <LoadingScreen fullPage label="Loading Dashboard..." />;
  }

  // Error Handling State
  if (dashboardData.error) {
    return (
      <div style={{ padding: "40px" }}>
        <Result
          status="500"
          title="Data Synchronization Failed"
          subTitle="We couldn't load your dashboard data. Please check your connection."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <DashboardHeader>
        <Space align="center" size="middle">
          <WelcomeTitle>Welcome back, {user?.name}</WelcomeTitle>
          <Tag
            color={theme.primary}
            style={{
              borderRadius: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {userRole}
          </Tag>
        </Space>
        <SubtitleText>
          Here is what's happening in your workspace today.
        </SubtitleText>
      </DashboardHeader>

      {dashboardData.loading && !dashboardData.stats ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <ErrorBoundary>
          <UnifiedDashboard
            role={userRole}
            data={dashboardData}
            patients={patients}
            allAppointments={allAppointments}
            staffList={staffList}
            loading={dashboardData.loading}
          />
        </ErrorBoundary>
      )}
    </>
  );
};

export default DashboardPage;
