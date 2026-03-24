import React, { useMemo } from "react";
import { Timeline, Typography, Tag, Empty, Card, Spin } from "antd";
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  DollarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import dayjs from "dayjs";
import { useTheme } from "../../../context/ThemeContext";

const { Text, Title, Paragraph } = Typography;

const TimelineContainer = styled.div`
  padding: 8px;
  .ant-timeline-item-label {
    font-size: 13px;
    color: #64748b;
  }
`;

const EventCard = styled(Card)`
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  
  .ant-card-body {
    padding: 12px;
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const PatientTimeline = ({ patient, appointments = [], prescriptions = [], invoices = [], loading = false }) => {
  const { theme } = useTheme();
  const timelineData = useMemo(() => {
    if (!patient) return [];

    const events = [];

    // 1. Add Registration Event
    events.push({
      id: `reg-${patient.id}`,
      date: patient.created_at || new Date(),
      type: "Registration",
      title: "Initial Registration",
      details: `Patient registered with status: ${patient.status || "Active"}.`,
      icon: <UserOutlined style={{ color: "#64748b" }} />,
      color: "gray",
    });

    // 2. Add Appointment Events
    appointments
      .filter(app => String(app.patient_id) === String(patient.id) || String(app.PATIENT_ID) === String(patient.id))
      .forEach(app => {
        events.push({
          id: `appt-${app.id || app.ID}`,
          date: app.appointment_date || app.APPOINTMENT_DATE,
          type: "Appointment",
          title: app.reason || app.REASON || "Medical Visit",
          details: `Status: ${app.status || app.STATUS}. ${app.notes || app.NOTES || ""}`,
          doctor: app.doctor_name || app.DOCTOR_NAME || app.staff_name || app.STAFF_NAME,
          icon: <CalendarOutlined style={{ color: theme.primary }} />,
          color: theme.primary,
        });
      });

    // 3. Add Prescription Events
    prescriptions
      .filter(rx => 
        String(rx.patient_id) === String(patient.id) || 
        rx.patient_name === patient.display_name ||
        rx.patient_name === `${patient.first_name} ${patient.last_name}`
      )
      .forEach(rx => {
        const medNames = rx.items?.map(i => i.medicine_name || i.MEDICINE_NAME).join(", ") || "Medications";
        events.push({
          id: `rx-${rx.id || rx.ID}`,
          date: rx.created_at || rx.CREATED_AT,
          type: "Prescription",
          title: "Prescription Issued",
          details: `Medicines: ${medNames}. Instructions: ${rx.notes || "Follow dosage instructions."}`,
          doctor: rx.provider_name || rx.DOCTOR_NAME,
          icon: <MedicineBoxOutlined style={{ color: theme.status.success }} />,
          color: theme.status.success,
        });
      });

    // 4. Add Billing Events
    invoices
      .filter(inv => String(inv.patient_id) === String(patient.id) || String(inv.PATIENT_ID) === String(patient.id))
      .forEach(inv => {
        events.push({
          id: `bill-${inv.id || inv.ID}`,
          date: inv.created_at || inv.CREATED_AT || inv.invoice_date,
          type: "Billing",
          title: `Invoice #${inv.invoice_number || inv.ID}`,
          details: `Amount: $${inv.total_amount || inv.TOTAL_AMOUNT || 0}. Status: ${inv.status || inv.STATUS}.`,
          icon: <DollarOutlined style={{ color: theme.status.warning }} />,
          color: theme.status.warning,
        });
      });

    // Sort by date descending
    return events.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  }, [patient, appointments, prescriptions, invoices, theme]);

  if (!patient) return <Empty description="No patient selected" />;

  if (loading && timelineData.length === 1) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
          description="Loading history..."
        />
      </div>
    );
  }

  return (
    <TimelineContainer>
      <div style={{ marginBottom: "24px" }}>
        <Title level={4} style={{ margin: 0, color: theme.secondary }}>
          Timeline
        </Title>
        <Text type="secondary">Historical activity for {patient.display_name || `${patient.first_name} ${patient.last_name}`}</Text>
      </div>

      {timelineData.length > 0 ? (
        <Timeline
          mode="start"
          items={timelineData.map((event) => ({
            key: event.id,
            title: dayjs(event.date).format("MMM DD, YYYY"),
            icon: event.icon,
            color: event.color,
            content: (
              <EventCard size="small">
                <EventHeader>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Tag
                      color={event.color}
                      style={{
                        width: "fit-content",
                        marginBottom: "4px",
                        fontSize: "10px",
                      }}
                    >
                      {event.type.toUpperCase()}
                    </Tag>
                    <Text strong style={{ fontSize: "14px", color: theme.text.primary }}>
                      {event.title}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: "11px" }}>
                    {dayjs(event.date).format("h:mm A")}
                  </Text>
                </EventHeader>
                <Paragraph
                  style={{ margin: "8px 0", fontSize: "13px", color: "#475569" }}
                >
                  {event.details}
                </Paragraph>
                {event.doctor && (
                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "8px",
                      marginTop: "4px",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Provider:{" "}
                      <Text style={{ color: theme.primary }}>{event.doctor}</Text>
                    </Text>
                  </div>
                )}
              </EventCard>
            ),
          }))}
        />
      ) : (
        <Empty description="No history records found" />
      )}
    </TimelineContainer>
  );
};

export default PatientTimeline;
