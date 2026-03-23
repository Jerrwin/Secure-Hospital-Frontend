import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
  Popconfirm,
  Typography,
  DatePicker,
  Tooltip,
  Row,
  Col,
  Drawer,
} from "antd";
import {
  SearchOutlined,
  HistoryOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useRef } from "react";
import useAuth from "../../modules/auth/hooks/useAuth";
import usePatients from "../../modules/patients/hooks/usePatients";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import usePrescription from "../../modules/prescription/hooks/usePrescription";
import useBilling from "../../modules/billing/hooks/useBilling";
import dayjs from "dayjs";
import styled from "styled-components";
import PatientTimeline from "./components/PatientTimeline";

const { Text } = Typography;

// ─── Breakpoints ──────────────────────────────────────────────────────────────
const bp = {
  xs: "480px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
};

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: ${bp.md}) {
    gap: 20px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;

  @media (min-width: ${bp.md}) {
    border-radius: 14px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;

  @media (min-width: ${bp.lg}) {
    padding: 16px 22px;
    flex-wrap: nowrap;
    border-bottom: 1px solid #f1f5f9;
  }
`;

const MobileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 16px;
  border-bottom: 1px solid #f1f5f9;

  @media (min-width: ${bp.lg}) {
    display: none; // Hidden on desktop, moved into HeaderRow
  }
`;

const AddButtonMobile = styled(Button)`
  display: flex !important;
  align-items: center;
  justify-content: center;
  background: #2563eb !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  padding: 0 12px !important;
  height: 36px !important;
  font-size: 13px !important;
  color: #ffffff !important;

  @media (min-width: ${bp.lg}) {
    display: none !important;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const TitleIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @media (min-width: ${bp.md}) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
`;

const PageTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (min-width: ${bp.sm}) {
    font-size: 17px;
  }
  @media (min-width: ${bp.md}) {
    font-size: 18px;
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 0;
  @media (min-width: ${bp.md}) {
    max-width: 320px;
  }
`;

const SearchInput = styled(Input)`
  border-radius: 8px;
  width: 100%;
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-weight: 600;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 13px;
    border-bottom: 1px solid #eef2f6;
  }
  .ant-table-tbody > tr > td {
    padding: 12px 16px;
  }
  .ant-table-row:hover > td {
    background-color: #f1f5f9 !important;
  }
`;

const StyledFormCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.08);
  margin-top: 24px;
  overflow: hidden;

  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
  }

  .card-title {
    font-family: "Sora", sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e3a8a;
    margin: 0;
  }

  .card-content {
    padding: 24px 20px;
  }
`;

const PatientList = () => {
  const { user } = useAuth();
  const {
    patients,
    loading,
    error,
    fetchPatients,
    addPatient,
    updatePatient,
    removePatient,
    clearError,
  } = usePatients();

  const { list: apptList, fetchAll: fetchAppts, loading: apptLoading } = useAppointments();
  const { list: rxList, fetchPrescriptions: fetchRxs, loading: rxLoading } = usePrescription();
  const { invoices: billingList, fetchInvoices: fetchBillings, loading: billingLoading } = useBilling();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatientForTimeline, setSelectedPatientForTimeline] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [form] = Form.useForm();
  const passwordValue = Form.useWatch("password", form);
  const formRef = useRef(null);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const showForm = (patient = null) => {
    setEditingPatient(patient);
    if (patient) {
      form.setFieldsValue({
        ...patient,
        dob: patient.dob ? dayjs(patient.dob) : null,
      });
    } else {
      form.resetFields();
    }
    setIsFormVisible(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingPatient(null);
    form.resetFields();
  };

  const showTimeline = (patient) => {
    setSelectedPatientForTimeline(patient);
    setIsTimelineVisible(true);
    // Fetch real data for this patient
    fetchAppts({ patient_id: patient.id });
    fetchRxs(); // Currently fetches all, we'll filter in the component
    fetchBillings({ patient_id: patient.id });
  };

  const closeTimeline = () => {
    setIsTimelineVisible(false);
    setSelectedPatientForTimeline(null);
  };

  const onFinish = (values) => {
    const payload = {
      ...values,
      name: `${values.first_name} ${values.last_name || ""}`.trim(),
      dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      status: values.status || "Regular",
    };

    if (editingPatient) {
      updatePatient(editingPatient.id, payload);
      message.success("Patient record updated");
    } else {
      addPatient(payload);
      message.success("New patient registered successfully");
    }
    setIsFormVisible(false);
    setEditingPatient(null);
    form.resetFields();
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "None", color: "#e5e7eb" };
    if (pass.length < 6) return { score: 1, label: "Weak", color: "#ef4444" };
    if (pass.length < 10)
      return { score: 2, label: "Average", color: "#f59e0b" };
    return { score: 3, label: "Strong", color: "#10b981" };
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = String(text).split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} style={{ backgroundColor: "#fef08a", padding: "2px 0" }}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const displayData = useMemo(() => {
    const data = (patients || []).map((p) => ({
      ...p,
      display_name:
        `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
        p.name ||
        "Unknown Patient",
      display_uhid: p.uhid || `PT-ID-${p.id?.toString().padStart(4, "0")}`,
    }));

    if (!debouncedSearch) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter((p) => {
      const name = p.display_name;
      const patientId = p.display_uhid;
      return (
        name.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone_number?.toLowerCase().includes(q) ||
        patientId.toLowerCase().includes(q)
      );
    });
  }, [patients, debouncedSearch]);

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => {
        const fullName = record.display_name;
        const patientId = record.display_uhid;
        return (
          <Tooltip title={`UHID: ${patientId}`} color="#1e3a8a">
            <Text
              strong
              style={{ color: "#2563eb", fontSize: "14px", cursor: "pointer" }}
            >
              {highlightText(fullName, debouncedSearch)}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Age / Gender",
      key: "demographics",
      render: (_, record) => {
        const age = record.dob
          ? dayjs().diff(dayjs(record.dob), "year")
          : record.age;
        return (
          <Space>
            <Tag color="default">{age} Yrs</Tag>
            <Tag color={record.gender === "male" ? "blue" : "magenta"}>
              {record.gender?.charAt(0).toUpperCase() + record.gender?.slice(1)}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <Tooltip title={`Email: ${record.email}`} color="#2563eb">
          <Text
            strong
            style={{ fontSize: "13px", display: "block", cursor: "pointer" }}
          >
            {highlightText(record.phone_number, debouncedSearch)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = record.status || record.Status || "Regular";
        const isEmergency = status.toLowerCase() === "emergency";
        return (
          <Tag
            color={isEmergency ? "red" : "green"}
            style={{ borderRadius: "12px", padding: "0 10px" }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Profile">
            <ActionButton
              type="text"
              icon={<EditOutlined style={{ color: "#2563eb" }} />}
              onClick={() => showForm(record)}
            />
          </Tooltip>
          <Tooltip title="Medical History">
            <ActionButton
              type="text"
              icon={<HistoryOutlined style={{ color: "#0891b2" }} />}
              onClick={() => showTimeline(record)}
            />
          </Tooltip>
          {(user?.role === "Admin" || user?.role === "Provider") && (
            <Popconfirm
              title="Delete patient record?"
              onConfirm={() => removePatient(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Remove Record">
                <ActionButton type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageWrapper>
      {/* ── Page Header (Unified Controls) ── */}
      <PageHeader>
        <HeaderRow>
          <HeaderLeft>
            <TitleIcon>
              <UserOutlined style={{ fontSize: 16, color: "#1677ff" }} />
            </TitleIcon>
            <PageTitle>Patient Management</PageTitle>
          </HeaderLeft>

          {/* New Patient (Mobile) */}
          <AddButtonMobile
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showForm(null)}
          >
            Add Patient
          </AddButtonMobile>

          {/* New Patient (Desktop) */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showForm()}
            style={{
              display: window.innerWidth >= 992 ? "flex" : "none",
              borderRadius: "8px",
              height: "38px",
              fontWeight: 600,
              background: "#2563eb",
            }}
          >
            Add Patient
          </Button>

          {/* Desktop Only controls (Optional extra space) */}
          <style>{`
            @media (min-width: ${bp.lg}) {
              .desktop-search-wrapper { display: flex !important; max-width: 320px; flex: 1; }
              .mobile-search-row { display: none !important; }
            }
            @media (max-width: ${bp.lg}) {
              .desktop-search-wrapper { display: none !important; }
              .mobile-search-row { display: flex !important; }
            }
          `}</style>

          {/* Desktop Search (Aligned right, next to button on large screens) */}
          <div className="desktop-search-wrapper" style={{ marginLeft: "12px" }}>
            <SearchInput
              placeholder="Search patients..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
        </HeaderRow>

        {/* Mobile View: Row 2 (Search Only) */}
        <MobileRow className="mobile-search-row">
          <SearchWrapper>
            <SearchInput
              placeholder="Search patients..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </SearchWrapper>
        </MobileRow>
      </PageHeader>

      <div
        style={{
          background: "#fff",
          padding: "clamp(12px, 3vw, 24px)",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
          minHeight: "auto",
          overflow: "hidden",
        }}
      >
        <StyledTable
          columns={columns}
          dataSource={displayData}
          rowKey="id"
          loading={loading && (patients || []).length === 0}
          pagination={{ pageSize: 8, placement: "bottomCenter" }}
          scroll={{ x: 800 }}
        />
      </div>

      {isFormVisible && (
        <StyledFormCard ref={formRef}>
          <div className="card-header">
            <h3 className="card-title">
              {editingPatient
                ? "Modify Patient Profile"
                : "New Patient Registration"}
            </h3>
            <CloseOutlined
              onClick={handleCancel}
              style={{
                cursor: "pointer",
                color: "#64748b",
                fontSize: "1.1rem",
              }}
            />
          </div>

          <div className="card-content">
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Space
                className="orientation-fix"
                orientation="vertical"
                style={{ width: "100%" }}
                size={16}
              >
                <Row gutter={16}>
                  <Col xs={12}>
                    <Form.Item
                      name="first_name"
                      label="First Name"
                      rules={[
                        { required: true, message: "Required" },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        size="large"
                        placeholder="Gregory"
                        style={{ borderRadius: "6px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item
                      name="last_name"
                      label="Last Name"
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        size="large"
                        placeholder="House"
                        style={{ borderRadius: "6px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Required" },
                        { type: "email", message: "Invalid" },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        size="large"
                        placeholder="Email"
                        style={{ borderRadius: "6px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12}>
                    <Form.Item
                      name="phone_number"
                      label="Phone"
                      rules={[
                        { required: true, message: "Required" },
                        {
                          pattern: /^\d{10}$/,
                          message: "10 digits",
                        },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input
                        size="large"
                        placeholder="Phone"
                        style={{ borderRadius: "6px" }}
                        maxLength={10}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Space>

              {!editingPatient && (
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Password is required" }]}
                  extra={
                    <div style={{ marginTop: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          height: "4px",
                          marginBottom: "4px",
                        }}
                      >
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              borderRadius: "2px",
                              background:
                                passwordValue?.length > 0
                                  ? getPasswordStrength(passwordValue).score >= i
                                    ? getPasswordStrength(passwordValue).color
                                    : "#e5e7eb"
                                  : "#e5e7eb",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: passwordValue
                            ? getPasswordStrength(passwordValue).color
                            : "#94a3b8",
                        }}
                      >
                        {passwordValue
                          ? `Strength: ${
                              getPasswordStrength(passwordValue).label
                            }`
                          : "Enter password"}
                      </span>
                    </div>
                  }
                >
                  <Input.Password
                    size="large"
                    placeholder="Set patient portal password"
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>
              )}

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    name="gender"
                    label="Gender"
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 16 }}
                  >
                    <Select
                      size="large"
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    name="dob"
                    label="Date of Birth"
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 16 }}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: "100%", borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    name="blood_group"
                    label="Blood Group"
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 16 }}
                  >
                    <Select
                      size="large"
                      options={[
                        "A+",
                        "A-",
                        "B+",
                        "B-",
                        "AB+",
                        "AB-",
                        "O+",
                        "O-",
                      ].map((g) => ({ value: g, label: g }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 16 }}
                  >
                    <Select
                      size="large"
                      options={[
                        { value: "Regular", label: "Regular" },
                        { value: "Emergency", label: "Emergency" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="medical_history"
                label="Medical History / Clinical Notes"
                rules={[
                  {
                    required: true,
                    message: "Please enter brief medical notes",
                  },
                ]}
              >
                <Input.TextArea
                  size="large"
                  rows={2}
                  placeholder="E.g. No known allergies, chronic asthma..."
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item
                name="address"
                label="Permanent Address"
                rules={[{ required: true, message: "Address is required" }]}
                style={{ marginBottom: "8px" }}
              >
                <Input.TextArea
                  size="large"
                  rows={2}
                  placeholder="Full street address..."
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "32px",
                  gap: "12px",
                }}
              >
                <Button
                  size="large"
                  onClick={handleCancel}
                  style={{ borderRadius: "6px", minWidth: "100px" }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  style={{
                    borderRadius: "6px",
                    minWidth: "150px",
                    background: "#2563eb",
                  }}
                >
                  {editingPatient ? "Save Changes" : "Register Patient"}
                </Button>
              </div>
            </Form>
          </div>
        </StyledFormCard>
      )}

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <TitleIcon style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f0f9ff" }}>
              <HistoryOutlined style={{ fontSize: "16px", color: "#0369a1" }} />
            </TitleIcon>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a5f" }}>
              Patient Medical History
            </span>
          </div>
        }
        placement="right"
        onClose={closeTimeline}
        open={isTimelineVisible}
        extra={
          <Button type="text" onClick={closeTimeline} icon={<CloseOutlined />} />
        }
        closable={false}
        styles={{
          body: { background: "#f8fafc", padding: "20px" },
          header: { borderBottom: "1px solid #eef2f6", padding: "16px 24px" },
          wrapper: { width: window.innerWidth > 576 ? 500 : "100%" },
        }}
      >
        <PatientTimeline
          patient={selectedPatientForTimeline}
          appointments={apptList}
          prescriptions={rxList}
          invoices={billingList}
          loading={apptLoading || rxLoading || billingLoading}
        />
      </Drawer>
    </PageWrapper>
  );
};

export default PatientList;
