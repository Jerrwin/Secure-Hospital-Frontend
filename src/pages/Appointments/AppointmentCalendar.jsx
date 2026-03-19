import React, { useEffect } from "react";
import styled from "styled-components";
import { Calendar, Badge, Spin, Empty, Tag } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import useAuth from "../../modules/auth/hooks/useAuth";
import useAppointments from "../../modules/appointments/hooks/useAppointments";

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
`;

const CalendarCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(30, 58, 95, 0.08);
  padding: 24px;
  overflow: hidden;

  /* Override Ant Design calendar defaults to match theme */
  .ant-picker-calendar {
    background: transparent;
  }
  .ant-picker-calendar-date-today .ant-picker-calendar-date-value {
    color: #1677ff;
    border-color: #1677ff;
  }
`;

const EventBadge = styled.div`
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1px 4px;
  border-radius: 4px;
  margin-bottom: 2px;
  cursor: default;
  background: ${({ status }) =>
    status === "completed" ? "#f6ffed" :
    status === "cancelled" ? "#fff1f0" :
    "#e6f4ff"};
  color: ${({ status }) =>
    status === "completed" ? "#52c41a" :
    status === "cancelled" ? "#ff4d4f" :
    "#1677ff"};
  border: 1px solid ${({ status }) =>
    status === "completed" ? "#b7eb8f" :
    status === "cancelled" ? "#ffa39e" :
    "#91caff"};
`;

const LegendRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  padding: 12px 0;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
`;

const LegendDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${({ color }) => color};
  display: inline-block;
`;

// ─── Main Component ───────────────────────────────────────────────────────────

const AppointmentCalendar = () => {
  const { user } = useAuth();
  const { list, loading, fetched, fetchAll } = useAppointments();

  // Load appointments if not already fetched
  useEffect(() => {
    if (!fetched) fetchAll();
  }, [fetched]);

  // Build a quick lookup: "YYYY-MM-DD" → array of appointments
  const appointmentsByDate = list.reduce((acc, appt) => {
    const key = appt.appointment_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(appt);
    return acc;
  }, {});

  // Calendar cell renderer
  const dateCellRender = (value) => {
    const key = value.format("YYYY-MM-DD");
    const dayAppts = appointmentsByDate[key] || [];

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {dayAppts.map((appt) => (
          <li key={appt.id}>
            <EventBadge
              status={appt.STATUS?.toLowerCase()}
              title={`${appt.patient_name} – ${dayjs(appt.start_time, "HH:mm:ss").format("hh:mm A")}`}
            >
              {appt.patient_name || `Patient #${appt.patient_id}`}
            </EventBadge>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <DashboardLayout user={user} currentPath="/appointments">
      <PageWrapper>
        {/* ── Header ── */}
        <PageHeader>
          <CalendarOutlined style={{ fontSize: 24, color: "#1677ff" }} />
          <PageTitle>Appointment Calendar</PageTitle>
        </PageHeader>

        {/* ── Legend ── */}
        <LegendRow>
          <LegendItem>
            <LegendDot color="#e6f4ff" style={{ border: "1px solid #91caff" }} />
            Scheduled
          </LegendItem>
          <LegendItem>
            <LegendDot color="#f6ffed" style={{ border: "1px solid #b7eb8f" }} />
            Completed
          </LegendItem>
          <LegendItem>
            <LegendDot color="#fff1f0" style={{ border: "1px solid #ffa39e" }} />
            Cancelled
          </LegendItem>
        </LegendRow>

        {/* ── Calendar ── */}
        <CalendarCard>
          <Spin spinning={loading}>
            {list.length === 0 && !loading ? (
              <Empty description="No appointments to display" style={{ padding: "60px 0" }} />
            ) : (
              <Calendar cellRender={dateCellRender} />
            )}
          </Spin>
        </CalendarCard>
      </PageWrapper>
    </DashboardLayout>
  );
};

export default AppointmentCalendar;
