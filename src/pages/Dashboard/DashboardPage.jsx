import React, { useMemo } from "react";
import { useDispatch } from "react-redux";
import { Result, Button, Spin, Tag, Space } from "antd";
import { fetchDashboardDataRequest } from "../../modules/dashboard/dashboardSlice";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import UnifiedDashboard from "../../components/layout/DashboardLayout/UnifiedDashboard";
import useDashboard from "../../components/layout/DashboardLayout/useDashboard";
import useAuth from "../../modules/auth/hooks/useAuth";

const DashboardPage = () => {
  const dispatch = useDispatch();
  //throw new Error("This is a test crash!");
  const { user, userRole } = useAuth(); // Real user and role from Redux
  const dashboardState = useDashboard(user);

  // Inject Mock Data for missing backend tables (Nurse/Patient)
  const dashboardData = useMemo(() => {
    const baseData = { ...dashboardState };

    if (userRole === "NURSE") {
      baseData.stats = { wardPatients: 14, pendingVitals: 6 };
      baseData.appointments = [
        { id: 1, patientName: "John Doe", time: "09:00 AM", status: "Pending" },
        {
          id: 2,
          patientName: "Jane Smith",
          time: "11:30 AM",
          status: "Completed",
        },
      ];
    }

    if (userRole === "PATIENT") {
      baseData.stats = { upcomingVisits: 1, activePrescriptions: 2 };
      baseData.appointments = [
        {
          id: 1,
          patientName: "Dr. House (Cardiology)",
          time: "Tomorrow, 10:00 AM",
          status: "Pending",
        },
      ];
      baseData.prescriptions = [
        {
          id: 1,
          medication: "Lisinopril",
          patientName: "Self",
          dosage: "10mg Daily",
        },
      ];
    }

    return baseData;
  }, [dashboardState, userRole]);

  //Guard: If user is not yet loaded (e.g. on direct refresh), show loading
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
        <Spin size="large" description="Authenticating..." />
      </div>
    );
  }

  // Error Handling State
  if (dashboardState.error) {
    return (
      <DashboardLayout user={user} currentPath="/dashboard">
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
      </DashboardLayout>
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

      {dashboardState.loading && !dashboardData.stats ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <UnifiedDashboard
          role={userRole}
          data={dashboardData}
          loading={dashboardState.loading}
        />
      )}
    </>
  );
};

export default DashboardPage;
