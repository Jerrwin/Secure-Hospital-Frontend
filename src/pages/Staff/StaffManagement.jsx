import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tag,
  Progress,
  message,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  TeamOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import useUsers from "../../modules/users/hooks/useUsers";
import styled from "styled-components";
import AppButton from "../../components/common/Button/AppButton";
import { useTheme } from "../../context/ThemeContext";
import StaffModal from "./components/StaffModal";

// ─── Breakpoints (Dynamic Helpers) ───────────────────────────────────────────
const bp = {
  xs: (props) => props.theme.breakpoints.xs,
  sm: (props) => props.theme.breakpoints.sm,
  md: (props) => props.theme.breakpoints.md,
  lg: (props) => props.theme.breakpoints.lg,
  xl: (props) => props.theme.breakpoints.xl,
};

const HeaderCard = styled.div`
  background: ${(props) => props.theme.background.card};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadow};
  margin-bottom: 24px;
  overflow: hidden;
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
  }
`;

const MobileRow = styled.div`
  display: flex;
  padding: 0 16px 16px 16px;
  width: 100%;

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    display: none;
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
  background: ${props => props.theme.primaryLight};
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
  display: none;
  @media (min-width: ${bp.lg}) {
    display: flex;
    align-items: center;
    max-width: 320px;
    flex: 1;
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: ${props => props.theme.background.header} !important;
    color: ${props => props.theme.primary} !important;
    font-weight: 600;
  }

  .inactive-row {
    background-color: ${props => props.theme.background.main};
    opacity: 0.5;
    transition: all 0.3s ease;

    td {
      color: ${props => props.theme.text.light} !important;
    }

    .ant-tag {
      opacity: 0.5;
    }
  }

  @media (max-width: 768px) {
    .ant-table {
      font-size: 13px;
    }
  }
`;

const StaffManagement = () => {
  const { theme } = useTheme();
  const [form] = Form.useForm();
  const {
    staffList,
    loading,
    error,
    fetchStaff,
    addStaff,
    updateStaff,
    removeStaff,
  } = useUsers();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = String(text).split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} style={{ backgroundColor: theme.status.warning + '88', padding: 0 }}>
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  // Filter data based on search and roles
  const displayData = useMemo(() => {
    // 1. First, exclude 'Admin' role from the general staff list view
    const nonAdminStaff = (staffList || []).filter((item) => {
      const id =
        item.role_id ||
        item.roleId ||
        item.role?.id ||
        (typeof item.role === "number" ? item.role : null);
      const name =
        item.role_name ||
        item.role?.name ||
        (typeof item.role === "string" ? item.role : null);

      // role_id 1 is usually Admin, also check by name
      const isAdmin = id === 1 || (name && name.toLowerCase() === "admin");
      return !isAdmin;
    });

    // 2. Then apply search filter
    if (!debouncedSearch) return nonAdminStaff;
    const lowerQuery = debouncedSearch.toLowerCase();
    return (staffList || []).filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerQuery) ||
        item.email?.toLowerCase().includes(lowerQuery) ||
        item.phone_number?.toLowerCase().includes(lowerQuery),
    );
  }, [staffList, debouncedSearch]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (error) {
      message.error(
        typeof error === "string"
          ? error
          : "An error occurred fetching staff data",
      );
      console.error(error);
    }
  }, [error]);

  const showModal = (record = null) => {
    setEditingStaff(record);
    if (record) {
      // If the record only has 'name' but form expects first/last, split it
      const formData = {
        ...record,
        is_active:
          record.is_active === true ||
          record.is_active === 1 ||
          record.is_active === "1",
      };
      if (!formData.first_name && formData.name) {
        const parts = formData.name.split(" ");
        formData.first_name = parts[0];
        formData.last_name = parts.slice(1).join(" ");
      }
      if (!formData.role_id && formData.role?.id) {
        formData.role_id = formData.role.id;
      } else if (
        !formData.role_id &&
        formData.role &&
        typeof formData.role === "number"
      ) {
        formData.role_id = formData.role;
      }
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStaff(null);
    form.resetFields();
  };

  const handleFinish = (values) => {
    // Combine first_name and last_name into 'name' for the backend
    const payload = {
      ...values,
      name: `${values.first_name || ""} ${values.last_name || ""}`.trim(),
      is_active: values.is_active ? 1 : 0,
    };

    if (editingStaff) {
      updateStaff(editingStaff.id, payload);
    } else {
      addStaff(payload); // Let the backend generate the ID
    }
    setIsModalVisible(false);
  };

  const handleToggleActive = (checked, record) => {
    // 1. Find the actual role ID from any potential field in the record
    const roleId =
      record.role_id ||
      record.roleId ||
      record.role?.id ||
      (typeof record.role === "number" ? record.role : null);

    // 2. Prepare payload with both possible activity markers (binary and string)
    const cleanRecord = {
      user_id: record.user_id, // Include user_id to trigger status sync across tables
      name: record.name,
      email: record.email,
      role_id: roleId,
      gender: record.gender,
      phone_number: record.phone_number,
      address: record.address,
      is_active: checked ? 1 : 0,
      status: checked ? "active" : "inactive", // Support both column formats
    };

    updateStaff(record.id, cleanRecord);
    message.success(`User ${checked ? "activated" : "deactivated"}`);
  };

  const handleDelete = (id) => {
    removeStaff(id);
    message.success("Staff member deleted");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        const fullName =
          `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
          record.name;
        return highlightText(fullName, debouncedSearch);
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => highlightText(text, debouncedSearch),
    },
    {
      title: "Role",
      dataIndex: "role_id",
      key: "role",
      render: (roleId, record) => {
        // 1. Try to find a numeric ID from any potential field
        const id =
          roleId ||
          record.role_id ||
          record.roleId ||
          (typeof record.role === "number" ? record.role : null);

        // 2. Try to find a string name directly (e.g. from record.role.name or record.role_name)
        const name =
          record.role_name ||
          record.role?.name ||
          (typeof record.role === "string" ? record.role : null);

        // 3. Mapping for known IDs
        const roleMap = {
          1: { name: "Admin", color: theme.status.error },
          2: { name: "Doctor", color: theme.primary },
          3: { name: "Nurse", color: theme.accent },
          4: { name: "Pharmacist", color: "purple" },
          5: { name: "Receptionist", color: theme.status.warning },
        };

        if (id && roleMap[id]) {
          return <Tag color={roleMap[id].color}>{roleMap[id].name}</Tag>;
        }

        // 4. Fallback to name if ID mapping failed
        if (name) {
          const s = name.toUpperCase();
          const colorMap = {
            ADMIN: theme.status.error,
            NURSE: theme.status.success,
            PHARMACIST: "purple", // Use "purple" as it's a themed standard in many systems
            PROVIDER: theme.primary,
          };
          return <Tag color={colorMap[s] || "default"}>{name}</Tag>;
        }

        return <Tag color="default">{id ? `Role ${id}` : "No Role"}</Tag>;
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        // Prioritize 'status' column if it exists, as it's the more reliable indicator for this backend
        const isActive = record.status
          ? record.status === "active"
          : record.is_active === true ||
            record.is_active === 1 ||
            record.is_active === "1";
        return (
          <Switch
            checked={isActive}
            onChange={(checked) => handleToggleActive(checked, record)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: theme.primary }} />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: theme.background.main, minHeight: "100vh" }}>
      <HeaderCard>
        <HeaderRow>
          <HeaderLeft>
            <TitleIcon>
              <TeamOutlined style={{ fontSize: 20, color: theme.primary }} />
            </TitleIcon>
            <PageTitle>Staff Management</PageTitle>
          </HeaderLeft>

          <SearchWrapper>
            <Input
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Search staff..."
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              allowClear
              size="large"
              style={{ borderRadius: theme.borderRadius.md }}
            />
          </SearchWrapper>

          <AppButton
            variant="header"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Staff
          </AppButton>
        </HeaderRow>

        <MobileRow>
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            placeholder="Search staff..."
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            allowClear
            size="large"
            style={{ borderRadius: "8px", width: "100%" }}
          />
        </MobileRow>
      </HeaderCard>

      <div
        style={{
          background: theme.background.card,
          padding: "clamp(12px, 3vw, 24px)",
          borderRadius: "12px",
          boxShadow: theme.shadow,
          minHeight: "auto",
          overflow: "hidden",
        }}
      >
        <StyledTable
          columns={columns}
          dataSource={displayData}
          rowKey="id"
          loading={loading && (staffList || []).length === 0}
          pagination={{
            pageSize: 5,
            placement: "bottomCenter",
            showSizeChanger: false,
          }}
          rowClassName={(record) => {
            const isActive = record.status
              ? record.status === "active"
              : record.is_active === 1 ||
                record.is_active === "1" ||
                record.is_active === true;
            return isActive ? "" : "inactive-row";
          }}
          scroll={{ x: 800 }}
        />

        <StaffModal
          visible={isModalVisible}
          onCancel={handleCancel}
          onFinish={handleFinish}
          editingStaff={editingStaff}
          form={form}
        />
      </div>
    </div>
  );
};

export default StaffManagement;
