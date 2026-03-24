import React, { useMemo } from "react";
import { Row, Col, Tag, Card, Typography, Button, Timeline, Empty, Progress, Space } from "antd";
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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import StatWidget from "./StatWidget";
import TableWidget from "./TableWidget";
import { useTheme } from "../../../context/ThemeContext";

const { Text, Title } = Typography;

// ─── Styled Components ──────────────────────────────────
const ChartCard = styled(Card)`
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.border};
  box-shadow: ${props => props.theme.shadow};
  margin-top: 24px;
  .ant-card-head { 
    background: ${props => props.theme.background.header};
    border-bottom: 1px solid ${props => props.theme.border}; 
    padding: 16px 24px; 
  }
  .ant-card-body { padding: 24px; }
`;

const QuickActionBtn = styled(Button)`
  height: 64px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  background: linear-gradient(135deg, ${props => props.theme.background.main}, ${props => props.theme.primaryLight});
  border: 1px solid ${props => props.theme.primaryLight};
  color: ${props => props.theme.secondary};
  transition: all 0.25s ease;
  width: 100%;
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadow};
    color: ${props => props.theme.secondary} !important;
    border-color: ${props => props.theme.primary} !important;
  }
`;

const TimelineCard = styled(Card)`
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.border};
  box-shadow: ${props => props.theme.shadow};
  margin-top: 24px;
  .ant-card-head { 
    background: ${props => props.theme.background.header};
    border-bottom: 1px solid ${props => props.theme.border}; 
    padding: 16px 24px; 
  }
  .ant-card-body { padding: 24px; }
`;

const TimelineSlot = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${(p) => (p.$status === "completed" ? p.theme.status.success + "11" : p.$status === "cancelled" ? p.theme.status.error + "11" : p.theme.primaryLight)};
  border-left: 4px solid ${(p) => (p.$status === "completed" ? p.theme.status.success : p.$status === "cancelled" ? p.theme.status.error : p.theme.primary)};
  margin-bottom: 4px;
`;

const MiniBar = styled.div`
  height: 8px;
  border-radius: 4px;
  background: ${props => props.theme.primaryLight};
  position: relative;
  overflow: hidden;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${(p) => p.$pct || 0}%;
    border-radius: 4px;
    background: linear-gradient(90deg, ${props => props.theme.primary}, ${props => props.theme.primaryHover});
    transition: width 0.6s ease;
  }
`;

// ─── Lazy load recharts (if installed) ──────────────────
let AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell;
try {
  const recharts = require("recharts");
  AreaChart = recharts.AreaChart;
  Area = recharts.Area;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  Tooltip = recharts.Tooltip;
  ResponsiveContainer = recharts.ResponsiveContainer;
  PieChart = recharts.PieChart;
  Pie = recharts.Pie;
  Cell = recharts.Cell;
} catch (e) {
  // recharts not installed yet, charts will render fallback
}

const COLORS = (theme) => [theme.status.success, theme.status.warning, theme.primary];

// ═══════════════════════════════════════════════════════════
//  UNIFIED DASHBOARD
// ═══════════════════════════════════════════════════════════
const UnifiedDashboard = ({ role, data, patients = [], allAppointments = [], loading }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const normalizedRole = (role || "").toUpperCase();

  // ─── Shared Appointment Columns ──────────────────────
  const appointmentCols = useMemo(() => [
    {
      title: "Date",
      dataIndex: "appointment_date",
      key: "date",
      render: (v) => v || "—",
    },
    {
      title: "Patient",
      key: "patient_name",
      render: (_, r) => {
        let name = r.patient_name || r.patientName || r.PATIENT_NAME || r.patient?.name || (r.patient?.first_name ? `${r.patient.first_name} ${r.patient.last_name || ""}`.trim() : null) || (r.first_name ? `${r.first_name} ${r.last_name || ""}`.trim() : null);
        const pId = r.patient_id || r.patientId || r.PATIENT_ID || r.PatientId || r.patient?.id || r.patient?.ID;
        if (!name && pId && patients.length > 0) {
          const found = patients.find(p => String(p.id) === String(pId));
          if (found) name = `${found.first_name || ""} ${found.last_name || ""}`.trim() || found.name;
        }
        return name || "—";
      },
    },
    {
      title: "Provider",
      key: "provider_name",
      render: (_, r) => r.provider_name || "—",
    },
    {
      title: "Time",
      key: "time",
      render: (_, r) => {
        const start = r.start_time || "";
        const end = r.end_time || "";
        return start ? `${start} – ${end}` : "—";
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => {
        const s = (r.STATUS || r.status || "").toLowerCase();
        const map = {
          scheduled: theme.primary,
          completed: theme.status.success,
          cancelled: theme.status.error,
        };
        return <Tag color={map[s] || "default"} style={{ textTransform: "capitalize" }}>{s || "—"}</Tag>;
      },
    },
  ], [patients, theme]);

  const prescriptionCols = useMemo(() => [
    {
      title: "Patient",
      key: "patient_name",
      render: (_, r) => {
        let name = r.patient_name || r.patientName || r.PATIENT_NAME || r.patient?.name || (r.patient?.first_name ? `${r.patient.first_name} ${r.patient.last_name || ""}`.trim() : null) || (r.first_name ? `${r.first_name} ${r.last_name || ""}`.trim() : null);
        let pId = r.patient_id || r.patientId || r.PATIENT_ID || r.PatientId || r.patient?.id || r.patient?.ID;

        if (!pId && r.appointment_id && allAppointments.length > 0) {
          const matchingApt = allAppointments.find(a => String(a.id) === String(r.appointment_id));
          if (matchingApt) {
            pId = matchingApt.patient_id || matchingApt.patientId || matchingApt.PATIENT_ID;
          }
        }

        if (!name && pId && patients.length > 0) {
          const found = patients.find(p => String(p.id) === String(pId));
          if (found) name = `${found.first_name || ""} ${found.last_name || ""}`.trim() || found.name;
        }
        return name || "—";
      },
    },
    { title: "Doctor", dataIndex: "provider_name", key: "provider_name", render: (v) => v || "—" },
    {
      title: "Status",
      key: "status",
      render: (_, r) => {
        const s = (r.STATUS || r.status || "").toLowerCase();
        const map = {
          created: theme.status.warning,
          verified: theme.primary,
          dispensed: theme.status.success,
        };
        return <Tag color={map[s] || "default"} style={{ textTransform: "capitalize" }}>{s || "—"}</Tag>;
      },
    },
  ], [patients, theme, allAppointments]);

  // ─── ADMIN DASHBOARD ──────────────────────────────────
  if (normalizedRole === "ADMIN") {
    const stats = data.stats || {};
    const trend = data.weekly_trend || [];
    const paidPct = stats.paid_invoices
      ? Math.round((stats.paid_invoices / (stats.paid_invoices + stats.pending_invoices)) * 100)
      : 0;
    const pieData = [
      { name: "Paid", value: stats.paid_invoices || 0 },
      { name: "Pending", value: stats.pending_invoices || 0 },
    ];

    return (
      <div>
        {/* Stat Cards */}
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget title="Total Revenue" value={`$${(stats.total_revenue || 0).toLocaleString()}`} icon={<DollarOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget title="Total Patients" value={stats.patients_total} icon={<TeamOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget title="Active Staff" value={stats.staff_total} icon={<MedicineBoxOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget title="Today's Appointments" value={stats.appointments_today} icon={<CalendarOutlined />} />
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={16}>
            <ChartCard title={<Title level={5} style={{ margin: 0, color: theme.secondary }}>Appointment Trend (Last 7 Days)</Title>}>
              {ResponsiveContainer && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: theme.text.secondary }} stroke={theme.border} />
                    <YAxis tick={{ fontSize: 12, fill: theme.text.secondary }} stroke={theme.border} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: theme.borderRadius.md, border: `1px solid ${theme.border}` }} />
                    <Area type="monotone" dataKey="count" stroke={theme.primary} strokeWidth={2.5} fill="url(#colorAppointments)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: theme.text.light }}>
                  <CalendarOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                  <p>No appointment data yet</p>
                </div>
              )}
            </ChartCard>
          </Col>
          <Col xs={24} lg={8}>
            <ChartCard title={<Title level={5} style={{ margin: 0, color: theme.secondary }}>Invoice Status</Title>}>
              {PieChart ? (
                <div style={{ textAlign: "center" }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS(theme)[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Space size="large" style={{ marginTop: 8 }}>
                    <Text><span style={{ color: theme.status.success, fontWeight: 700 }}>●</span> Paid</Text>
                    <Text><span style={{ color: theme.status.warning, fontWeight: 700 }}>●</span> Pending</Text>
                  </Space>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Progress type="circle" percent={paidPct} strokeColor={theme.status.success} format={() => `${paidPct}%`} />
                  <Text type="secondary" style={{ display: "block", marginTop: 12 }}>Invoices Paid Ratio</Text>
                </div>
              )}
            </ChartCard>
          </Col>
        </Row>

        {/* Today's Appointments Table */}
        <TableWidget
          title="Today's Appointments"
          columns={appointmentCols}
          dataSource={data.appointments || []}
          loading={loading}
        />
      </div>
    );
  }

  // ─── PROVIDER DASHBOARD ───────────────────────────────
  if (normalizedRole === "PROVIDER") {
    const stats = data.stats || {};
    const appointments = data.appointments || [];

    return (
      <div>
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget title="My Appointments Today" value={stats.my_appointments_today} icon={<CalendarOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget title="Pending Prescriptions" value={stats.prescriptions_pending} icon={<FileTextOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget title="Total Patients" value={stats.patients_total} icon={<TeamOutlined />} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget title="Unread Alerts" value={stats.unread_notifications} icon={<BellOutlined />} />
          </Col>
        </Row>

        {/* Timeline - Today's Schedule */}
        <TimelineCard title={<Title level={5} style={{ margin: 0, color: theme.secondary }}>Today's Schedule</Title>}>
          {appointments.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No appointments today" />
          ) : (
            <Timeline
              items={appointments.map((apt) => {
                const s = (apt.STATUS || apt.status || "").toLowerCase();
                const color = s === "completed" ? theme.status.success : s === "cancelled" ? theme.status.error : theme.primary;
                return {
                  color,
                  content: (
                    <TimelineSlot $status={s}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <Text strong style={{ fontSize: 14, color: theme.text.primary }}>
                            {(() => {
                              let name = apt.patient_name || apt.patientName || apt.PATIENT_NAME || apt.patient?.name || (apt.patient?.first_name ? `${apt.patient.first_name} ${apt.patient.last_name || ""}`.trim() : null) || (apt.first_name ? `${apt.first_name} ${apt.last_name || ""}`.trim() : null);
                              const pId = apt.patient_id || apt.patientId || apt.PATIENT_ID || apt.PatientId || apt.patient?.id || apt.patient?.ID;
                              if (!name && pId && patients.length > 0) {
                                const found = patients.find(p => String(p.id) === String(pId));
                                if (found) name = `${found.first_name || ""} ${found.last_name || ""}`.trim() || found.name;
                              }
                              return name || "—";
                            })()}
                          </Text>
                          <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {apt.start_time || ""} – {apt.end_time || ""}
                          </Text>
                        </div>
                        <Tag color={color} style={{ textTransform: "capitalize" }}>{s}</Tag>
                      </div>
                    </TimelineSlot>
                  ),
                };
              })}
            />
          )}
        </TimelineCard>
      </div>
    );
  }

  // ─── RECEPTIONIST DASHBOARD ───────────────────────────
  if (normalizedRole === "RECEPTIONIST") {
    const stats = data.stats || {};

    return (
      <div>
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={8}>
            <StatWidget title="Today's Appointments" value={stats.appointments_today} icon={<CalendarOutlined />} />
          </Col>
          <Col xs={24} sm={8}>
            <StatWidget title="Total Patients" value={stats.patients_total} icon={<TeamOutlined />} />
          </Col>
          <Col xs={24} sm={8}>
            <StatWidget title="Unpaid Invoices" value={stats.pending_invoices} icon={<DollarOutlined />} />
          </Col>
        </Row>

        {/* Quick Action Bar */}
        <ChartCard title={<Title level={5} style={{ margin: 0, color: theme.secondary }}>Quick Actions</Title>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <QuickActionBtn onClick={() => navigate("/appointments")}>
                <PlusOutlined style={{ fontSize: 20 }} />
                Book Appointment
              </QuickActionBtn>
            </Col>
            <Col xs={24} sm={8}>
              <QuickActionBtn onClick={() => navigate("/patients")}>
                <UserAddOutlined style={{ fontSize: 20 }} />
                Register Patient
              </QuickActionBtn>
            </Col>
            <Col xs={24} sm={8}>
              <QuickActionBtn onClick={() => navigate("/billing")}>
                <DollarOutlined style={{ fontSize: 20 }} />
                Process Payment
              </QuickActionBtn>
            </Col>
          </Row>
        </ChartCard>

        {/* Today's Schedule */}
        <TableWidget
          title="Today's Schedule (All Doctors)"
          columns={appointmentCols}
          dataSource={data.appointments || []}
          loading={loading}
        />
      </div>
    );
  }

  // ─── PHARMACIST DASHBOARD ─────────────────────────────
  if (normalizedRole === "PHARMACIST") {
    const stats = data.stats || {};
    const total = (stats.new_prescriptions || 0) + (stats.verified_prescriptions || 0) + (stats.dispensed_today || 0);

    return (
      <div>
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={8}>
            <StatWidget title="New (Needs Review)" value={stats.new_prescriptions} icon={<FileTextOutlined />} />
          </Col>
          <Col xs={24} sm={8}>
            <StatWidget title="Verified (Ready)" value={stats.verified_prescriptions} icon={<CheckCircleOutlined />} />
          </Col>
          <Col xs={24} sm={8}>
            <StatWidget title="Dispensed Today" value={stats.dispensed_today} icon={<MedicineBoxOutlined />} />
          </Col>
        </Row>

        {/* Pipeline visual */}
        <ChartCard title={<Title level={5} style={{ margin: 0, color: theme.secondary }}>Prescription Pipeline</Title>}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={6}><Text type="secondary">New</Text><MiniBar $pct={total ? ((stats.new_prescriptions || 0) / total) * 100 : 0} /></Col>
            <Col span={2} style={{ textAlign: "center" }}>→</Col>
            <Col span={6}><Text type="secondary">Verified</Text><MiniBar $pct={total ? ((stats.verified_prescriptions || 0) / total) * 100 : 0} /></Col>
            <Col span={2} style={{ textAlign: "center" }}>→</Col>
            <Col span={6}><Text type="secondary">Dispensed</Text><MiniBar $pct={total ? ((stats.dispensed_today || 0) / total) * 100 : 0} /></Col>
          </Row>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button type="primary" icon={<MedicineBoxOutlined />} onClick={() => navigate("/prescriptions")}>
              Open Prescription Queue
            </Button>
          </div>
        </ChartCard>

        {/* Prescription table */}
        <TableWidget
          title="Recent Prescriptions"
          columns={prescriptionCols}
          dataSource={data.prescriptions || []}
          loading={loading}
        />
      </div>
    );
  }

  // ─── NURSE DASHBOARD ──────────────────────────────────
  if (normalizedRole === "NURSE") {
    const stats = data.stats || {};

    return (
      <div>
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={12}>
            <StatWidget title="Today's Appointments" value={stats.appointments_today} icon={<CalendarOutlined />} />
          </Col>
          <Col xs={24} sm={12}>
            <StatWidget title="Total Patients" value={stats.patients_total} icon={<TeamOutlined />} />
          </Col>
        </Row>

        <TableWidget
          title="Today's Patient Schedule"
          columns={appointmentCols}
          dataSource={data.appointments || []}
          loading={loading}
        />
      </div>
    );
  }

  // ─── PATIENT DASHBOARD ────────────────────────────────
  if (normalizedRole === "PATIENT") {
    const stats = data.stats || {};

    return (
      <div style={{ padding: "8px 4px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* 1. Health Pulse Grid (4 Cards) */}
        <Row gutter={[20, 20]} align="stretch" style={{ marginBottom: 28 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget
              title="Next Scheduled Visits"
              value={stats.upcoming_appointments || 0}
              icon={<CalendarOutlined style={{ fontSize: 20 }} />}
              color={theme.primary}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget
              title="Current Medications"
              value={stats.active_prescriptions || 0}
              icon={<MedicineBoxOutlined style={{ fontSize: 20 }} />}
              color={theme.status.success}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget
              title="Total Balance Due"
              value={`₹${(stats.unpaid_amount || 0).toLocaleString()}`}
              icon={<DollarOutlined style={{ fontSize: 20 }} />}
              color={theme.status.warning}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget
              title="Average Visit Cost"
              value={`₹${(stats.avg_spending || stats.average_spending || (stats.total_paid / stats.appointments_total) || 0).toLocaleString()}`}
              icon={<CheckCircleOutlined style={{ fontSize: 20 }} />}
              color={theme.primaryHover}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatWidget
              title="Average Visit Cost"
              value={`₹${(stats.avg_spending || stats.average_spending || (stats.total_paid / stats.appointments_total) || 0).toLocaleString()}`}
              icon={<CheckCircleOutlined style={{ fontSize: 20 }} />}
              color="#7c3aed"
            />
          </Col>
        </Row>

        {/* 2. Unified Content Layout */}
        <Row gutter={[24, 24]}>

          {/* Clinical Records Column */}
          <Col xs={24} lg={16}>
            <TableWidget
              title={<Space style={{ fontWeight: 600 }}><CalendarOutlined /> My Recent Appointments</Space>}
              columns={appointmentCols}
              dataSource={data.appointments || []}
              loading={loading}
              pagination={{ pageSize: 5 }}
            />
            <div style={{ marginTop: 28 }}>
              <TableWidget
                title={<Space style={{ fontWeight: 600 }}><MedicineBoxOutlined /> Medication Records</Space>}
                columns={prescriptionCols}
                dataSource={data.prescriptions || []}
                loading={loading}
                pagination={{ pageSize: 5 }}
              />
            </div>
          </Col>

          {/* Operations & Activity Sidebar */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space style={{ fontSize: 15, fontWeight: 600, color: theme.text.primary }}>
                  <PlusOutlined style={{ fontSize: 13 }} /> Portal Operations
                </Space>
              }
              style={{
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadow,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <QuickActionBtn onClick={() => navigate("/appointments")}>
                  <Space><CalendarOutlined /> Book New Appointment</Space>
                </QuickActionBtn>
                <QuickActionBtn onClick={() => navigate("/prescriptions")}>
                  <Space><FileTextOutlined /> Request Prescription Update</Space>
                </QuickActionBtn>
                <QuickActionBtn onClick={() => navigate("/billing")}>
                  <Space><DollarOutlined /> Transaction Statements</Space>
                </QuickActionBtn>
              </Space>
            </Card>

            <Card
              style={{
                marginTop: 28,
                borderRadius: theme.borderRadius.lg,
                background: theme.background.sidebar || theme.background.main,
                border: `1px solid ${theme.border}`,
              }}
              title={
                <Space style={{ fontSize: 15, fontWeight: 600, color: theme.text.secondary }}>
                  <ClockCircleOutlined style={{ fontSize: 13 }} /> Latest Portal Logs
                </Space>
              }
            >
              <Timeline
                mode="left"
                style={{ marginTop: 12 }}
                items={[
                  { color: theme.status.success, children: <span style={{ fontSize: "13px", color: theme.text.primary }}>Appointment scheduled - 27 Mar 2026</span> },
                  { color: theme.primary, children: <span style={{ fontSize: "13px", color: theme.text.primary }}>Lab results uploaded into clinical system</span> },
                  { color: theme.text.light, children: <span style={{ fontSize: "13px", color: theme.text.primary }}>Security login from new device detected</span> },
                ]}
              />
            </Card>

            {/* Payment Due Alert */}
            {(stats.unpaid_invoices > 0 || stats.pending_invoices > 0) && (
              <Card
                style={{
                  marginTop: 28,
                  borderRadius: theme.borderRadius.lg,
                  background: `linear-gradient(135deg, ${theme.status.warning}18 0%, ${theme.background.main} 100%)`,
                  border: `1px solid ${theme.status.warning}55`,
                  boxShadow: `0 2px 8px ${theme.status.warning}18`,
                }}
              >
                <Title level={5} style={{ color: theme.status.warning, marginBottom: 8, fontSize: 15 }}>
                  Payment Due
                </Title>
                <Text style={{ color: theme.status.warning, fontSize: 13, display: "block", marginBottom: 12, opacity: 0.85 }}>
                  You have pending medical invoices.
                </Text>
                <Button
                  block
                  type="primary"
                  size="middle"
                  icon={<DollarOutlined />}
                  style={{
                    background: theme.status.warning,
                    border: "none",
                    borderRadius: theme.borderRadius.md,
                    fontWeight: 500,
                  }}
                  onClick={() => navigate("/billing")}
                >
                  Settle Payment
                </Button>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    );
  }

  // ─── DEFAULT FALLBACK ─────────────────────────────────
  return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <Empty description="Welcome! No dashboard data available for your role." />
    </div>
  );
};

export default React.memo(UnifiedDashboard);