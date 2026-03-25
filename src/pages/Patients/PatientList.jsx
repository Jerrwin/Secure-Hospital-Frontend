import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Space,
  Switch,
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
import useAuth from "../../modules/auth/hooks/useAuth";
import AppButton from "../../components/common/Button/AppButton";
import { useTheme } from "../../context/ThemeContext";
import usePatients from "../../modules/patients/hooks/usePatients";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import usePrescription from "../../modules/prescription/hooks/usePrescription";
import useBilling from "../../modules/billing/hooks/useBilling";
import dayjs from "dayjs";
import styled from "styled-components";
import { usePrefetchPagination } from "../../hooks/usePrefetchPagination";
import { 
  fetchPagedRequest, 
  setPage, 
  setSearch, 
  setStatus 
} from "../../modules/patients/patientSlice";
import PatientTimeline from "./components/PatientTimeline";

const { Text } = Typography;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${(props) => props.theme.background.main};
  min-height: 100vh;
  padding-bottom: 40px;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    gap: 20px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderCard = styled.div`
  background: ${(props) => props.theme.background.card};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadow};
  overflow: hidden;

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
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

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    padding: 16px 22px;
    flex-wrap: nowrap;
    border-bottom: 1px solid ${(props) => props.theme.border};
  }
`;

const MobileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 12px 16px;

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    display: none; // Hidden on desktop
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
  background: ${(props) => props.theme.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
`;

const PageTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${(props) => props.theme.text.primary};
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
    font-size: 17px;
  }
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: 18px;
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
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
    background: ${(props) => props.theme.background.main};
    color: ${(props) => props.theme.text.secondary};
    font-weight: 600;
    font-size: 13px;
    border-bottom: 1px solid ${(props) => props.theme.border};
  }
  .ant-table-tbody > tr > td {
    padding: 12px 16px;
    background: ${(props) => props.theme.background.card};
    color: ${(props) => props.theme.text.primary};
  }
  .ant-table-row:hover > td {
    background-color: ${(props) => props.theme.primaryLight} !important;
  }
  .ant-table-tbody > tr.ant-table-placeholder {
    background: ${(props) => props.theme.background.card} !important;
  }
`;

// StyledFormCard removed as form is now in a Drawer

const paginationActions = { fetchPagedRequest, setPage, setSearch, setStatus };

const PatientList = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    patients: rawPatients,
    loading: patientsLoading,
    error,
    addPatient,
    updatePatient,
    removePatient,
    clearError,
  } = usePatients();

  const {
    pagination: tablePagination,
    actions: pagedActions,
    searchQuery,
  } = usePrefetchPagination({
    selector: (state) => state.patients,
    actions: paginationActions,
    fixedPageSize: 5,
  });

  const {
    list: apptList,
    fetchPaged: fetchAppts, // We have fetchPaged on appointments now
    loading: apptLoading,
  } = useAppointments();
  const {
    list: rxList,
    fetchPrescriptions: fetchRxs,
    loading: rxLoading,
  } = usePrescription();
  const {
    invoices: billingList,
    fetchInvoices: fetchBillings,
    loading: billingLoading,
  } = useBilling();

  const loading = patientsLoading;

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatientForTimeline, setSelectedPatientForTimeline] =
    useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      if (error === "OFFLINE_QUEUED") {
        setIsFormVisible(false);
        setEditingPatient(null);
        form.resetFields();
      } else {
        message.error(error);
      }
      clearError();
      setIsSubmitting(false);
    }
  }, [error, clearError, form]);

  useEffect(() => {
    if (isSubmitting && !loading && !error) {
      message.success(
        editingPatient
          ? "Patient updated successfully"
          : "Patient registered successfully",
      );
      setIsSubmitting(false);
      setIsFormVisible(false);
      setEditingPatient(null);
      form.resetFields();
      pagedActions.fetchPaged(1); // Refresh first page
    }
  }, [isSubmitting, loading, error, editingPatient, pagedActions, form]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    const checkValidity = () => {
      const values = form.getFieldsValue();
      const {
        first_name,
        email,
        phone_number,
        dob,
        gender,
        blood_group,
        medical_history,
        address,
        password,
      } = values;

      const requiredFilled =
        first_name &&
        email &&
        phone_number &&
        phone_number.length === 10 &&
        dob &&
        gender &&
        blood_group &&
        medical_history &&
        address;

      // Password Complexity: At least 8 chars, 1 Uppercase, 1 Special
      const passRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
      const isPassValid =
        editingPatient || (password && passRegex.test(password));

      setIsSubmitDisabled(!(requiredFilled && isPassValid));
    };

    checkValidity();
  }, [formValues, editingPatient, form]);

  useEffect(() => {
    pagedActions.fetchPaged(1);
  }, [pagedActions]);

  useEffect(() => {
    const timer = setTimeout(() => pagedActions.setSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, pagedActions]);

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
      status: editingPatient ? values.status : "active", // Default to active for new
    };

    setIsSubmitting(true);
    if (editingPatient) {
      updatePatient(editingPatient.id, payload);
    } else {
      addPatient(payload);
    }
  };

  const handleToggleStatus = (checked, record) => {
    const payload = {
      ...record,
      status: checked ? "active" : "inactive",
    };
    updatePatient(record.id, payload);
    message.success(`Patient ${checked ? "activated" : "deactivated"}`);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "None", color: theme.border };
    if (pass.length < 6)
      return { score: 1, label: "Weak", color: theme.status.error };
    if (pass.length < 8)
      return { score: 2, label: "Average", color: theme.status.warning };
    return { score: 3, label: "Strong", color: theme.status.success };
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = String(text).split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          style={{
            backgroundColor: theme.status.warning + "88",
            padding: "2px 0",
          }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const displayData = useMemo(() => {
    const data = (rawPatients || []).map((p) => ({
      ...p,
      display_name:
        `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
        p.name ||
        "Unknown Patient",
      display_uhid:
        p.uhid ||
        (p.id ? `PT-ID-${p.id.toString().padStart(4, "0")}` : "PT-ID-NEW"),
    }));

    return data;
  }, [rawPatients]);

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => {
        const fullName = record.display_name;
        const patientId = record.display_uhid;
        return (
          <Tooltip title={`UHID: ${patientId}`} color={theme.secondary}>
            <Text
              strong
              style={{
                color: theme.primary,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {highlightText(fullName, searchQuery)}
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
            <Tag color={record.gender === "male" ? theme.primary : "magenta"}>
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
        <Tooltip title={`Email: ${record.email}`} color={theme.primary}>
          <Text
            strong
            style={{
              fontSize: "13px",
              display: "block",
              cursor: "pointer",
              color: theme.text.primary,
            }}
          >
            {highlightText(record.phone_number, searchQuery)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Switch
          checked={record.status === "active"}
          onChange={(checked) => handleToggleStatus(checked, record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          size="small"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Profile">
            <ActionButton
              type="text"
              icon={<EditOutlined style={{ color: theme.primary }} />}
              onClick={() => showForm(record)}
            />
          </Tooltip>
          <Tooltip title="Medical History">
            <ActionButton
              type="text"
              icon={<HistoryOutlined style={{ color: theme.accent }} />}
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
        <HeaderCard>
          <HeaderRow>
            <HeaderLeft>
              <TitleIcon>
                <UserOutlined style={{ fontSize: 16, color: theme.primary }} />
              </TitleIcon>
              <PageTitle>Patient Management</PageTitle>
            </HeaderLeft>

            {/* Desktop Only controls */}
            <Space size="middle" className="desktop-only">
              <SearchWrapper>
                <SearchInput
                  placeholder="Search patients..."
                  prefix={
                    <SearchOutlined style={{ color: theme.text.light }} />
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                />
              </SearchWrapper>

              <AppButton
                variant="header"
                icon={<PlusOutlined />}
                onClick={() => showForm()}
              >
                Add Patient
              </AppButton>
            </Space>

            <style>{`
            .desktop-only { display: none !important; }
            @media (min-width: ${theme.breakpoints.lg}) {
              .desktop-only { display: flex !important; }
            }
            .inactive-row {
              opacity: 0.6;
              filter: grayscale(50%);
            }
          `}</style>
          </HeaderRow>

          {/* Mobile View: Row 2 (Search + Add) */}
          <MobileRow>
            <div style={{ flex: 1, minWidth: 0, maxWidth: "230px" }}>
              <SearchInput
                placeholder="Search..."
                prefix={<SearchOutlined style={{ color: theme.text.light }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </div>

            <AppButton
              variant="header"
              icon={<PlusOutlined />}
              onClick={() => showForm()}
              style={{ padding: "8px 16px", borderRadius: "8px" }}
            >
              Add
            </AppButton>
          </MobileRow>
        </HeaderCard>
      </PageHeader>

      <div
        style={{
          background: theme.background.card,
          padding: "clamp(12px, 3vw, 24px)",
          borderRadius: "12px",
          boxShadow: theme.shadow,
          minHeight: "auto",
        }}
      >
        <StyledTable
          columns={columns}
          dataSource={displayData}
          rowKey="id"
          loading={loading && (rawPatients || []).length === 0}
          pagination={tablePagination}
          onChange={pagedActions.handleTableChange}
          rowClassName={(record) =>
            record.status === "inactive" ? "inactive-row" : ""
          }
          scroll={{ x: 800 }}
        />
      </div>

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <TitleIcon
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: theme.primaryLight,
              }}
            >
              <UserOutlined
                style={{ fontSize: "16px", color: theme.primary }}
              />
            </TitleIcon>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: theme.text.primary,
              }}
            >
              {editingPatient
                ? "Modify Patient Profile"
                : "New Patient Registration"}
            </span>
          </div>
        }
        placement="right"
        onClose={handleCancel}
        open={isFormVisible}
        size={window.innerWidth > 768 ? 600 : "100%"}
        styles={{
          body: { padding: "24px", background: theme.background.card },
          header: {
            borderBottom: `1px solid ${theme.border}`,
            padding: "16px 24px",
            background: theme.background.card,
          },
        }}
        extra={
          <Button type="text" onClick={handleCancel} icon={<CloseOutlined />} />
        }
        closable={false}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Space
            className="orientation-fix"
            direction="vertical"
            style={{ width: "100%" }}
            size={16}
          >
            <Row gutter={16}>
              <Col xs={12}>
                <Form.Item
                  name="first_name"
                  label="First Name"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input
                    size="large"
                    placeholder="Gregory"
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12}>
                <Form.Item name="last_name" label="Last Name">
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
                              formValues?.password?.length > 0
                                ? getPasswordStrength(formValues.password)
                                    .score >= i
                                  ? getPasswordStrength(formValues.password)
                                      .color
                                  : "#e5e7eb"
                                : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          color: formValues?.password
                            ? getPasswordStrength(formValues.password).color
                            : "#94a3b8",
                        }}
                      >
                        {formValues?.password
                          ? `Strength: ${
                              getPasswordStrength(formValues.password).label
                            }`
                          : "Enter password"}
                      </span>
                      <span
                        style={{ fontSize: "11px", color: theme.text.light }}
                      >
                        Min 8 chars, 1 Uppercase, 1 Special
                      </span>
                    </div>
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
              {/* Status hidden during registration, defaults to active */}
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
                marginTop: "24px",
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
                disabled={isSubmitDisabled}
                style={{
                  borderRadius: "6px",
                  minWidth: "150px",
                  background: isSubmitDisabled ? theme.border : theme.primary,
                  border: "none",
                  opacity: isSubmitDisabled ? 0.7 : 1,
                  cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                }}
              >
                {editingPatient ? "Save Changes" : "Register Patient"}
              </Button>
            </div>
          </Space>
        </Form>
      </Drawer>

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <TitleIcon
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: theme.primaryLight,
              }}
            >
              <HistoryOutlined
                style={{ fontSize: "16px", color: theme.primary }}
              />
            </TitleIcon>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: theme.text.primary,
              }}
            >
              Patient Medical History
            </span>
          </div>
        }
        placement="right"
        onClose={closeTimeline}
        open={isTimelineVisible}
        extra={
          <Button
            type="text"
            onClick={closeTimeline}
            icon={<CloseOutlined />}
          />
        }
        closable={false}
        styles={{
          body: { background: theme.background.main, padding: "20px" },
          header: {
            borderBottom: `1px solid ${theme.border}`,
            padding: "16px 24px",
            background: theme.background.card,
          },
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
