import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Table,
  Tag,
  Button,
  Badge,
  Tooltip,
  Popconfirm,
  Empty,
  Tabs,
  Spin,
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloseOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import styled from "styled-components";

// ─── Design Tokens ────────────────────────────────────────────────
const C = {
  primary: "#2563eb",
  secondary: "#1e3a8a",
  bg: "#eff6ff",
  white: "#ffffff",
  text: "#334155",
  textLight: "#64748b",
  border: "#e2e8f0",
};

// ─── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  created: { color: "blue", label: "Created" },
  verified: { color: "gold", label: "Verified" },
  dispensed: { color: "green", label: "Dispensed" },
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
  background: ${C.white};
  border-radius: 12px;
  border: 1px solid ${C.border};
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.05);
  overflow: hidden;
`;

const PatientCard = styled.div`
  background: ${C.white};
  border-radius: 12px;
  border: 1px solid ${C.border};
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 6px rgba(37, 99, 235, 0.04);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.1);
  }

  .p-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .p-name {
    font-weight: 600;
    color: ${C.secondary};
    font-size: 0.95rem;
  }

  .p-date {
    font-size: 0.82rem;
    color: ${C.textLight};
  }
`;

const MedGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Highlight = styled.span`
  background-color: #ffec3d;
  font-weight: bold;
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
  loading,
  userRole,
  searchQuery,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
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
          const name =
            r.patient_name ||
            (r.patient
              ? `${r.patient.first_name} ${r.patient.last_name}`
              : "N/A");
          return highlightText(name, searchQuery);
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
                <CloseOutlined style={{ color: C.textLight }} />
              ) : (
                <EyeOutlined style={{ color: C.primary }} />
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
        const config = STATUS_CONFIG[rawStatus];
        return (
          <Tag color={config?.color || "default"}>
            {config?.label || rawStatus || "Pending"}
          </Tag>
        );
      },
    });

    // 6. Actions Column
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
                      style={{ color: isEditable ? C.primary : "#d9d9d9" }}
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
                    isEditable ? "Delete" : "Only deletable in 'Created' status"
                  }
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    disabled={!isEditable}
                    icon={
                      <DeleteOutlined
                        style={{ color: !isEditable ? "#d9d9d9" : undefined }}
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
                      background: "#fef3c7",
                      borderColor: "#fcd34d",
                      color: "#92400e",
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
                      background: "#d1fae5",
                      borderColor: "#6ee7b7",
                      color: "#065f46",
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

    return cols;
  }, [
    isMedicalStaff,
    isPharmacist,
    searchQuery,
    expandedId,
    onEdit,
    onDelete,
    onStatusChange,
  ]);

  // ─── Expanded Row Render ──────────────────────────────────────
  const expandedRowRender = useCallback(
    (r) => (
      <div
        style={{ padding: "12px 20px", background: "#fcfcfc", borderRadius: 8 }}
      >
        {(isMedicalStaff || isPatientView || isPharmacist) && r.notes && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontWeight: 600,
                color: C.secondary,
                fontSize: "0.85rem",
                marginBottom: 4,
              }}
            >
              Clinical Notes:
            </div>
            <div
              style={{
                color: C.textLight,
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
            color: C.secondary,
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
              background: C.bg,
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 6,
              fontSize: "0.85rem",
              color: C.text,
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
    [isMedicalStaff, isPatientView, searchQuery],
  );

  // ─── Rendering ────────────────────────────────────────────────
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <Spin size="large" />
      </div>
    );

  if (isPatientView) {
    if (!prescriptions.length)
      return (
        <StyledCard style={{ padding: 24 }}>
          <Empty description="No prescriptions matching your criteria" />
        </StyledCard>
      );
    return (
      <div style={{ padding: "4px" }}>
        {prescriptions.map((p) => (
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
                color={
                  STATUS_CONFIG[(p.status || p.STATUS || "").toLowerCase()]
                    ?.color || "default"
                }
              >
                {STATUS_CONFIG[(p.status || p.STATUS || "").toLowerCase()]
                  ?.label || p.status}
              </Tag>
            </div>
            {p.notes && (
              <div
                style={{
                  fontSize: "0.82rem",
                  color: C.textLight,
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
                    color="blue"
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

  const renderTable = (data) => (
    <Table
      columns={columns}
      dataSource={data.map((p) => ({ ...p, key: p.id }))}
      loading={loading}
      pagination={{ pageSize: 10 }}
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

  if (isPharmacist) {
    const pending = prescriptions.filter((p) =>
      ["created", "verified"].includes(
        (p.status || p.STATUS || "").toLowerCase(),
      ),
    );
    const processed = prescriptions.filter(
      (p) => (p.status || p.STATUS || "").toLowerCase() === "dispensed",
    );

    return (
      <StyledCard style={{ padding: "0 16px" }}>
        <Tabs
          items={[
            {
              key: "pending",
              label: (
                <span>
                  Pending{" "}
                  <Badge
                    count={pending.length}
                    style={{ background: C.primary, marginLeft: 4 }}
                  />
                </span>
              ),
              children: renderTable(pending),
            },
            {
              key: "processed",
              label: `Processed (${processed.length})`,
              children: renderTable(processed),
            },
          ]}
        />
      </StyledCard>
    );
  }

  return <StyledCard>{renderTable(prescriptions)}</StyledCard>;
};

export default memo(PrescriptionList);
