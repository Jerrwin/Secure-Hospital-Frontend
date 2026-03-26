import React, { useState, useMemo, useCallback, memo } from "react";
import { Table, Tag, Button, Tooltip, Popconfirm, Empty, Space } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloseOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

// Colors C removed to use useTheme() hook
import { useTheme } from "../../context/ThemeContext";
import LoadingScreen from "../../components/common/LoadingScreen";

// ─── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG = (theme) => ({
  created: { color: theme.primary, label: "Created" },
  verified: { color: theme.accent, label: "Verified" },
  dispensed: { color: theme.status.success, label: "Dispensed" },
});

const getStatusColor = (s, theme) => {
  const config = STATUS_CONFIG(theme);
  const rawStatus = (s || "").toLowerCase();
  return config[rawStatus]?.color || "default";
};

const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once Daily" },
  { value: "twice_daily", label: "Twice Daily" },
  { value: "thrice_daily", label: "Thrice Daily" },
  { value: "four_times_daily", label: "Four Times Daily" },
  { value: "as_needed", label: "As Needed" },
  { value: "weekly", label: "Weekly" },
];

// ─── Styled ───────────────────────────────────────────────────────
const StyledCard = styled.div`
  background: ${(props) => props.theme.background.card};
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.border};
  box-shadow: ${(props) => props.theme.shadow};
  overflow: hidden;
  .ant-pagination-item-active {
    border-color: transparent !important;
    background-color: transparent !important;
  }
  .ant-pagination-item-active:hover {
    border-color: transparent !important;
  }
`;

const PatientCard = styled.div`
  background: ${(props) => props.theme.background.card};
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.border};
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: ${(props) => props.theme.shadow};
  transition: all 0.2s;

  &:hover {
    box-shadow: ${(props) => props.theme.glow};
  }

  .p-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .p-name {
    font-weight: 600;
    color: ${(props) => props.theme.primary};
    font-size: 0.95rem;
  }

  .p-date {
    font-size: 0.82rem;
    color: ${(props) => props.theme.text.secondary};
  }
`;

const MedGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Highlight = styled.span`
  background-color: ${(props) => props.theme.status.warning}88;
  font-weight: bold;
  padding: 0 4px;
`;

// ─── Helpers ──────────────────────────────────────────────────────
const highlightText = (text, query) => {
  const q = (query || "").trim();
  if (!q || !text) return text;
  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = String(text).split(new RegExp(`(${escapedQuery})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <Highlight key={i}>{part}</Highlight>
        ) : (
          part
        ),
      )}
    </span>
  );
};

// ─── Main Component ─────────────────────────────────────────────
const PrescriptionList = ({
  prescriptions,
  patients = [],
  appointments = [],
  loading,
  userRole,
  searchQuery,
  onEdit,
  onDelete,
  onStatusChange,
  pagination: externalPagination,
  pagedActions,
  statusFilter,
}) => {
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState(null);

  const role = userRole?.toUpperCase();
  const isMedicalStaff = ["DOCTOR", "PROVIDER", "ADMIN"].includes(role);
  const isPharmacist = role === "PHARMACIST";
  const isPatientView = ["PATIENT", "NURSE", "RECEPTIONIST"].includes(role);

  // ─── Table Columns ────────────────────────────────────────────
  const columns = useMemo(() => {
    const cols = [];

    // 1. Patient Column (for Staff)
    if (isMedicalStaff || isPharmacist) {
      cols.push({
        title: "Patient",
        key: "patient",
        render: (_, r) => {
          // 1. Direct field or nested object
          let name =
            r.patient_name ||
            (r.patient
              ? `${r.patient.first_name || ""} ${r.patient.last_name || ""}`.trim()
              : null);

          // 2. Fallback: Lookup in patients list
          const pId = r.patient_id || r.patientId;
          if (!name && pId && patients.length > 0) {
            const found = patients.find((p) => String(p.id) === String(pId));
            if (found) {
              name =
                `${found.first_name || ""} ${found.last_name || ""}`.trim() ||
                found.name;
            }
          }

          // 3. Fallback: Lookup in appointments list (prescriptions are tied to appts)
          const apptId = r.appointment_id || r.appointmentId;
          if (!name && apptId && appointments && appointments.length > 0) {
            const appt = appointments.find(
              (a) => String(a.id) === String(apptId),
            );
            if (appt) {
              name = appt.patient_name || appt.patientName;
              if (!name && appt.patient_id && patients.length > 0) {
                const p = patients.find(
                  (p) => String(p.id) === String(appt.patient_id),
                );
                if (p)
                  name =
                    `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
                    p.name;
              }
            }
          }

          return highlightText(name || "N/A", searchQuery);
        },
      });
    }

    // 2. Doctor Column (for Pharmacists or anyone else needing it)
    if (isPharmacist) {
      cols.push({
        title: "Doctor",
        key: "doctor",
        render: (_, r) => {
          const name =
            r.provider_name ||
            r.doctor?.name ||
            (r.doctor ? `${r.doctor.first_name} ${r.doctor.last_name}` : "—");
          return highlightText(name, searchQuery);
        },
      });
    }

    // 3. Date Column
    cols.push({
      title: "Date",
      dataIndex: "created_at",
      key: "date",
      render: (v, r) => {
        const date = v || r.appointment_date || r.date;
        return date ? new Date(date).toLocaleDateString() : "—";
      },
    });

    // 4. View Details Column (Icon only, as per feedback)
    if (isMedicalStaff || isPharmacist) {
      cols.push({
        title: "View",
        key: "expand",
        width: 80,
        render: (_, r) => (
          <Button
            type="text"
            size="small"
            icon={
              expandedId === r.id ? (
                <CloseOutlined style={{ color: theme.text.secondary }} />
              ) : (
                <EyeOutlined style={{ color: theme.primary }} />
              )
            }
            onClick={() =>
              setExpandedId((prev) => (prev === r.id ? null : r.id))
            }
          />
        ),
      });
    }

    // 5. Status Column
    cols.push({
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s, r) => {
        const rawStatus = (s || r.STATUS || r.status_name || "").toLowerCase();
        return (
          <Tag color={getStatusColor(rawStatus, theme)}>
            {STATUS_CONFIG(theme)[rawStatus]?.label || rawStatus || "Pending"}
          </Tag>
        );
      },
    });

    // 6. Actions Column (Hide if Processed tab is active)
    if (statusFilter !== "dispensed") {
      cols.push({
        title: "Actions",
        key: "actions",
        render: (_, r) => {
          const s = (r.status || r.STATUS || r.status_name || "").toLowerCase();

          if (isMedicalStaff) {
            const isEditable = s === "created";
            return (
              <Space size="small">
                <Tooltip
                  title={
                    isEditable ? "Edit" : "Only editable in 'Created' status"
                  }
                >
                  <Button
                    type="text"
                    size="small"
                    disabled={!isEditable}
                    icon={
                      <EditOutlined
                        style={{
                          color: isEditable ? theme.primary : theme.text.light,
                        }}
                      />
                    }
                    onClick={() => onEdit?.(r)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete this prescription?"
                  onConfirm={() => onDelete?.(r.id)}
                  disabled={!isEditable}
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip
                    title={
                      isEditable
                        ? "Delete"
                        : "Only deletable in 'Created' status"
                    }
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      disabled={!isEditable}
                      icon={
                        <DeleteOutlined
                          style={{
                            color: !isEditable ? theme.text.light : undefined,
                          }}
                        />
                      }
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            );
          }

          if (isPharmacist) {
            return (
              <Space size="small">
                {s === "created" && (
                  <Popconfirm
                    title="Verify this prescription?"
                    onConfirm={() => onStatusChange?.(r.id, "verify")}
                  >
                    <Button
                      size="small"
                      style={{
                        background: theme.primaryLight,
                        borderColor: theme.border,
                        color: theme.primary,
                      }}
                    >
                      Verify
                    </Button>
                  </Popconfirm>
                )}
                {s === "verified" && (
                  <Popconfirm
                    title="Dispense this prescription?"
                    onConfirm={() => onStatusChange?.(r.id, "dispense")}
                  >
                    <Button
                      size="small"
                      style={{
                        background: theme.status.success + "22",
                        borderColor: theme.status.success,
                        color: theme.status.success,
                      }}
                    >
                      Dispense
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            );
          }

          return null;
        },
      });
    }

    return cols;
  }, [
    isMedicalStaff,
    isPharmacist,
    searchQuery,
    expandedId,
    onEdit,
    onDelete,
    onStatusChange,
    patients,
    appointments,
    theme,
    statusFilter,
  ]);

  // ─── Expanded Row Render ──────────────────────────────────────
  const expandedRowRender = useCallback(
    (r) => (
      <div
        style={{
          padding: "12px 20px",
          background: theme.background.main,
          borderRadius: 8,
        }}
      >
        {(isMedicalStaff || isPatientView || isPharmacist) && r.notes && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontWeight: 600,
                color: theme.primary,
                fontSize: "0.85rem",
                marginBottom: 4,
              }}
            >
              Clinical Notes:
            </div>
            <div
              style={{
                color: theme.text.secondary,
                fontStyle: "italic",
                fontSize: "0.9rem",
              }}
            >
              "{r.notes || r.Notes}"
            </div>
          </div>
        )}
        <div
          style={{
            fontWeight: 600,
            color: theme.primary,
            marginBottom: 8,
            fontSize: "0.85rem",
          }}
        >
          Prescription Items:
        </div>
        {(r.items || r.medicines || []).map((m, i) => (
          <div
            key={i}
            style={{
              background: theme.primaryLight,
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 6,
              fontSize: "0.85rem",
              color: theme.text.primary,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span>
              <b>
                {highlightText(m.medicine_name || m.medicineName, searchQuery)}
              </b>
            </span>
            <span>Dosage: {m.dosage}</span>
            <span>
              Freq:{" "}
              {FREQUENCY_OPTIONS.find(
                (f) => f.value === (m.frequency || m.FREQUENCY),
              )?.label || m.frequency}
            </span>
            <span>Duration: {m.duration}</span>
          </div>
        ))}
      </div>
    ),
    [isMedicalStaff, isPatientView, searchQuery, isPharmacist, theme],
  );

  // ─── Rendering ────────────────────────────────────────────────
  if (loading) return <LoadingScreen label="Loading Prescriptions..." />;

  if (isPatientView) {
    if (!prescriptions.length)
      return (
        <StyledCard style={{ padding: 24 }}>
          <Empty description="No prescriptions matching your criteria" />
        </StyledCard>
      );
    return (
      <div style={{ padding: "4px" }}>
        {(prescriptions || []).map((p) => (
          <PatientCard key={p.id}>
            <div className="p-header">
              <div>
                <div className="p-name">
                  Dr.{" "}
                  {highlightText(
                    p.provider_name || p.doctor?.name || "—",
                    searchQuery,
                  )}
                </div>
                <div className="p-date">
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
              <Tag
                color={getStatusColor(
                  (p.status || p.STATUS || "").toLowerCase(),
                  theme,
                )}
              >
                {STATUS_CONFIG(theme)[
                  (p.status || p.STATUS || "").toLowerCase()
                ]?.label || p.status}
              </Tag>
            </div>
            {p.notes && (
              <div
                style={{
                  fontSize: "0.82rem",
                  color: theme.text.secondary,
                  marginBottom: 8,
                  fontStyle: "italic",
                }}
              >
                "{p.notes}"
              </div>
            )}
            <MedGrid>
              {(p.items || p.medicines || []).map((m, i) => (
                <Tooltip
                  key={i}
                  title={`${m.dosage} · ${FREQUENCY_OPTIONS.find((f) => f.value === m.frequency)?.label || m.frequency} · ${m.duration}`}
                >
                  <Tag
                    icon={<MedicineBoxOutlined />}
                    color={theme.primary}
                    style={{ cursor: "default" }}
                  >
                    {highlightText(
                      m.medicine_name || m.medicineName,
                      searchQuery,
                    )}
                  </Tag>
                </Tooltip>
              ))}
            </MedGrid>
          </PatientCard>
        ))}
      </div>
    );
  }

  const renderTable = (data, hideActions = false) => (
    <Table
      className="theme-table"
      columns={
        hideActions ? columns.filter((col) => col.key !== "actions") : columns
      }
      dataSource={(data || []).map((p) => ({ ...p, key: p.id }))}
      loading={loading}
      onChange={pagedActions?.handleTableChange}
      pagination={externalPagination || false}
      scroll={{ x: "max-content" }}
      locale={{
        emptyText: (
          <Empty description="No prescriptions matching your criteria" />
        ),
      }}
      expandable={{
        expandedRowKeys: expandedId ? [expandedId] : [],
        showExpandColumn: false,
        expandedRowRender,
      }}
    />
  );

  return (
    <StyledCard>
      {renderTable(prescriptions)}
      <style>{`
        .theme-table .ant-table-thead > tr > th {
          background: ${theme.background.main} !important;
          color: ${theme.text.secondary} !important;
        }
        .theme-table .ant-table-tbody > tr > td {
          background: ${theme.background.card} !important;
          color: ${theme.text.primary} !important;
        }
      `}</style>
    </StyledCard>
  );
};

export default memo(PrescriptionList);
