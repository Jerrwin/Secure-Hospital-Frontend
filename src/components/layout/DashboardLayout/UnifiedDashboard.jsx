import React, { useMemo } from "react";
import {
  Row,
  Col,
  Tag,
  Card,
  Typography,
  Button,
  Timeline,
  Empty,
  Progress,
  Space,
  Badge,
  Avatar,
} from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  BellOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  UserAddOutlined,
  ArrowRightOutlined,
  HeartOutlined,
  RiseOutlined,
  FireOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { useTheme } from "../../../context/ThemeContext";
import StatWidget from "./StatWidget";
import TableWidget from "./TableWidget";

const { Text, Title } = Typography;

// ─── Shared Keyframes ─────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
`;

// ─── Shared Styled Primitives ─────────────────────────────
const SectionWrap = styled.div`
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${(p) => p.$delay || "0s"};
`;

const GlassCard = styled(Card)`
  border-radius: ${(p) => p.theme.borderRadius.xl} !important;
  border: 1px solid ${(p) => p.theme.border} !important;
  box-shadow: ${(p) => p.theme.shadow};
  background: ${(p) => p.theme.background.card} !important;
  overflow: hidden;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: ${(p) => p.theme.glow};
  }

  .ant-card-head {
    background: ${(p) => p.theme.background.header};
    border-bottom: 1px solid ${(p) => p.theme.border};
    padding: 16px 24px;
    min-height: unset;
  }
  .ant-card-body {
    padding: ${(p) => (p.$noPad ? "0" : "24px")};
  }
`;

const SectionTitle = styled(Title)`
  margin: 0 !important;
  color: ${(p) => p.theme.secondary} !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionBtn = styled(Button)`
  height: 56px;
  border-radius: ${(p) => p.theme.borderRadius.lg} !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: linear-gradient(
    135deg,
    ${(p) => p.theme.primaryLight},
    ${(p) => p.theme.primary}18
  ) !important;
  border: 1px solid ${(p) => p.theme.primary}33 !important;
  color: ${(p) => p.theme.secondary} !important;
  transition: all 0.25s ease !important;

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(
      135deg,
      ${(p) => p.theme.primary}28,
      ${(p) => p.theme.primary}14
    ) !important;
    border-color: ${(p) => p.theme.primary}66 !important;
    box-shadow: ${(p) => p.theme.glow} !important;
    color: ${(p) => p.theme.secondary} !important;
  }
`;

const StatusTag = styled(Tag)`
  border-radius: 999px !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  padding: 2px 10px !important;
  border: none !important;
  text-transform: capitalize;
`;

const MiniProgressBar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: ${(p) => p.theme.border};
  overflow: hidden;
  margin-top: 6px;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(p) => p.$pct || 0}%;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      ${(p) => p.$color || p.theme.primary},
      ${(p) => p.$color || p.theme.primary}88
    );
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
  text-align: center;

  .icon {
    font-size: 2.5rem;
    color: ${(p) => p.theme.primary};
    opacity: 0.4;
    animation: ${glowPulse} 2.5s ease infinite;
  }
`;

const TimelineItem = styled.div`
  padding: 14px 16px;
  border-radius: ${(p) => p.theme.borderRadius.lg};
  background: ${(p) =>
    p.$status === "completed"
      ? p.theme.status.success + "12"
      : p.$status === "cancelled"
        ? p.theme.status.error + "12"
        : p.theme.primaryLight};
  border-left: 3px solid
    ${(p) =>
      p.$status === "completed"
        ? p.theme.status.success
        : p.$status === "cancelled"
          ? p.theme.status.error
          : p.theme.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  animation: ${slideIn} 0.35s ease both;
  animation-delay: ${(p) => p.$delay || "0s"};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(3px);
  }
`;

const PipelineStep = styled.div`
  flex: 1;
  text-align: center;
  padding: 16px 12px;
  border-radius: ${(p) => p.theme.borderRadius.lg};
  background: ${(p) => (p.$active ? p.theme.primaryLight : "transparent")};
  border: 1px solid
    ${(p) => (p.$active ? p.theme.primary + "44" : p.theme.border)};
  transition: all 0.2s ease;
`;

const AlertCard = styled.div`
  padding: 16px 20px;
  border-radius: ${(p) => p.theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${(p) => p.$color}14,
    ${(p) => p.$color}08
  );
  border: 1px solid ${(p) => p.$color}33;
  display: flex;
  align-items: center;
  gap: 16px;
`;

// ─── Lazy Recharts ─────────────────────────────────────────
let AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar;
try {
  const r = require("recharts");
  AreaChart = r.AreaChart;
  Area = r.Area;
  XAxis = r.XAxis;
  YAxis = r.YAxis;
  Tooltip = r.Tooltip;
  ResponsiveContainer = r.ResponsiveContainer;
  PieChart = r.PieChart;
  Pie = r.Pie;
  Cell = r.Cell;
  BarChart = r.BarChart;
  Bar = r.Bar;
} catch (_) {}

// ─── Helpers ───────────────────────────────────────────────
const resolveStatus = (r) => (r.STATUS || r.status || "").toLowerCase();

const getStatusStyle = (s, theme) => {
  const map = {
    scheduled: { bg: theme.primary + "18", color: theme.primary },
    completed: { bg: theme.status.success + "18", color: theme.status.success },
    cancelled: { bg: theme.status.error + "18", color: theme.status.error },
    created: { bg: theme.status.warning + "18", color: theme.status.warning },
    verified: { bg: theme.primary + "18", color: theme.primary },
    dispensed: { bg: theme.status.success + "18", color: theme.status.success },
    pending: { bg: theme.status.warning + "18", color: theme.status.warning },
    paid: { bg: theme.status.success + "18", color: theme.status.success },
  };
  return map[s] || { bg: theme.border, color: theme.text.secondary };
};

const renderStatusTag = (s, theme) => {
  const style = getStatusStyle(s, theme);
  return (
    <StatusTag style={{ background: style.bg, color: style.color }}>
      {s || "—"}
    </StatusTag>
  );
};

const resolveName = (r, patients) => {
  let name =
    r.patient_name ||
    r.patientName ||
    r.PATIENT_NAME ||
    r.patient?.name ||
    (r.patient?.first_name
      ? `${r.patient.first_name} ${r.patient.last_name || ""}`.trim()
      : null) ||
    (r.first_name ? `${r.first_name} ${r.last_name || ""}`.trim() : null);
  const pId =
    r.patient_id ||
    r.patientId ||
    r.PATIENT_ID ||
    r.PatientId ||
    r.patient?.id ||
    r.patient?.ID;
  if (!name && pId && patients?.length > 0) {
    const found = patients.find((p) => String(p.id) === String(pId));
    if (found)
      name =
        `${found.first_name || ""} ${found.last_name || ""}`.trim() ||
        found.name;
  }
  return name || "—";
};

// ═══════════════════════════════════════════════════════════
//  UNIFIED DASHBOARD
// ═══════════════════════════════════════════════════════════
const UnifiedDashboard = ({
  role,
  data,
  patients = [],
  allAppointments = [],
  staffList = [],
  loading,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const normalizedRole = (role || "").toUpperCase();
  const stats = data.stats || {};

  // ─── Filtered Stats ──────────────────────────────────────
  const activeStaffCount = useMemo(() => {
    // If we have no staff array, we must fall back to the backend number
    if (staffList.length === 0) return stats.staff_total || 0;

    return staffList.filter((s) => {
      // 1. Exclude Admin
      const rId = s.role_id || s.roleId || s.role?.id;
      const rName = (s.role_name || s.role?.name || "").toUpperCase();
      if (rId === 1 || rName === "ADMIN") return false;

      // 2. Exclude Inactive
      const isActive = s.status
        ? s.status === "active"
        : s.is_active === true || s.is_active === 1 || s.is_active === "1";

      return isActive;
    }).length;
  }, [data.staff, stats.staff_total]);
 
  // ─── Today's Filtering ────────────────────────────────────
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const todayAppointments = useMemo(() => {
    const raw = data.appointments || [];
    return raw.filter((a) => {
      const aDate = a.appointment_date || a.appointmentDate || a.date;
      if (!aDate) return false;
      // Handle '2026-03-24' or '2026-03-24 10:00:00'
      return aDate.startsWith(todayStr);
    });
  }, [data.appointments, todayStr]);

  // ─── Shared Column Definitions ───────────────────────────
  const appointmentCols = useMemo(
    () => [
      {
        title: "Patient",
        key: "patient",
        render: (_, r) => (
          <Space>
            <Avatar
              size={32}
              style={{
                background: theme.primaryLight,
                color: theme.primary,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {resolveName(r, patients).charAt(0).toUpperCase()}
            </Avatar>
            <Text style={{ color: theme.text.primary, fontWeight: 500 }}>
              {resolveName(r, patients)}
            </Text>
          </Space>
        ),
      },
      {
        title: "Provider",
        key: "provider",
        render: (_, r) => (
          <Text style={{ color: theme.text.secondary }}>
            {r.provider_name || "—"}
          </Text>
        ),
      },
      {
        title: "Time",
        key: "time",
        render: (_, r) =>
          r.start_time ? (
            <Space size={4}>
              <ClockCircleOutlined
                style={{ color: theme.primary, fontSize: 12 }}
              />
              <Text
                style={{ color: theme.text.secondary, fontSize: "0.85rem" }}
              >
                {r.start_time} – {r.end_time || ""}
              </Text>
            </Space>
          ) : (
            "—"
          ),
      },
      {
        title: "Status",
        key: "status",
        render: (_, r) => renderStatusTag(resolveStatus(r), theme),
      },
    ],
    [patients, theme],
  );

  const prescriptionCols = useMemo(
    () => [
      {
        title: "Patient",
        key: "patient",
        render: (_, r) => {
          let pId =
            r.patient_id ||
            r.patientId ||
            r.PATIENT_ID ||
            r.PatientId ||
            r.patient?.id ||
            r.patient?.ID;
          if (!pId && r.appointment_id && allAppointments.length > 0) {
            const apt = allAppointments.find(
              (a) => String(a.id) === String(r.appointment_id),
            );
            if (apt) pId = apt.patient_id || apt.patientId || apt.PATIENT_ID;
          }
          const enriched = pId ? { ...r, patient_id: pId } : r;
          return (
            <Text style={{ color: theme.text.primary, fontWeight: 500 }}>
              {resolveName(enriched, patients)}
            </Text>
          );
        },
      },
      {
        title: "Doctor",
        dataIndex: "provider_name",
        key: "provider",
        render: (v) => (
          <Text style={{ color: theme.text.secondary }}>{v || "—"}</Text>
        ),
      },
      {
        title: "Status",
        key: "status",
        render: (_, r) => renderStatusTag(resolveStatus(r), theme),
      },
    ],
    [patients, theme, allAppointments],
  );

  // ─────────────────────────────────────────────────────────
  //  ADMIN DASHBOARD — "Hospital Pulse"
  // ─────────────────────────────────────────────────────────
  if (normalizedRole === "ADMIN") {
    const trend = data.weekly_trend || [];
    const paidPct =
      stats.paid_invoices && stats.paid_invoices + stats.pending_invoices > 0
        ? Math.round(
            (stats.paid_invoices /
              (stats.paid_invoices + stats.pending_invoices)) *
              100,
          )
        : 0;

    return (
      <div>
        {/* Stat Cards */}
        <Row gutter={[20, 20]}>
          {[
            {
              title: "Total Revenue",
              value: `$${(stats.total_revenue || 0).toLocaleString()}`,
              icon: <DollarOutlined />,
              color: theme.status.success,
              delay: "0.05s",
            },
            {
              title: "Total Patients",
              value: stats.patients_total,
              icon: <TeamOutlined />,
              color: theme.primary,
              delay: "0.10s",
            },
            {
              title: "Active Staff",
              value: activeStaffCount,
              icon: <SafetyCertificateOutlined />,
              color: theme.accent,
              delay: "0.15s",
            },
            {
              title: "Today's Appointments",
              value: stats.appointments_today,
              icon: <CalendarOutlined />,
              color: theme.status.warning,
              delay: "0.20s",
            },
          ].map((s) => (
            <Col key={s.title} xs={24} sm={12} xl={6}>
              <StatWidget {...s} />
            </Col>
          ))}
        </Row>

        {/* Charts Row */}
        <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <GlassCard
              theme={theme}
              title={
                <SectionTitle level={5} theme={theme}>
                  <RiseOutlined /> Appointment Trend — Last 7 Days
                </SectionTitle>
              }
            >
              {ResponsiveContainer && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={trend}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="grad_admin"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={theme.primary}
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor={theme.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: theme.text.secondary }}
                      stroke="transparent"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: theme.text.secondary }}
                      stroke="transparent"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: theme.background.card,
                        border: `1px solid ${theme.border}`,
                        borderRadius: theme.borderRadius.md,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={theme.primary}
                      strokeWidth={2.5}
                      fill="url(#grad_admin)"
                      dot={{ fill: theme.primary, r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState theme={theme}>
                  <RiseOutlined className="icon" />
                  <Text style={{ color: theme.text.secondary }}>
                    No trend data available yet
                  </Text>
                </EmptyState>
              )}
            </GlassCard>
          </Col>

          <Col xs={24} lg={8}>
            <GlassCard
              theme={theme}
              title={
                <SectionTitle level={5} theme={theme}>
                  <DollarOutlined /> Invoice Status
                </SectionTitle>
              }
            >
              <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <Progress
                  type="dashboard"
                  percent={paidPct}
                  strokeColor={theme.status.success}
                  trailColor={theme.border}
                  strokeWidth={8}
                  format={(p) => (
                    <div>
                      <div
                        style={{
                          fontSize: "1.6rem",
                          fontWeight: 800,
                          color: theme.secondary,
                        }}
                      >
                        {p}%
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: theme.text.secondary,
                        }}
                      >
                        Collected
                      </div>
                    </div>
                  )}
                />
              </div>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      borderRadius: theme.borderRadius.md,
                      background: theme.status.success + "12",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: theme.status.success,
                      }}
                    >
                      {stats.paid_invoices || 0}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: theme.text.secondary,
                      }}
                    >
                      Paid
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      borderRadius: theme.borderRadius.md,
                      background: theme.status.warning + "12",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: theme.status.warning,
                      }}
                    >
                      {stats.pending_invoices || 0}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: theme.text.secondary,
                      }}
                    >
                      Pending
                    </div>
                  </div>
                </Col>
              </Row>
            </GlassCard>
          </Col>
        </Row>

        <TableWidget
          title={
            <Space>
              <CalendarOutlined /> Today's Appointments
            </Space>
          }
          columns={appointmentCols}
          dataSource={todayAppointments}
          loading={loading}
          emptyText="No appointments scheduled today"
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  //  PROVIDER DASHBOARD — "Today's Schedule"
  // ─────────────────────────────────────────────────────────
  if (normalizedRole === "PROVIDER") {
    const appointments = data.appointments || [];
    const completedCount = appointments.filter(
      (a) => resolveStatus(a) === "completed",
    ).length;
    const pendingCount = appointments.filter(
      (a) => resolveStatus(a) === "scheduled",
    ).length;

    return (
      <div>
        <Row gutter={[20, 20]}>
          {[
            {
              title: "My Appointments Today",
              value: stats.my_appointments_today,
              icon: <CalendarOutlined />,
              color: theme.primary,
              delay: "0.05s",
            },
            {
              title: "Pending Prescriptions",
              value: stats.prescriptions_pending,
              icon: <FileTextOutlined />,
              color: theme.status.warning,
              delay: "0.10s",
            },
            {
              title: "Total Patients",
              value: stats.patients_total,
              icon: <TeamOutlined />,
              color: theme.status.success,
              delay: "0.15s",
            },
            {
              title: "Unread Alerts",
              value: stats.unread_notifications,
              icon: <BellOutlined />,
              color: theme.status.error,
              delay: "0.20s",
            },
          ].map((s) => (
            <Col key={s.title} xs={24} sm={12} xl={6}>
              <StatWidget {...s} />
            </Col>
          ))}
        </Row>

        <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
          {/* Timeline */}
          <Col xs={24} lg={16}>
            <GlassCard
              theme={theme}
              title={
                <SectionTitle level={5} theme={theme}>
                  <ClockCircleOutlined /> Today's Schedule
                </SectionTitle>
              }
            >
              {appointments.length === 0 ? (
                <EmptyState theme={theme}>
                  <CalendarOutlined className="icon" />
                  <Text style={{ color: theme.text.secondary }}>
                    No appointments scheduled for today
                  </Text>
                </EmptyState>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {todayAppointments.map((apt, i) => {
                    const s = resolveStatus(apt);
                    return (
                      <TimelineItem
                        key={apt.id || i}
                        theme={theme}
                        $status={s}
                        $delay={`${i * 0.05}s`}
                      >
                        <Space>
                          <Avatar
                            size={36}
                            style={{
                              background: theme.primaryLight,
                              color: theme.primary,
                              fontWeight: 700,
                            }}
                          >
                            {resolveName(apt, patients).charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <Text
                              strong
                              style={{
                                color: theme.text.primary,
                                display: "block",
                              }}
                            >
                              {resolveName(apt, patients)}
                            </Text>
                            <Text
                              style={{
                                fontSize: "0.8rem",
                                color: theme.text.secondary,
                              }}
                            >
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {apt.start_time} – {apt.end_time}
                            </Text>
                          </div>
                        </Space>
                        {renderStatusTag(s, theme)}
                      </TimelineItem>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </Col>

          {/* Progress sidebar */}
          <Col xs={24} lg={8}>
            <GlassCard
              theme={theme}
              title={
                <SectionTitle level={5} theme={theme}>
                  <FireOutlined /> Day Progress
                </SectionTitle>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }} size={20}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text.secondary,
                        fontSize: "0.85rem",
                      }}
                    >
                      Completed
                    </Text>
                    <Text strong style={{ color: theme.status.success }}>
                      {completedCount}
                    </Text>
                  </div>
                  <MiniProgressBar
                    theme={theme}
                    $pct={
                      appointments.length
                        ? (completedCount / appointments.length) * 100
                        : 0
                    }
                    $color={theme.status.success}
                  />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text.secondary,
                        fontSize: "0.85rem",
                      }}
                    >
                      Remaining
                    </Text>
                    <Text strong style={{ color: theme.primary }}>
                      {pendingCount}
                    </Text>
                  </div>
                  <MiniProgressBar
                    theme={theme}
                    $pct={
                      appointments.length
                        ? (pendingCount / appointments.length) * 100
                        : 0
                    }
                    $color={theme.primary}
                  />
                </div>
                <div style={{ textAlign: "center", paddingTop: 8 }}>
                  <Button
                    type="primary"
                    style={{
                      background: theme.primary,
                      border: "none",
                      borderRadius: theme.borderRadius.md,
                      fontWeight: 600,
                    }}
                    icon={<FileTextOutlined />}
                    onClick={() => navigate("/prescriptions")}
                  >
                    Write Prescription
                  </Button>
                </div>
              </Space>
            </GlassCard>
          </Col>
        </Row>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  //  RECEPTIONIST DASHBOARD — "Front Desk"
  // ─────────────────────────────────────────────────────────
  if (normalizedRole === "RECEPTIONIST") {
    return (
      <div>
        <Row gutter={[20, 20]}>
          {[
            {
              title: "Today's Appointments",
              value: stats.appointments_today,
              icon: <CalendarOutlined />,
              color: theme.primary,
              delay: "0.05s",
            },
            {
              title: "Total Patients",
              value: stats.patients_total,
              icon: <TeamOutlined />,
              color: theme.status.success,
              delay: "0.10s",
            },
            {
              title: "Pending Invoices",
              value: stats.pending_invoices,
              icon: <DollarOutlined />,
              color: theme.status.warning,
              delay: "0.15s",
            },
          ].map((s) => (
            <Col key={s.title} xs={24} sm={8}>
              <StatWidget {...s} />
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <GlassCard
          theme={theme}
          style={{ marginTop: 24 }}
          title={
            <SectionTitle level={5} theme={theme}>
              <ThunderboltOutlined /> Quick Actions
            </SectionTitle>
          }
        >
          <Row gutter={[16, 16]}>
            {[
              {
                label: "Book Appointment",
                icon: <PlusOutlined />,
                path: "/appointments",
              },
              {
                label: "Process Payment",
                icon: <DollarOutlined />,
                path: "/billing",
              },
            ].map((a) => (
              <Col key={a.label} xs={24} sm={12}>
                <ActionBtn theme={theme} onClick={() => navigate(a.path)}>
                  {a.icon} {a.label}
                </ActionBtn>
              </Col>
            ))}
          </Row>
        </GlassCard>

        <TableWidget
          title={
            <Space>
              <CalendarOutlined /> Today's Full Schedule
            </Space>
          }
          columns={appointmentCols}
          dataSource={todayAppointments}
          loading={loading}
          emptyText="No appointments scheduled today"
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  //  PHARMACIST DASHBOARD — "Prescription Queue"
  // ─────────────────────────────────────────────────────────
  if (normalizedRole === "PHARMACIST") {
    const total =
      (stats.new_prescriptions || 0) +
      (stats.verified_prescriptions || 0) +
      (stats.dispensed_today || 0);

    return (
      <div>
        <Row gutter={[20, 20]}>
          {[
            {
              title: "Needs Review",
              value: stats.new_prescriptions,
              icon: <FileTextOutlined />,
              color: theme.status.warning,
              delay: "0.05s",
            },
            {
              title: "Verified & Ready",
              value: stats.verified_prescriptions,
              icon: <CheckCircleOutlined />,
              color: theme.primary,
              delay: "0.10s",
            },
            {
              title: "Dispensed Today",
              value: stats.dispensed_today,
              icon: <MedicineBoxOutlined />,
              color: theme.status.success,
              delay: "0.15s",
            },
          ].map((s) => (
            <Col key={s.title} xs={24} sm={8}>
              <StatWidget {...s} />
            </Col>
          ))}
        </Row>

        {/* Pipeline */}
        <GlassCard
          theme={theme}
          style={{ marginTop: 24 }}
          title={
            <SectionTitle level={5} theme={theme}>
              <ExperimentOutlined /> Prescription Pipeline
            </SectionTitle>
          }
        >
          <Row gutter={[12, 12]} align="middle">
            {[
              {
                label: "New",
                value: stats.new_prescriptions || 0,
                color: theme.status.warning,
              },
              {
                label: "Verified",
                value: stats.verified_prescriptions || 0,
                color: theme.primary,
              },
              {
                label: "Dispensed",
                value: stats.dispensed_today || 0,
                color: theme.status.success,
              },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <Col xs={7}>
                  <PipelineStep theme={theme} $active={step.value > 0}>
                    <div
                      style={{
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: step.color,
                      }}
                    >
                      {step.value}
                    </div>
                    <Text
                      style={{
                        fontSize: "0.8rem",
                        color: theme.text.secondary,
                      }}
                    >
                      {step.label}
                    </Text>
                    <MiniProgressBar
                      theme={theme}
                      $pct={total ? (step.value / total) * 100 : 0}
                      $color={step.color}
                    />
                  </PipelineStep>
                </Col>
                {i < 2 && (
                  <Col xs={1} style={{ textAlign: "center" }}>
                    <ArrowRightOutlined
                      style={{ color: theme.text.light, fontSize: 14 }}
                    />
                  </Col>
                )}
              </React.Fragment>
            ))}
          </Row>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button
              type="primary"
              icon={<MedicineBoxOutlined />}
              style={{
                background: theme.primary,
                border: "none",
                borderRadius: theme.borderRadius.md,
                fontWeight: 600,
              }}
              onClick={() => navigate("/prescriptions")}
            >
              Open Prescription Queue
            </Button>
          </div>
        </GlassCard>

        <TableWidget
          title={
            <Space>
              <FileTextOutlined /> Recent Prescriptions
            </Space>
          }
          columns={prescriptionCols}
          dataSource={data.prescriptions || []}
          loading={loading}
          emptyText="No prescriptions in the queue"
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  //  NURSE DASHBOARD — "Patient Care"
  // ─────────────────────────────────────────────────────────
  if (normalizedRole === "NURSE") {
    return (
      <div>
        <Row gutter={[20, 20]}>
          {[
            {
              title: "Today's Appointments",
              value: stats.appointments_today,
              icon: <CalendarOutlined />,
              color: theme.primary,
              delay: "0.05s",
            },
            {
              title: "Total Patients",
              value: stats.patients_total,
              icon: <TeamOutlined />,
              color: theme.status.success,
              delay: "0.10s",
            },
          ].map((s) => (
            <Col key={s.title} xs={24} sm={12}>
              <StatWidget {...s} />
            </Col>
          ))}
        </Row>

        <TableWidget
          title={
            <Space>
              <HeartOutlined /> Today's Patient Schedule
            </Space>
          }
          columns={appointmentCols}
          dataSource={todayAppointments}
          loading={loading}
          emptyText="No patients scheduled today"
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  //  PATIENT DASHBOARD — "My Health at a Glance"
  // ─────────────────────────────────────────────────────────
  if (normalizedRole === "PATIENT") {
    const hasPaymentDue =
      stats.unpaid_invoices > 0 || stats.pending_invoices > 0;
    const avgSpend =
      stats.avg_spending ||
      stats.average_spending ||
      (stats.total_paid && stats.appointments_total
        ? Math.round(stats.total_paid / stats.appointments_total)
        : 0);

    return (
      <div>
        {/* Payment alert banner */}
        {hasPaymentDue && (
          <SectionWrap $delay="0s" style={{ marginBottom: 20 }}>
            <AlertCard theme={theme} $color={theme.status.warning}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: theme.borderRadius.md,
                  background: theme.status.warning + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.status.warning,
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              >
                <DollarOutlined />
              </div>
              <div style={{ flex: 1 }}>
                <Text
                  strong
                  style={{ color: theme.status.warning, display: "block" }}
                >
                  Payment Due
                </Text>
                <Text
                  style={{ fontSize: "0.85rem", color: theme.text.secondary }}
                >
                  You have pending medical invoices.
                </Text>
              </div>
              <Button
                size="small"
                style={{
                  background: theme.status.warning,
                  border: "none",
                  color: "#fff",
                  borderRadius: theme.borderRadius.md,
                  fontWeight: 600,
                }}
                onClick={() => navigate("/billing")}
              >
                Pay Now
              </Button>
            </AlertCard>
          </SectionWrap>
        )}

        {/* Health Pulse — 4 stat cards */}
        <Row gutter={[20, 20]}>
          {[
            {
              title: "Next Scheduled Visits",
              value: stats.upcoming_appointments || 0,
              icon: <CalendarOutlined />,
              color: theme.primary,
              delay: "0.05s",
            },
            {
              title: "Active Medications",
              value: stats.active_prescriptions || 0,
              icon: <MedicineBoxOutlined />,
              color: theme.status.success,
              delay: "0.10s",
            },
            {
              title: "Balance Due",
              value: `₹${(stats.unpaid_amount || 0).toLocaleString()}`,
              icon: <DollarOutlined />,
              color: theme.status.warning,
              delay: "0.15s",
            },
            {
              title: "Avg. Visit Cost",
              value: `₹${(avgSpend || 0).toLocaleString()}`,
              icon: <HeartOutlined />,
              color: theme.accent || theme.primaryHover,
              delay: "0.20s",
            },
          ].map((s) => (
            <Col key={s.title} xs={24} sm={12} xl={6}>
              <StatWidget {...s} />
            </Col>
          ))}
        </Row>

        {/* Main content */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Left — tables */}
          <Col xs={24} lg={16}>
            <TableWidget
              title={
                <Space>
                  <CalendarOutlined /> My Upcoming Appointments
                </Space>
              }
              columns={appointmentCols}
              dataSource={data.appointments || []}
              loading={loading}
              pagination={{ pageSize: 5 }}
              emptyText="No upcoming appointments — book one below"
            />
            <TableWidget
              title={
                <Space>
                  <MedicineBoxOutlined /> My Medications
                </Space>
              }
              columns={prescriptionCols}
              dataSource={data.prescriptions || []}
              loading={loading}
              pagination={{ pageSize: 5 }}
              emptyText="No active prescriptions"
            />
          </Col>

          {/* Right — actions + logs */}
          <Col xs={24} lg={8}>
            <GlassCard
              theme={theme}
              title={
                <SectionTitle level={5} theme={theme}>
                  <ThunderboltOutlined /> Portal Actions
                </SectionTitle>
              }
            >
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                {[
                  {
                    label: "Book New Appointment",
                    icon: <CalendarOutlined />,
                    path: "/appointments",
                  },
                  {
                    label: "Request Prescription",
                    icon: <FileTextOutlined />,
                    path: "/prescriptions",
                  },
                  {
                    label: "View Bills & Payments",
                    icon: <DollarOutlined />,
                    path: "/billing",
                  },
                ].map((a) => (
                  <ActionBtn
                    key={a.label}
                    theme={theme}
                    onClick={() => navigate(a.path)}
                  >
                    {a.icon} {a.label}
                  </ActionBtn>
                ))}
              </Space>
            </GlassCard>

            <GlassCard
              theme={theme}
              style={{ marginTop: 24 }}
              title={
                <SectionTitle level={5} theme={theme}>
                  <ClockCircleOutlined /> Recent Activity
                </SectionTitle>
              }
            >
              <Timeline
                style={{ marginTop: 8 }}
                items={[
                  {
                    color: theme.status.success,
                    children: (
                      <div>
                        <Text
                          strong
                          style={{
                            color: theme.text.primary,
                            fontSize: "0.85rem",
                          }}
                        >
                          Appointment Scheduled
                        </Text>
                        <Text
                          style={{
                            display: "block",
                            fontSize: "0.78rem",
                            color: theme.text.secondary,
                          }}
                        >
                          27 Mar 2026
                        </Text>
                      </div>
                    ),
                  },
                  {
                    color: theme.primary,
                    children: (
                      <div>
                        <Text
                          strong
                          style={{
                            color: theme.text.primary,
                            fontSize: "0.85rem",
                          }}
                        >
                          Lab Results Uploaded
                        </Text>
                        <Text
                          style={{
                            display: "block",
                            fontSize: "0.78rem",
                            color: theme.text.secondary,
                          }}
                        >
                          Clinical system updated
                        </Text>
                      </div>
                    ),
                  },
                  {
                    color: theme.text.light,
                    children: (
                      <div>
                        <Text
                          strong
                          style={{
                            color: theme.text.primary,
                            fontSize: "0.85rem",
                          }}
                        >
                          New Device Login
                        </Text>
                        <Text
                          style={{
                            display: "block",
                            fontSize: "0.78rem",
                            color: theme.text.secondary,
                          }}
                        >
                          Security notification
                        </Text>
                      </div>
                    ),
                  },
                ]}
              />
            </GlassCard>
          </Col>
        </Row>
      </div>
    );
  }

  // ─── Fallback ─────────────────────────────────────────────
  return (
    <EmptyState theme={theme} style={{ padding: "100px 0" }}>
      <HeartOutlined className="icon" style={{ fontSize: "3rem" }} />
      <Title level={4} style={{ color: theme.text.secondary, margin: 0 }}>
        Welcome to MedPortal
      </Title>
      <Text style={{ color: theme.text.light }}>
        No dashboard data available for your role.
      </Text>
    </EmptyState>
  );
};

export default React.memo(UnifiedDashboard);
