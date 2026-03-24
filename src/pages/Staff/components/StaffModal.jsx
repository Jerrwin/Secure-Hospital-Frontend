import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Progress,
} from "antd";
import { useTheme } from "../../../context/ThemeContext";

const StaffModal = ({
  visible,
  onCancel,
  onFinish,
  editingStaff,
  form,
}) => {
  const { theme } = useTheme();
  
  // Watch password field for strength meter - isolated here to prevent parent re-renders
  const password = Form.useWatch("password", form);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: theme.border };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (pwd.length < 6)
      return { score: 25, label: "Very Weak", color: theme.status.error };
    if (score <= 1) return { score: 33, label: "Weak", color: theme.status.error };
    if (score <= 3) return { score: 66, label: "Average", color: theme.status.warning };
    return { score: 100, label: "Strong", color: theme.status.success };
  };

  const strength = getPasswordStrength(password);

  return (
    <Modal
      title={
        <span
          style={{ color: theme.primary, fontSize: "1.2rem", fontWeight: 600 }}
        >
          {editingStaff ? "Edit Staff Details" : "Add New Staff Member"}
        </span>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={window.innerWidth > 600 ? 600 : "92%"}
      centered
      style={{ maxWidth: "600px", margin: "16px auto" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_active: true }}
        style={{ marginTop: "24px" }}
      >
        <Space style={{ display: "flex", width: "100%" }}>
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: "First name is required" }]}
            style={{ flex: 1 }}
          >
            <Input
              size="large"
              placeholder="E.g. Gregory"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>
          <Form.Item name="last_name" label="Last Name" style={{ flex: 1 }}>
            <Input
              size="large"
              placeholder="E.g. House"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>
        </Space>

        <Space style={{ display: "flex", width: "100%" }}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              size="large"
              placeholder="doctor@hospital.com"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Gender is required" }]}
            style={{ flex: 1, paddingLeft: "24px" }}
          >
            <Select
              size="large"
              placeholder="Select gender"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />
          </Form.Item>
        </Space>

        {!editingStaff && (
          <div style={{ marginBottom: "24px" }}>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Password is required for new users",
                },
              ]}
              style={{ marginBottom: 8 }}
            >
              <Input.Password
                size="large"
                placeholder="Secure password"
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>
            {password && (
              <div style={{ marginTop: "-4px" }}>
                <Progress
                  percent={strength.score}
                  showInfo={false}
                  strokeColor={strength.color}
                  size="small"
                  style={{ marginBottom: 4 }}
                />
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
                      color: strength.color,
                      fontWeight: 600,
                    }}
                  >
                    Strength: {strength.label}
                  </span>
                  <span style={{ fontSize: "11px", color: theme.text.light }}>
                    8+ chars with mix of letters, numbers & symbols
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <Space style={{ display: "flex", width: "100%" }}>
          <Form.Item
            name="phone_number"
            label="Phone Number"
            rules={[
              { required: true, message: "Phone number is required" },
              {
                pattern: /^\d{10}$/,
                message: "Please enter exactly 10 digits",
              },
            ]}
            style={{ flex: 1 }}
          >
            <Input
              size="large"
              placeholder="9070503210"
              style={{ borderRadius: "6px" }}
              maxLength={10}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Address is required" }]}
            style={{ flex: 1, paddingLeft: "24px" }}
          >
            <Input
              size="large"
              placeholder="E.g. Chennai"
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>
        </Space>

        {!editingStaff && (
          <Space style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="role_id"
              label="Assigned Role"
              rules={[{ required: true, message: "Select a role" }]}
              style={{ flex: 1 }}
            >
              <Select
                size="large"
                placeholder="Select role"
                options={[
                  { value: 2, label: "Provider" },
                  { value: 3, label: "Nurse" },
                  { value: 4, label: "Pharmacist" },
                  { value: 5, label: "Receptionist" },
                ]}
              />
            </Form.Item>
          </Space>
        )}

        <Form.Item
          style={{ marginBottom: 0, marginTop: "24px", textAlign: "right" }}
        >
          <Button
            size="large"
            onClick={onCancel}
            style={{ marginRight: 12, borderRadius: "6px" }}
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            style={{
              background: theme.primary,
              borderRadius: "6px",
              fontWeight: 500,
              border: 'none'
            }}
          >
            {editingStaff ? "Save Changes" : "Create Account"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default React.memo(StaffModal);
