import React, {
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Space,
  Empty,
  Drawer,
  Typography,
  Input,
  Tooltip,
  App,
} from "antd";
import { MessageOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import useAuth from "../../modules/auth/hooks/useAuth";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import ChatPanel from "../../pages/Chat/ChatPanel";
import { useTheme } from "../../context/ThemeContext";
import { usePrefetchPagination } from "../../hooks/usePrefetchPagination";
import {
  fetchPagedRequest,
  setPage,
  setSearch,
  setStatus,
} from "../../modules/appointments/appointmentSlice";

const { Option } = Select;
const { Text } = Typography;

const paginationActions = { fetchPagedRequest, setPage, setSearch, setStatus };

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CardWrapper = styled.div`
  background: ${(props) => props.theme.background.card};
  padding: clamp(16px, 4vw, 32px);
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

const Highlight = styled.span`
  background-color: ${(props) => props.theme.status.warning}44;
  font-weight: bold;
  border-bottom: 2px solid ${(props) => props.theme.status.warning};
`;

const ActionBtn = styled(Button)`
  border-radius: 8px;
  font-size: 13px;
  @media (max-width: 576px) {
    padding: 4px 8px;
    font-size: 12px;
  }
`;

const StatusTag = ({ status }) => {
  const { theme } = useTheme();
  const map = {
    scheduled: { color: theme.primary, label: "Scheduled" },
    accepted: { color: theme.accent, label: "Accepted" },
    completed: { color: theme.status.success, label: "Completed" },
    cancelled: { color: theme.status.error, label: "Cancelled" },
  };
  const s = map[status?.toLowerCase()] || { color: "default", label: status };
  return <Tag color={s.color}>{s.label}</Tag>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeRole = (role = "") => role.toUpperCase();

// Highlighting logic
const highlightText = (text, query) => {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Highlight key={i}>{part}</Highlight>
        ) : (
          part
        ),
      )}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AppointmentList = forwardRef(
  ({ searchText: propSearchText, statusFilter: propStatusFilter }, ref) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const role = normalizeRole(user?.role);
    const userId = user?.user_id || user?.id; // Try both user_id and id

    const {
      list,
      patients,
      staff,
      loading: appointmentsLoading,
      submitting,
      dropdownLoading,
      dropdownFetched,
      fetchDropdowns: fetchAppointmentDropdowns,
      create,
      update,
      setProviderId,
    } = useAppointments();
    const { message } = App.useApp();

    const {
      pagination: tablePagination,
      actions: pagedActions,
      searchQuery: activeSearch,
      statusFilter: activeStatus,
    } = usePrefetchPagination({
      selector: (state) => state.appointments,
      actions: paginationActions,
      fixedPageSize: 5,
    });

    const loading = appointmentsLoading;

    // Remove usePatients and use dropdown-specific patients from useAppointments

    // Debugging
    useEffect(() => {
      console.log("CalendarPage rendered & Appointments Component State:", {
        role,
        userId,
        fullUser: user, // Log full user object to see available fields
        patientsCount: patients?.length || 0,
        patientsData: (patients || []).slice(0, 3),
        staffCount: staff.length,
        dropdownLoading,
      });
    }, [role, userId, user, patients, staff, dropdownLoading]);

    const [form] = Form.useForm();
    const statusValue = Form.useWatch("STATUS", form);
    const appointmentDate = Form.useWatch("appointment_date", form);
    const isFutureDate = appointmentDate
      ? appointmentDate.isAfter(dayjs(), "day")
      : false;

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

    // Chat Drawer State
    const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);
    const [activeChatPatient, setActiveChatPatient] = useState("");

    // Expanded Row State (to show reason below)
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    // ── Modal Handlers ──────────────────────────────────────────────────────
    const openCreate = () => {
      // Only fetch dropdown data if not already attempted
      if (!dropdownLoading && !dropdownFetched) {
        fetchAppointmentDropdowns();
      }
      form.resetFields();
      if (role === "DOCTOR" || role === "PROVIDER") {
        form.setFieldsValue({ provider_id: userId });
      }
      if (role === "PATIENT") {
        form.setFieldsValue({ patient_id: userId });
      }
      setEditingId(null);
      setModalOpen(true);
    };

    const openEdit = (record) => {
      // Only fetch dropdown data if not already attempted
      if (!dropdownLoading && !dropdownFetched) {
        fetchAppointmentDropdowns();
      }
      setEditingId(record.id);
      form.setFieldsValue({
        patient_id: Number(record.patient_id),
        provider_id: Number(record.provider_id),
        appointment_date: dayjs(record.appointment_date),
        start_time: dayjs(record.start_time, "HH:mm:ss"),
        end_time: dayjs(record.end_time, "HH:mm:ss"),
        STATUS: record.STATUS?.toLowerCase(),
        reason: record.reason || "",
      });
      setModalOpen(true);
    };

    const openChat = (record) => {
      setActiveChatId(record.id);

      // Resolve patient name for the Drawer title
      let pName = record.patient_name || record.patientName;
      if (!pName && record.patient) {
        pName =
          `${record.patient.first_name || ""} ${record.patient.last_name || ""}`.trim();
      }
      if (!pName && record.patient_id && patients.length > 0) {
        const found = patients.find(
          (p) => String(p.id) === String(record.patient_id),
        );
        if (found) {
          pName =
            `${found.first_name || ""} ${found.last_name || ""}`.trim() ||
            found.name;
        }
      }

      setActiveChatPatient(pName || `Patient #${record.patient_id || "?"}`);
      setChatDrawerOpen(true);
    };

    // Expose actions to parent
    useImperativeHandle(ref, () => ({
      openCreate,
    }));

    useEffect(() => {
      const timer = setTimeout(() => {
        pagedActions.setSearch(propSearchText);
      }, 500);
      return () => clearTimeout(timer);
    }, [propSearchText, pagedActions]);

    useEffect(() => {
      pagedActions.setStatus(propStatusFilter || "all");
    }, [propStatusFilter, pagedActions]);

    // Re-fetch from page 1 handled by usePrefetchPagination
    useEffect(() => {
      if (role === "DOCTOR" || role === "PROVIDER") {
        setProviderId(String(userId));
      }
    }, [role, userId, setProviderId]);

    const { clearError, submitError } = useAppointments();

    useEffect(() => {
      if (submitError) {
        if (submitError === "OFFLINE_QUEUED") {
          setModalOpen(false);
          form.resetFields();
          setEditingId(null);
        } else {
          message.error(submitError);
        }
        clearError();
        setIsSubmittingLocal(false);
      }
    }, [submitError, clearError, form]);

    useEffect(() => {
      if (isSubmittingLocal && !submitting && !submitError) {
        message.success(
          editingId
            ? "Appointment updated successfully"
            : "Appointment scheduled successfully",
        );
        setIsSubmittingLocal(false);
        setModalOpen(false);
        form.resetFields();
        setEditingId(null);
      }
    }, [isSubmittingLocal, submitting, submitError, editingId, form]);

    // ── Initial load ────────────────────────────────────────────────────────
    useEffect(() => {
      if (!dropdownLoading && !dropdownFetched) {
        fetchAppointmentDropdowns();
      }
    }, [fetchAppointmentDropdowns, dropdownLoading, dropdownFetched]);

    // ── Data is now pre-filtered by the server ──────────────────────────────
    const filteredData = list;

    // ── Fallback Staff for Nurse Role ──────────────────────────────────────
    const uniqueStaff = useMemo(() => {
      const map = new Map();
      // 1. Add real staff if we have them
      staff.forEach((s) => {
        // For lightweight lookups, these fields might be missing.
        // We trust the lookup endpoint to return only relevant active providers.
        const hasRoleInfo = !!(s.role || s.role_name);
        const hasStatusInfo = !!(
          s.status !== undefined || s.is_active !== undefined
        );

        const isActive =
          !hasStatusInfo ||
          (s.status
            ? s.status === "active"
            : s.is_active === true || s.is_active === 1 || s.is_active === "1");

        const isProvider =
          !hasRoleInfo ||
          s.role_name?.toLowerCase() === "provider" ||
          s.role_name?.toLowerCase() === "doctor" ||
          s.role?.toLowerCase() === "doctor" ||
          s.role?.toLowerCase() === "provider";

        if (isActive && isProvider) {
          map.set(String(s.id), {
            id: s.id,
            name: s.name || s.full_name || `Doctor #${s.id}`,
          });
        }
      });

      // 2. Extract from appointments only if we failed to get a staff list (fallback for 403s)
      if ((staff || []).length === 0) {
        (list || []).forEach((a) => {
          const pId = a.provider_id;
          if (pId && !map.has(String(pId))) {
            map.set(String(pId), {
              id: pId,
              name: a.provider_name || a.providerName || `Doctor #${pId}`,
            });
          }
        });
      }

      return Array.from(map.values());
    }, [staff, list]);

    // ── Fallback Patients (extracted from appointments list when API is 403) ──
    const uniquePatients = useMemo(() => {
      // If patient, only show themselves as the single option
      if (role === "PATIENT") {
        const fullName =
          user?.full_name ||
          user?.name ||
          `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
          `Patient #${userId}`;

        return [
          {
            id: userId,
            full_name: fullName,
            name: fullName,
          },
        ];
      }

      // Use dropdown patients as the primary source for Admin/Staff
      if (patients && patients.length > 0) return patients;

      // Otherwise extract from the appointments list already loaded (fallback)
      const map = new Map();
      (list || []).forEach((a) => {
        const pid = a.patient_id;
        if (pid && !map.has(String(pid))) {
          const fullName =
            a.patient_name ||
            a.patientName ||
            a.full_name ||
            (a.patient
              ? a.patient.full_name ||
                `${a.patient.first_name || ""} ${a.patient.last_name || ""}`.trim() ||
                a.patient.name
              : `Patient #${pid}`);
          map.set(String(pid), {
            id: pid,
            full_name: fullName,
            name: fullName,
          });
        }
      });
      return Array.from(map.values());
    }, [role, userId, user, patients, list]);

    const handleSubmit = async (values) => {
      // 1. Resolve IDs with strict numeric conversion
      const rawPatientId = values.patient_id || userId;
      const rawProviderId =
        values.provider_id ||
        (role === "DOCTOR" || role === "PROVIDER" ? userId : null);

      const patientId = Number(rawPatientId);
      const providerId = Number(rawProviderId);

      if (isNaN(patientId) || isNaN(providerId) || !patientId || !providerId) {
        return message.error("Invalid Patient or Doctor selection.");
      }

      // 2. Build payload matching the user's requirement exactly (omit STATUS for new)
      const payload = {
        patient_id: patientId,
        provider_id: providerId,
        appointment_date: values.appointment_date.format("YYYY-MM-DD"),
        start_time: values.start_time.format("HH:mm"),
        end_time: values.end_time.format("HH:mm"),
      };

      // 3. Include STATUS only if editing
      if (editingId) {
        payload.STATUS = values.STATUS;
      }

      // ── Conflict Detection ───────────────────────────────────────────────
      const hasConflict = list.some((a) => {
        if (String(a.id) === String(editingId)) return false;
        if (Number(a.provider_id) !== providerId) return false;
        if (a.appointment_date !== payload.appointment_date) return false;
        if (a.STATUS?.toLowerCase() === "cancelled") return false;

        const aStart = dayjs(`${a.appointment_date} ${a.start_time}`);
        const aEnd = dayjs(`${a.appointment_date} ${a.end_time}`);
        const pStart = dayjs(
          `${payload.appointment_date} ${payload.start_time}`,
        );
        const pEnd = dayjs(`${payload.appointment_date} ${payload.end_time}`);

        return pStart.isBefore(aEnd) && pEnd.isAfter(aStart);
      });

      if (hasConflict) {
        return message.error(
          "Conflict! Doctor is already booked at this time.",
        );
      }

      setIsSubmittingLocal(true);
      const submitPayload = {
        ...payload,
        reason: values.reason || "",
      };

      if (editingId) {
        update(editingId, submitPayload);
      } else {
        create(submitPayload);
      }
    };

    const toggleExpand = (recordId) => {
      setExpandedRowKeys((prev) =>
        prev.includes(recordId)
          ? prev.filter((id) => id !== recordId)
          : [...prev, recordId],
      );
    };

    // ─── Table Columns ────────────────────────────────────────────────────────
    const columns = useMemo(
      () =>
        [
          {
            title: "Date",
            dataIndex: "appointment_date",
            key: "date",
            render: (v) => {
              if (!v) return "—";
              const d = dayjs(v);
              return d.isValid() ? d.format("DD MMM YYYY") : "—";
            },
          },
          {
            title: "Time",
            key: "time",
            render: (_, r) => {
              if (!r.start_time || !r.end_time) return "—";
              const start = dayjs(r.start_time, [
                "HH:mm:ss",
                "HH:mm",
                "h:mm A",
                "hh:mm A",
              ]);
              const end = dayjs(r.end_time, [
                "HH:mm:ss",
                "HH:mm",
                "h:mm A",
                "hh:mm A",
              ]);
              return `${start.isValid() ? start.format("hh:mm A") : "Invalid Time"} – ${end.isValid() ? end.format("hh:mm A") : "Invalid Time"}`;
            },
          },
          {
            title: "Patient",
            dataIndex: "patient_name",
            key: "patient",
            render: (text, record) => {
              let name =
                text ||
                record.patientName ||
                (record.patient
                  ? `${record.patient.first_name || ""} ${record.patient.last_name || ""}`.trim()
                  : null);
              if (!name && record.patient_id && patients.length > 0) {
                const found = patients.find(
                  (p) => String(p.id) === String(record.patient_id),
                );
                if (found)
                  name =
                    found.full_name ||
                    found.name ||
                    `${found.first_name || ""} ${found.last_name || ""}`.trim();
              }
              name = name || `Patient #${record.patient_id || "?"}`;
              return highlightText(name, propSearchText);
            },
            hidden: role === "PATIENT",
          },
          {
            title: "Provider",
            dataIndex: "provider_name",
            key: "provider",
            render: (text, record) => {
              // Robust name detection for Nurse/Patient views
              const name =
                text ||
                record.providerName ||
                record.provider_name ||
                (record.provider
                  ? `${record.provider.first_name || record.provider.name || ""} ${record.provider.last_name || ""}`.trim()
                  : "—");
              return highlightText(name || "—", propSearchText);
            },
            hidden: role === "DOCTOR" || role === "PROVIDER",
          },
          {
            title: "View",
            key: "view",
            align: "center",
            render: (_, record) => (
              <Tooltip title="View Reason">
                <Button
                  type="text"
                  icon={
                    <EyeOutlined
                      style={{
                        color: expandedRowKeys.includes(record.id)
                          ? theme.primary
                          : theme.text.light,
                      }}
                    />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(record.id);
                  }}
                />
              </Tooltip>
            ),
          },
          {
            title: "Status",
            dataIndex: "STATUS",
            key: "status",
            render: (s) => <StatusTag status={s} />,
          },
          {
            title: "Actions",
            key: "actions",
            align: "right",
            render: (_, record) => {
              const status = record.STATUS?.toLowerCase();
              const isFinished =
                status === "cancelled" || status === "completed";
              return (
                <Space size="small">
                  {role !== "PATIENT" && (
                    <Tooltip
                      title={
                        isFinished
                          ? "Cannot edit finished appointments"
                          : "Edit Appointment"
                      }
                    >
                      <ActionBtn
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(record);
                        }}
                        style={{
                          color: isFinished ? theme.text.light : theme.primary,
                        }}
                        disabled={isFinished}
                      />
                    </Tooltip>
                  )}
                  {role !== "RECEPTIONIST" && (
                    <Tooltip title="Open Chat">
                      <ActionBtn
                        type="text"
                        icon={<MessageOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openChat(record);
                        }}
                        style={{ color: theme.accent }}
                      />
                    </Tooltip>
                  )}
                </Space>
              );
            },
          },
        ].filter((col) => !col.hidden),
      [patients, role, theme, openEdit, openChat, propSearchText],
    );

    return (
      <>
        <PageWrapper>
          {/* ── Table Card ── */}
          <CardWrapper>
            <Table
              dataSource={filteredData}
              columns={columns}
              rowKey="id"
              loading={loading}
              scroll={{ x: "max-content" }}
              pagination={tablePagination}
              onChange={pagedActions.handleTableChange}
              expandedRowKeys={expandedRowKeys}
              onExpand={(expanded, record) => {
                if (expanded) setExpandedRowKeys([record.id]);
                else setExpandedRowKeys([]);
              }}
              expandable={{
                expandedRowRender: (record) => (
                  <div
                    style={{
                      padding: "8px 16px",
                      background: theme.background.main + "44",
                      borderRadius: "6px",
                      margin: "2px 8px",
                      border: `1px solid ${theme.border}44`,
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: theme.primary,
                        fontSize: "10px",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "2px",
                      }}
                    >
                      Clinical Reason / Purpose:
                    </Text>
                    <Text
                      style={{
                        fontSize: "13px",
                        fontStyle: "italic",
                        color: theme.text.secondary,
                      }}
                    >
                      "{record.reason || "No specific reason provided."}"
                    </Text>
                  </div>
                ),
                rowExpandable: (record) => !!record.reason,
                showExpandColumn: false, // We use our custom "View" column eye icon
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span style={{ color: theme.text.light }}>
                        No appointments matching your criteria
                      </span>
                    }
                  />
                ),
              }}
            />
          </CardWrapper>
        </PageWrapper>

        {/* ── Create / Edit Modal ── */}
        <Modal
          title={editingId ? "Update Appointment" : "Schedule New Appointment"}
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            form.resetFields();
          }}
          destroyOnHidden
          footer={null}
          centered
          width="min(600px, 92vw)"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ STATUS: "scheduled" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Patient Select */}
              <Form.Item
                name="patient_id"
                label="Select Patient"
                rules={[{ required: true, message: "Please select a patient" }]}
              >
                <Select
                  showSearch
                  placeholder="Search patient..."
                  loading={dropdownLoading}
                  optionFilterProp="label"
                  optionLabelProp="label"
                  disabled={!!editingId || role === "PATIENT"}
                >
                  {uniquePatients.map((p) => {
                    const fullName =
                      p.full_name ||
                      p.name ||
                      `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
                      p.NAME ||
                      p.patient_name ||
                      `ID: ${p.id}`;
                    return (
                      <Option key={p.id} value={p.id} label={fullName}>
                        {fullName}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>

              {/* Provider Select (Nurse/Admin can select. HIDDEN for Providers themselves) */}
              {role !== "DOCTOR" && role !== "PROVIDER" && (
                <Form.Item
                  name="provider_id"
                  label="Select Doctor"
                  rules={[
                    { required: true, message: "Please select a doctor" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Search doctor..."
                    loading={dropdownLoading}
                    optionFilterProp="label"
                    optionLabelProp="label"
                  >
                    {uniqueStaff.map((s) => (
                      <Option key={s.id} value={s.id} label={s.name}>
                        {s.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </div>

            <Form.Item
              name="appointment_date"
              label="Date"
              rules={[{ required: true, message: "Date is required" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                name="start_time"
                label="Start Time"
                rules={[{ required: true, message: "Required" }]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  use12Hours
                  format="h:mm a"
                />
              </Form.Item>

              <Form.Item
                name="end_time"
                label="End Time"
                rules={[{ required: true, message: "Required" }]}
              >
                <TimePicker
                  style={{ width: "100%" }}
                  use12Hours
                  format="h:mm a"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="reason"
              label="Reason for Appointment"
              rules={[{ required: true, message: "Please provide a reason" }]}
            >
              <Input.TextArea
                placeholder="e.g. Regular checkup, Fever, Consultation"
                rows={3}
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            {/* Status Dropdown - Only visible when editing. Disabled if already completed or cancelled */}
            {editingId && (
              <Form.Item name="STATUS" label="Status">
                <Select
                  disabled={
                    editingId &&
                    ["completed", "cancelled"].includes(statusValue)
                  }
                >
                  {statusValue === "scheduled" && (
                    <>
                      <Option value="scheduled">Scheduled</Option>
                      <Option value="accepted">Accepted</Option>
                      <Option value="cancelled">Cancelled</Option>
                    </>
                  )}
                  {statusValue === "accepted" && (
                    <>
                      <Option value="accepted">Accepted</Option>
                      <Option
                        value="completed"
                        disabled={isFutureDate}
                        title={
                          isFutureDate
                            ? "Cannot complete future appointments"
                            : ""
                        }
                      >
                        Completed{" "}
                        {isFutureDate && "(Disabled for future dates)"}
                      </Option>
                      <Option value="cancelled">Cancelled</Option>
                    </>
                  )}
                  {(statusValue === "completed" ||
                    statusValue === "cancelled") && (
                    <Option value={statusValue}>
                      {statusValue.charAt(0).toUpperCase() +
                        statusValue.slice(1)}
                    </Option>
                  )}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              style={{ marginBottom: 0, marginTop: 24, textAlign: "right" }}
            >
              <Space>
                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingId ? "Update" : "Schedule"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* ── Chat Side Drawer ── */}
        <Drawer
          title={
            <div
              style={{
                color: theme.secondary,
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Chat & Notes — {activeChatPatient}
            </div>
          }
          placement="right"
          onClose={() => {
            setChatDrawerOpen(false);
            setActiveChatId(null);
          }}
          open={chatDrawerOpen}
          styles={{
            body: { padding: "20px", backgroundColor: theme.background.main },
            wrapper: { width: 700 },
          }}
        >
          {activeChatId && <ChatPanel appointmentId={activeChatId} />}
        </Drawer>
      </>
    );
  },
);

AppointmentList.displayName = "AppointmentList";

export default React.memo(AppointmentList);
