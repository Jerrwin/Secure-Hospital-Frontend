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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  UserOutlined,
  DeleteOutlined,
  SearchOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import useAuth from "../../modules/auth/hooks/useAuth";
import usePatients from "../../modules/patients/hooks/usePatients";
import dayjs from "dayjs";
import styled from "styled-components";

const { Text } = Typography;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
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

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
  }
  .ant-table-row:hover {
    background-color: #f1f5f9 !important;
  }

  @media (max-width: 768px) {
    .ant-table {
      font-size: 13px;
    }
    .ant-tag {
      margin-right: 0;
      margin-bottom: 4px;
    }
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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [form] = Form.useForm();
  const passwordValue = Form.useWatch("password", form);

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

  const showModal = (patient = null) => {
    setEditingPatient(patient);
    if (patient) {
      form.setFieldsValue({
        ...patient,
        dob: patient.dob ? dayjs(patient.dob) : null,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPatient(null);
    form.resetFields();
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
    setIsModalVisible(false);
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
    return (patients || []).filter((p) => {
      const name =
        p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim();
      const patientId =
        p.uhid || (p.id ? `PAT-${String(p.id).padStart(3, "0")}` : "NEW-PAT");
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
        const fullName =
          record.name ||
          `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
          "No Name";
        const patientId =
          record.uhid ||
          (record.id ? `PAT-${String(record.id).padStart(3, "0")}` : "NEW-PAT");
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
          <ActionButton
            type="text"
            icon={<EditOutlined style={{ color: "#2563eb" }} />}
            onClick={() => showModal(record)}
          >
            Edit
          </ActionButton>
          <ActionButton
            type="text"
            icon={<HistoryOutlined style={{ color: "#0891b2" }} />}
            onClick={() => message.info("Medical History Coming Soon")}
          >
            History
          </ActionButton>
          {(user?.role === "Admin" || user?.role === "Provider") && (
            <Popconfirm
              title="Delete patient record?"
              onConfirm={() => removePatient(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <ActionButton type="text" danger icon={<DeleteOutlined />}>
                Delete
              </ActionButton>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "clamp(12px, 3vw, 24px)" }}>
      <PageHeader>
        <h1 style={{ fontWeight: 700, color: "#102d6b" }}>
          <UserOutlined style={{ color: "#2563eb" }} /> Patient Management
        </h1>
        <Space size="middle" style={{ flexWrap: "wrap" }}>
          <Input
            placeholder="Search patients..."
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            size="large"
            style={{
              width: "100%",
              maxWidth: "300px",
              borderRadius: "8px",
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            style={{
              height: "48px",
              padding: "0 24px",
              borderRadius: "8px",
              background: "#2563eb",
              fontWeight: 600,
              minWidth: "140px",
            }}
          >
            Add Patient
          </Button>
        </Space>
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

      <Modal
        title={
          <span
            style={{ color: "#1e3a8a", fontSize: "1.2rem", fontWeight: 600 }}
          >
            {editingPatient
              ? "Modify Patient Profile"
              : "New Patient Registration"}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: "24px" }}
        >
          <Space orientation="vertical" style={{ width: "100%" }} size={16}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: "First name is required" }]}
                style={{ flex: "1 1 200px", marginBottom: 0 }}
              >
                <Input
                  size="large"
                  placeholder="E.g. Gregory"
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>
              <Form.Item
                name="last_name"
                label="Last Name"
                style={{ flex: "1 1 200px", marginBottom: 0 }}
              >
                <Input
                  size="large"
                  placeholder="E.g. House"
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Enter a valid email" },
                ]}
                style={{ flex: "1 1 200px", marginBottom: 0 }}
              >
                <Input
                  size="large"
                  placeholder="patient@example.com"
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                rules={[
                  { required: true, message: "Phone number is required" },
                  {
                    pattern: /^\d{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                ]}
                style={{ flex: "1 1 200px", marginBottom: 0 }}
              >
                <Input
                  size="large"
                  placeholder="10-digit number"
                  style={{ borderRadius: "6px" }}
                  maxLength={10}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </div>
          </Space>

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
                    ? `Strength: ${getPasswordStrength(passwordValue).label}`
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

          <Space style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Select gender" }]}
              style={{ flex: 1 }}
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
            <Form.Item
              name="dob"
              label="Date of Birth"
              rules={[{ required: true, message: "DOB is required" }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                size="large"
                style={{ width: "100%", borderRadius: "6px" }}
              />
            </Form.Item>
          </Space>

          <Space style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="blood_group"
              label="Blood Group"
              rules={[{ required: true, message: "Select blood group" }]}
              style={{ flex: 1 }}
            >
              <Select
                size="large"
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (g) => ({ value: g, label: g }),
                )}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status Category"
              rules={[{ required: true, message: "Select status" }]}
              style={{ flex: 1 }}
            >
              <Select
                size="large"
                options={[
                  { value: "Regular", label: "Regular" },
                  { value: "Emergency", label: "Emergency" },
                ]}
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="medical_history"
            label="Medical History / Clinical Notes"
            rules={[
              { required: true, message: "Please enter brief medical notes" },
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
      </Modal>
    </div>
  );
};

export default PatientList;
