import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import {
  Table, Tag, Button, Modal, Form, Select,
  DatePicker, TimePicker, Space, message, Empty, Input, Drawer
} from "antd";
import {
  EditOutlined, CalendarOutlined,
  ReloadOutlined, SearchOutlined,
  FilterOutlined, MessageOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

import useAuth from "../../modules/auth/hooks/useAuth";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import ChatPanel from "../../pages/Chat/ChatPanel";

const { Option } = Select;

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    color: #1e3a8a;
    font-size: clamp(1.5rem, 4vw, 1.75rem);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 0 1 auto;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h1``;


const CardWrapper = styled.div`
  background: #ffffff;
  padding: clamp(16px, 4vw, 32px);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.05);
  overflow: hidden;
`;

const SearchInput = styled(Input)`
  width: 300px;
  border-radius: 8px;
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const Highlight = styled.span`
  background-color: #ffec3d;
  font-weight: bold;
`;
const StatusSelect = styled(Select)`
  width: 160px;
  .ant-select-selector {
    border-radius: 8px !important;
  }
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
  const map = {
    scheduled: { color: "blue", label: "Scheduled" },
    completed: { color: "green", label: "Completed" },
    cancelled: { color: "red", label: "Cancelled" },
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
    <Space orientation="vertical" size={0}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Highlight key={i}>{part}</Highlight>
        ) : (
          part
        )
      )}
    </Space>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AppointmentList = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const userId = user?.user_id || user?.id; // Try both user_id and id

  const {
    list, patients, staff, loading, submitting, dropdownLoading, fetched, submitError,
    fetchAll, fetchDropdowns, create, update, clearError,
  } = useAppointments();

  // Debugging
  useEffect(() => {
    console.log("Appointments Component State:", {
      role,
      userId,
      fullUser: user, // Log full user object to see available fields
      patientsCount: patients.length, 
      patientsData: patients.slice(0, 3), // Log first few patients to see structure
      staffCount: staff.length, 
      dropdownLoading 
    });
  }, [role, userId, user, patients, staff, dropdownLoading]);

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Chat Drawer State
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatPatient, setActiveChatPatient] = useState("");

  const openChat = (record) => {
    setActiveChatId(record.id);
    const name = record.patient_name || record.patientName || (record.patient ? `${record.patient.first_name || ''} ${record.patient.last_name || ''}`.trim() : `Patient #${record.patient_id || '?'}`);
    setActiveChatPatient(name);
    setChatDrawerOpen(true);
  };
  
  // Search state & Debounce
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fetched) fetchAll();
  }, [fetched, fetchAll]);

  // ── Show API errors ─────────────────────────────────────────────────────
  useEffect(() => {
    if (submitError) {
      message.error(submitError);
      clearError();
    }
  }, [submitError, clearError]);

  // ── FILTERING & SEARCH LOGIC (Client-side per requirements) ────────────
  const filteredData = useMemo(() => {
    let result = [...list];

    // 1. Role-based visibility
    if (role === "DOCTOR" || role === "PROVIDER") {
      result = result.filter(a => String(a.provider_id) === String(userId));
    } else if (role === "PATIENT") {
      result = result.filter(a => String(a.patient_id) === String(userId));
    }

    // 2. Status filter
    if (statusFilter !== "all") {
      result = result.filter(a => a.STATUS?.toLowerCase() === statusFilter.toLowerCase());
    }

    // 3. Search filtering (Doctor Name or Patient Name)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(a =>
        (a.patient_name || "").toLowerCase().includes(q) ||
        (a.provider_name || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [list, role, userId, debouncedSearch, statusFilter]);

  // ── Fallback Staff for Nurse Role ──────────────────────────────────────
  const uniqueStaff = useMemo(() => {
    const map = new Map();
    // 1. Add real staff if we have them
    staff.forEach(s => {
      if (s.role_name?.toLowerCase() === 'provider' || s.role_name?.toLowerCase() === 'doctor' || s.role?.toLowerCase() === 'doctor' || s.role?.toLowerCase() === 'provider') {
        map.set(String(s.id), { id: s.id, name: s.name || s.full_name || `Doctor #${s.id}` });
      }
    });

    // 2. Extract from appointments if staff list was forbidden (403)
    list.forEach(a => {
      const pId = a.provider_id;
      if (pId && !map.has(String(pId))) {
        map.set(String(pId), { id: pId, name: a.provider_name || a.providerName || `Doctor #${pId}` });
      }
    });

    return Array.from(map.values());
  }, [staff, list]);

  // ── Fallback Patients (extracted from appointments list when API is 403) ──
const uniquePatients = useMemo(() => {
  // If we got real patients from the API, use them
  if (patients.length > 0) return patients;

  // Otherwise extract from the appointments list already loaded
  const map = new Map();
  list.forEach(a => {
    const pid = a.patient_id;
    if (pid && !map.has(String(pid))) {
      const fullName =
        a.patient_name ||
        a.patientName ||
        (a.patient
          ? `${a.patient.first_name || ""} ${a.patient.last_name || ""}`.trim()
          : `Patient #${pid}`);
      map.set(String(pid), {
        id: pid,
        first_name: fullName.split(" ")[0] || fullName,
        last_name: fullName.split(" ").slice(1).join(" ") || "",
      });
    }
  });
  return Array.from(map.values());
}, [patients, list]);
  // ── Modal Handlers ──────────────────────────────────────────────────────
  const openCreate = () => {
    // Only fetch dropdown data if not already present
    if (patients.length === 0 || staff.length === 0) {
      fetchDropdowns();
    }
    form.resetFields();
    if (role === "DOCTOR" || role === "PROVIDER") {
      form.setFieldsValue({ provider_id: String(userId) });
    }
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    // Only fetch dropdown data if not already present
    if (patients.length === 0 || staff.length === 0) {
      fetchDropdowns();
    }
    setEditingId(record.id);
    form.setFieldsValue({
      patient_id: String(record.patient_id),
      provider_id: String(record.provider_id),
      appointment_date: dayjs(record.appointment_date),
      start_time: dayjs(record.start_time, "HH:mm:ss"),
      end_time: dayjs(record.end_time, "HH:mm:ss"),
      STATUS: record.STATUS?.toLowerCase(),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      patient_id: values.patient_id,
      provider_id: values.provider_id || (role === "DOCTOR" || role === "PROVIDER" ? String(userId) : null),
      appointment_date: values.appointment_date.format("YYYY-MM-DD"),
      start_time: values.start_time.format("HH:mm:ss"),
      end_time: values.end_time.format("HH:mm:ss"),
      STATUS: values.STATUS,
    };

    // ── Conflict Detection ───────────────────────────────────────────────
    const hasConflict = list.some(a => {
      if (String(a.id) === String(editingId)) return false;
      if (String(a.provider_id) !== String(payload.provider_id)) return false;
      if (a.appointment_date !== payload.appointment_date) return false;
      if (a.STATUS?.toLowerCase() === 'cancelled') return false;

      const aStart = dayjs(`${a.appointment_date} ${a.start_time}`);
      const aEnd = dayjs(`${a.appointment_date} ${a.end_time}`);
      const pStart = dayjs(`${payload.appointment_date} ${payload.start_time}`);
      const pEnd = dayjs(`${payload.appointment_date} ${payload.end_time}`);

      return (pStart.isBefore(aEnd) && pEnd.isAfter(aStart));
    });

    if (hasConflict) {
      return message.error("Conflict! Doctor is already booked at this time.");
    }

    if (editingId) {
      update(editingId, payload);
    } else {
      create(payload);
    }

    setModalOpen(false);
    form.resetFields();
    setEditingId(null);
  };

  // ─── Table Columns ────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Date",
      dataIndex: "appointment_date",
      key: "date",
      render: (v) => dayjs(v).format("DD MMM YYYY"),
    },
    {
      title: "Time",
      key: "time",
      render: (_, r) =>
        `${dayjs(r.start_time, "HH:mm:ss").format("hh:mm A")} – ${dayjs(r.end_time, "HH:mm:ss").format("hh:mm A")}`,
    },
    {
      title: "Patient",
      dataIndex: "patient_name",
      key: "patient",
      render: (text, record) => {
        const name = text || record.patientName || (record.patient ? `${record.patient.first_name || ''} ${record.patient.last_name || ''}`.trim() : null) || `Patient #${record.patient_id || '?'}`;
        return highlightText(name, debouncedSearch);
      },
      hidden: role === "PATIENT",
    },
    {
      title: "Provider",
      dataIndex: "provider_name",
      key: "provider",
      render: (text, record) => {
        // Robust name detection for Nurse/Patient views
        const name = text || record.providerName || (record.provider ? `${record.provider.first_name || record.provider.name} ${record.provider.last_name || ''}`.trim() : "—");
        return highlightText(name, debouncedSearch);
      },
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
      render: (_, record) => {
        const status = record.STATUS?.toLowerCase();
        const isFinished = status === "cancelled" || status === "completed";
        return (
          <Space size="middle">
            <ActionBtn
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
              style={{ color: isFinished ? "#d9d9d9" : "#1890ff" }}
              disabled={isFinished}
            >
              Edit
            </ActionBtn>
            <ActionBtn
              type="text"
              icon={<MessageOutlined />}
              onClick={() => openChat(record)}
              style={{ color: "#722ed1" }}
            >
              Chat
            </ActionBtn>
          </Space>
        );
      },
    },
  ].filter(col => !col.hidden);

  return (
    <>
      <PageWrapper>
        {/* ── Header ── */}
        <PageHeader>
          <PageTitle>
            <CalendarOutlined style={{ color: "#1677ff" }} />
            Appointment Management
          </PageTitle>

          <Space wrap size="middle">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined style={{ color: "#1677ff" }} />
              <span style={{ fontWeight: 500, color: '#4a5568' }}>Filter Status:</span>
              <StatusSelect
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Choose status"
              >
                <Option value="all">All Statuses</Option>
                <Option value="scheduled">Scheduled</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </StatusSelect>
            </div>

            <SearchInput
              placeholder="Search by Doctor or Patient name..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchAll()} disabled={loading}>
              Refresh
            </Button>
            {role !== "PATIENT" && (
              <Button type="primary" onClick={openCreate}>
                New Appointment
              </Button>
            )}
          </Space>
        </PageHeader>

        {/* ── Table Card ── */}
        <CardWrapper>
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="id"
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              placement: ["bottomCenter"]
            }}
            locale={{ emptyText: <Empty description="No appointments matching your criteria" /> }}
          />
        </CardWrapper>
      </PageWrapper>

      {/* ── Create / Edit Modal ── */}
      <Modal
        title={editingId ? "Update Appointment" : "Schedule New Appointment"}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        destroyOnHidden
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ STATUS: 'scheduled' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              >
                {uniquePatients.map(p => {
                  const fullName = (
                    `${p.first_name || ''} ${p.last_name || ''}`.trim() || 
                    p.name || 
                    p.NAME || 
                    p.patient_name || 
                    `ID: ${p.id}`
                  );
                  return (
                    <Option key={String(p.id)} value={String(p.id)} label={fullName}>
                      {fullName}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* Provider Select (Nurse/Admin can select. HIDDEN for Providers themselves) */}
            {(role !== "DOCTOR" && role !== "PROVIDER") && (
              <Form.Item
                name="provider_id"
                label="Select Doctor"
                rules={[{ required: true, message: "Please select a doctor" }]}
              >
                <Select
                  showSearch
                  placeholder="Search doctor..."
                  loading={dropdownLoading}
                  optionFilterProp="label"
                  optionLabelProp="label"
                >
                  {uniqueStaff.map(s => (
                    <Option key={String(s.id)} value={String(s.id)} label={s.name}>
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
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="start_time"
              label="Start Time"
              rules={[{ required: true, message: "Required" }]}
            >
              <TimePicker style={{ width: "100%" }} use12Hours format="h:mm a" />
            </Form.Item>

            <Form.Item
              name="end_time"
              label="End Time"
              rules={[{ required: true, message: "Required" }]}
            >
              <TimePicker style={{ width: "100%" }} use12Hours format="h:mm a" />
            </Form.Item>
          </div>

          {/* Status Dropdown - Disabled if already completed or cancelled */}
          <Form.Item
            name="STATUS"
            label="Status"
          >
            <Select
              disabled={editingId && ['completed', 'cancelled'].includes(form.getFieldValue('STATUS'))}
            >
              <Option value="scheduled">Scheduled</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24, textAlign: "right" }}>
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
          <div style={{ color: "#1e3a5f", fontSize: "16px", fontWeight: "600" }}>
            Chat & Notes — {activeChatPatient}
          </div>
        }
        placement="right"
        onClose={() => {
          setChatDrawerOpen(false);
          setActiveChatId(null);
        }}
        open={chatDrawerOpen}
        width={700}
        destroyOnClose
        styles={{ body: { padding: "20px", backgroundColor: "#f9fafb" } }}
      >
        {activeChatId && <ChatPanel appointmentId={activeChatId} />}
      </Drawer>
    </>
  );
};

export default AppointmentList;
