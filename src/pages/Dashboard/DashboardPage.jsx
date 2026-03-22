import React from "react";
import { Result, Button, Spin, Tag, Space } from "antd";

import UnifiedDashboard from "../../components/layout/DashboardLayout/UnifiedDashboard";
import useDashboard from "../../components/layout/DashboardLayout/useDashboard";
import useAuth from "../../modules/auth/hooks/useAuth";

const DashboardPage = () => {
  const { user, userRole } = useAuth();
  const dashboardData = useDashboard(user);

  // Guard: If user is not yet loaded, show loading
  if (!user) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#eff6ff",
        }}
      >
        <Spin size="large" />
      </div>
    );
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
      <div style={{ marginBottom: "24px" }}>
        <Space align="center" size="middle">
          <h1 style={{ color: "#1e3a8a", fontSize: "1.75rem", margin: 0 }}>
            Welcome back, {user?.name}
          </h1>
          <Tag
            color="blue"
            style={{
              borderRadius: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {userRole}
          </Tag>
        </Space>
        <p style={{ color: "#64748b", marginTop: "4px" }}>
          Here is what's happening in your workspace today.
        </p>
      </div>

      {dashboardData.loading && !dashboardData.stats ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <UnifiedDashboard
          role={userRole}
          data={dashboardData}
          loading={dashboardData.loading}
        />
      )}
    </>
  );
};

export default DashboardPage;
