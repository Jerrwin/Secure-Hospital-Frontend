import React, { useMemo } from "react";
import { Row, Col, Tag } from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import StatWidget from "./StatWidget";
import TableWidget from "./TableWidget";

const UnifiedDashboard = ({ role, data, loading }) => {
  // Memoize column definitions for performance
  const appointmentCols = useMemo(
    () => [
      {
        title: "Patient",
        key: "patient_name",
        render: (_, record) => {
          const patient = record.patient || {};
          const firstName = patient.first_name || patient.FIRST_NAME || '';
          const lastName = patient.last_name || patient.LAST_NAME || '';
          const fullName = `${firstName} ${lastName}`.trim();

          return (
            record.patient_name ||
            record.PATIENT_NAME ||
            fullName ||
            record.patientName ||
            "—"
          );
        },
      },
      {
        title: "Date & Time",
        key: "appointment_date",
        render: (_, record) => {
          const date = record.appointment_date || record.APPOINTMENT_DATE || '';
          const time = record.start_time || record.START_TIME || record.time || '';
          return date ? `${date} ${time}`.trim() : "—";
        },
      },
      {
        title: "Status",
        key: "status",
        render: (_, record) => {
          const status = record.status || record.STATUS || '';
          const s = status.toLowerCase();
          const colorMap = {
            scheduled: "blue",
            completed: "green",
            cancelled: "red",
            pending: "orange",
          };
          return <Tag color={colorMap[s] || "default"}>{status || "—"}</Tag>;
        },
      },
    ],
    [],
  );

  const prescriptionCols = useMemo(
    () => [
      { title: "Notes / Medication", dataIndex: "notes", key: "notes", render: (v) => v || '—' },
      { title: "Status", dataIndex: "status", key: "status", render: (v) => <Tag color="blue">{v || '—'}</Tag> },
    ],
    [],
  );

  // The Master Configuration Object
  const DASHBOARD_CONFIG = useMemo(
    () => ({
      ADMIN: {
        stats: [
          {
            title: "Total Patients",
            value: data.stats?.patients_total ?? data.stats?.PATIENTS_TOTAL,
            icon: <TeamOutlined />,
            trend: 12,
          },
          {
            title: "Total Staff",
            value: data.stats?.staff_total ?? data.stats?.STAFF_TOTAL,
            icon: <MedicineBoxOutlined />,
            trend: 2,
          },
          {
            title: "Today's Appointments",
            value: data.stats?.appointments_today ?? data.stats?.APPOINTMENTS_TODAY,
            icon: <CalendarOutlined />,
            trend: 8,
          },
        ],
        tables: [
          {
            title: "Recent Appointments",
            columns: appointmentCols,
            dataKey: "appointments",
            span: 24,
          },
        ],
      },
      DOCTOR: {
        stats: [
          {
            title: "Today's Appointments",
            value: data.stats?.appointments_today,
            icon: <TeamOutlined />,
          },
          {
            title: "Upcoming Appointments",
            value: data.stats?.appointments_upcoming,
            icon: <CalendarOutlined />,
          },
          {
            title: "Pending Prescriptions",
            value: data.stats?.prescriptions_pending,
            icon: <MedicineBoxOutlined />,
          },
        ],
        tables: [
          {
            title: "My Schedule",
            columns: appointmentCols,
            dataKey: "appointments",
            span: 12,
          },
          {
            title: "Recent Prescriptions",
            columns: prescriptionCols,
            dataKey: "prescriptions",
            span: 12,
          },
        ],
      },
      PHARMACIST: {
        stats: [
          {
            title: "Pending Prescriptions",
            value: data.stats?.prescriptions_pending,
            icon: <MedicineBoxOutlined />,
          },
          {
            title: "Today's Appointments",
            value: data.stats?.appointments_today,
            icon: <CalendarOutlined />,
          },
        ],
        tables: [
          {
            title: "Prescription Queue",
            columns: prescriptionCols,
            dataKey: "prescriptions",
            span: 24,
          },
        ],
      },
      NURSE: {
        stats: [
          {
            title: "Active Ward Patients",
            value: data.stats?.wardPatients,
            icon: <TeamOutlined />,
          },
          {
            title: "Vitals to Check",
            value: data.stats?.pendingVitals,
            icon: <MedicineBoxOutlined />,
            trend: -5,
          },
        ],
        tables: [
          {
            title: "My Shift Schedule",
            columns: appointmentCols,
            dataKey: "appointments",
            span: 24,
          },
        ],
      },
      PATIENT: {
        stats: [
          {
            title: "Upcoming Visits",
            value: data.stats?.upcomingVisits,
            icon: <CalendarOutlined />,
          },
          {
            title: "Active Prescriptions",
            value: data.stats?.activePrescriptions,
            icon: <MedicineBoxOutlined />,
          },
        ],
        tables: [
          {
            title: "My Appointments",
            columns: appointmentCols,
            dataKey: "appointments",
            span: 12,
          },
          {
            title: "My Medications",
            columns: prescriptionCols,
            dataKey: "prescriptions",
            span: 12,
          },
        ],
      },
    }),
    [data, appointmentCols, prescriptionCols],
  );

  // Normalize role and handle aliases (e.g., Provider -> DOCTOR)
  const normalizedRole = useMemo(() => {
    const rawRole = (role || "").toUpperCase();
    if (rawRole === "PROVIDER") return "DOCTOR";
    return rawRole;
  }, [role]);

  const currentConfig =
    DASHBOARD_CONFIG[normalizedRole] || DASHBOARD_CONFIG["PATIENT"];

  return (
    <div>
      {/* 1. Render Top Stat Widgets */}
      <Row gutter={[24, 24]}>
        {currentConfig.stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <StatWidget {...stat} />
          </Col>
        ))}
      </Row>

      {/* 2. Render Data Tables */}
      <Row gutter={[24, 24]}>
        {currentConfig.tables.map((table, index) => (
          <Col xs={24} lg={table.span} key={index}>
            <TableWidget
              title={table.title}
              columns={table.columns}
              dataSource={data[table.dataKey] || []}
              loading={loading}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default React.memo(UnifiedDashboard);
