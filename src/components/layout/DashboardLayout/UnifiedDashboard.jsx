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

const { Text, Title } = Typography;

// ─── Styled Components ──────────────────────────────────
const ChartCard = styled(Card)`
  border-radius: 16px;
  border: 1px solid #eff6ff;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.06);
  margin-top: 24px;
  .ant-card-head { border-bottom: 1px solid #f0f5ff; padding: 16px 24px; }
  .ant-card-body { padding: 24px; }
`;

const QuickActionBtn = styled(Button)`
  height: 64px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border: 1px solid #bfdbfe;
  color: #1e3a8a;
  transition: all 0.25s ease;
  width: 100%;
  &:hover {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.15);
    color: #1e3a8a !important;
    border-color: #93c5fd !important;
  }
`;

const TimelineCard = styled(Card)`
  border-radius: 16px;
  border: 1px solid #eff6ff;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.06);
  margin-top: 24px;
  .ant-card-head { border-bottom: 1px solid #f0f5ff; padding: 16px 24px; }
  .ant-card-body { padding: 24px; }
`;

const TimelineSlot = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${(p) => (p.$status === "completed" ? "#f0fdf4" : p.$status === "cancelled" ? "#fef2f2" : "#eff6ff")};
  border-left: 4px solid ${(p) => (p.$status === "completed" ? "#22c55e" : p.$status === "cancelled" ? "#ef4444" : "#2563eb")};
  margin-bottom: 4px;
`;

const MiniBar = styled.div`
  height: 8px;
  border-radius: 4px;
  background: #eff6ff;
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
    background: linear-gradient(90deg, #2563eb, #3b82f6);
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

const COLORS = ["#22c55e", "#f97316"];

// ═══════════════════════════════════════════════════════════
//  UNIFIED DASHBOARD
// ═══════════════════════════════════════════════════════════
const UnifiedDashboard = ({ role, data, loading }) => {
  const navigate = useNavigate();
  const normalizedRole = (role || "").toUpperCase();

  // ─── Shared Appointment Columns ──────────────────────
  const appointmentCols = useMemo(() => [
    {
      title: "Patient",
      key: "patient_name",
      render: (_, r) => r.patient_name || "—",
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
        const map = { scheduled: "blue", completed: "green", cancelled: "red" };
        return <Tag color={map[s] || "default"} style={{ textTransform: "capitalize" }}>{s || "—"}</Tag>;
      },
    },
  ], []);

  const prescriptionCols = useMemo(() => [
    { title: "Patient", dataIndex: "patient_name", key: "patient_name", render: (v) => v || "—" },
    { title: "Doctor", dataIndex: "provider_name", key: "provider_name", render: (v) => v || "—" },
    {
      title: "Status",
      key: "status",
      render: (_, r) => {
        const s = (r.STATUS || r.status || "").toLowerCase();
        const map = { created: "orange", verified: "blue", dispensed: "green" };
        return <Tag color={map[s] || "default"} style={{ textTransform: "capitalize" }}>{s || "—"}</Tag>;
      },
    },
  ], []);

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
            <ChartCard title={<Title level={5} style={{ margin: 0, color: "#1e3a8a" }}>Appointment Trend (Last 7 Days)</Title>}>
              {ResponsiveContainer && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0" }} />
                    <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorAppointments)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                  <CalendarOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                  <p>No appointment data yet</p>
                </div>
              )}
            </ChartCard>
          </Col>
          <Col xs={24} lg={8}>
            <ChartCard title={<Title level={5} style={{ margin: 0, color: "#1e3a8a" }}>Invoice Status</Title>}>
              {PieChart ? (
                <div style={{ textAlign: "center" }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Space size="large" style={{ marginTop: 8 }}>
                    <Text><span style={{ color: "#22c55e", fontWeight: 700 }}>●</span> Paid ({stats.paid_invoices || 0})</Text>
                    <Text><span style={{ color: "#f97316", fontWeight: 700 }}>●</span> Pending ({stats.pending_invoices || 0})</Text>
                  </Space>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Progress type="circle" percent={paidPct} strokeColor="#22c55e" format={() => `${paidPct}%`} />
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
        <TimelineCard title={<Title level={5} style={{ margin: 0, color: "#1e3a8a" }}>Today's Schedule</Title>}>
          {appointments.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No appointments today" />
          ) : (
            <Timeline
              items={appointments.map((apt) => {
                const s = (apt.STATUS || apt.status || "").toLowerCase();
                const color = s === "completed" ? "green" : s === "cancelled" ? "red" : "blue";
                return {
                  color,
                  content: (
                    <TimelineSlot $status={s}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <Text strong style={{ fontSize: 14, color: "#1e293b" }}>{apt.patient_name || "—"}</Text>
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
        <ChartCard title={<Title level={5} style={{ margin: 0, color: "#1e3a8a" }}>Quick Actions</Title>}>
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
        <ChartCard title={<Title level={5} style={{ margin: 0, color: "#1e3a8a" }}>Prescription Pipeline</Title>}>
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

  // ─── PATIENT DASHBOARD ─────────────────────────────────
  if (normalizedRole === "PATIENT") {
    const stats = data.stats || {};
    return (
      <div>
        <Row gutter={[20, 20]}>
          <Col xs={24} sm={8}>
            <StatWidget
              title="Upcoming Visits"
              value={stats.upcoming_appointments || 0}
              icon={<CalendarOutlined />}
              color="#2563eb"
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatWidget
              title="Active Prescriptions"
              value={stats.active_prescriptions || 0}
              icon={<MedicineBoxOutlined />}
              color="#10b981"
            />
          </Col>
          <Col xs={24} sm={8}>
            <StatWidget
              title="Pending Invoices"
              value={stats.unpaid_invoices || 0}
              icon={<DollarOutlined />}
              color="#f59e0b"
            />
          </Col>
        </Row>

        {/* Quick Actions */}
        <ChartCard
          title={
            <Title level={5} style={{ margin: 0, color: "#1e3a8a" }}>
              Quick Actions
            </Title>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <QuickActionBtn onClick={() => navigate("/appointments")}>
                <PlusOutlined style={{ fontSize: 20 }} />
                Book New Appointment
              </QuickActionBtn>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <QuickActionBtn onClick={() => navigate("/billing")}>
                <FileTextOutlined style={{ fontSize: 20 }} />
                My Invoices & Payments
              </QuickActionBtn>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <QuickActionBtn onClick={() => navigate("/prescriptions")}>
                <MedicineBoxOutlined style={{ fontSize: 20 }} />
                View My Prescriptions
              </QuickActionBtn>
            </Col>
          </Row>
        </ChartCard>

        {/* Tables */}
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={12}>
            <TableWidget
              title="My Upcoming Appointments"
              columns={appointmentCols}
              dataSource={data.appointments || []}
              loading={loading}
            />
          </Col>
          <Col xs={24} lg={12}>
            <TableWidget
              title="Recent Medications"
              columns={prescriptionCols}
              dataSource={data.prescriptions || []}
              loading={loading}
            />
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
