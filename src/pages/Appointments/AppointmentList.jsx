import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import {
  Table, Tag, Button, Modal, Form, Select,
  DatePicker, TimePicker, Space, Popconfirm, message, Empty, Input
} from "antd";
import {
  EditOutlined, CalendarOutlined,
  ReloadOutlined, SearchOutlined,
  FilterOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import useAuth from "../../modules/auth/hooks/useAuth";
import useAppointments from "../../modules/appointments/hooks/useAppointments";

const { Option } = Select;

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const PageTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardWrapper = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(30, 58, 95, 0.08);
  padding: 24px;
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
    scheduled: { color: "blue",   label: "Scheduled" },
    completed: { color: "green",  label: "Completed" },
    cancelled: { color: "red",    label: "Cancelled"  },
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
        )
      )}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AppointmentList = () => {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const userId = user?.user_id || user?.id; // Try both user_id and id

  const {
    list, patients, staff, loading, submitting, dropdownLoading, fetched, submitError,
    fetchAll, fetchDropdowns, create, update, cancel, clearError,
  } = useAppointments();

  // Debugging
  useEffect(() => {
    console.log("Appointments Component State:", { 
      role, 
      userId, 
      fullUser: user, // Log full user object to see available fields
      patientsCount: patients.length, 
      staffCount: staff.length, 
      dropdownLoading 
    });
  }, [role, userId, user, patients, staff, dropdownLoading]);

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
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
    fetchDropdowns(); 
  }, [fetched, fetchAll, fetchDropdowns]);

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

  // ── Modal Handlers ──────────────────────────────────────────────────────
  const openCreate = () => {
    form.resetFields();
    if (role === "DOCTOR" || role === "PROVIDER") {
      form.setFieldsValue({ provider_id: String(userId) });
    }
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      patient_id:       String(record.patient_id),
      provider_id:      String(record.provider_id),
      appointment_date: dayjs(record.appointment_date),
      start_time:       dayjs(record.start_time, "HH:mm:ss"),
      end_time:         dayjs(record.end_time,   "HH:mm:ss"),
      STATUS:           record.STATUS?.toLowerCase(),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      patient_id:       values.patient_id,
      provider_id:      values.provider_id || (role === "DOCTOR" || role === "PROVIDER" ? String(userId) : null),
      appointment_date: values.appointment_date.format("YYYY-MM-DD"),
      start_time:       values.start_time.format("HH:mm:ss"),
      end_time:         values.end_time.format("HH:mm:ss"),
      STATUS:           values.STATUS,
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
          </Space>
        );
      },
    },
  ].filter(col => !col.hidden);

  return (
    <DashboardLayout user={user} currentPath="/appointments">
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
              position: ["bottomCenter"]
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
        footer={null}
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
                {patients.map(p => {
                  const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.patient_name || `ID: ${p.id}`;
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
            <DatePicker style={{ width: "100%" }} />
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
    </DashboardLayout>
import React from 'react';
import { Result } from 'antd';

const AppointmentList = () => {
  return (
    <div style={{ padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '70vh' }}>
      <Result
        status="info"
        title="Appointments Module"
        subTitle="This page is under construction. Please use the dashboard to see upcoming appointments."
      />
    </div>
  );
};

export default AppointmentList;
