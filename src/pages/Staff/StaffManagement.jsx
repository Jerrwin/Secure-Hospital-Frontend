import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Switch,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Typography,
  App,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  TeamOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import useUsers from "../../modules/users/hooks/useUsers";
import { usePrefetchPagination } from "../../hooks/usePrefetchPagination";
import {
  fetchPagedRequest,
  setPage,
  setSearch,
  setStatus,
} from "../../modules/users/userSlice";
import styled from "styled-components";
import AppButton from "../../components/common/Button/AppButton";
import { useTheme } from "../../context/ThemeContext";
import StaffModal from "./components/StaffModal";
import ProfileDetailsCard from "../../components/common/ProfileDetailsCard";

const { Text } = Typography;

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
  display: none;
  @media (min-width: ${bp.lg}) {
    display: flex;
    align-items: center;
    max-width: 320px;
    flex: 1;
  }
`;

const CardWrapper = styled.div`
  background: ${(props) => props.theme.background.card};
  padding: clamp(12px, 3vw, 24px);
  border-radius: 12px;
  box-shadow: ${(props) => props.theme.shadow};
  min-height: auto;
  overflow: hidden;

  .ant-pagination-item-active {
    border-color: transparent !important;
    background-color: transparent !important;
  }
  .ant-pagination-item-active:hover {
    border-color: transparent !important;
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: ${(props) => props.theme.background.header} !important;
    color: ${(props) => props.theme.primary} !important;
    font-weight: 600;
  }

  .inactive-row {
    background-color: ${(props) => props.theme.background.main};
    opacity: 0.5;
    transition: all 0.3s ease;

    td {
      color: ${(props) => props.theme.text.light} !important;
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

const paginationActions = { fetchPagedRequest, setPage, setSearch, setStatus };

const StaffManagement = () => {
  const { theme } = useTheme();
  const [form] = Form.useForm();

  // 1. Core user actions for writing data
  const { addStaff, updateStaff, removeStaff, submitting, error, clearUserError: clearError } =
    useUsers();
  const { message } = App.useApp();

  // 2. Prefetch-ahead Pagination & Search Logic
  const {
    list: staffList,
    pagination,
    loading,
    searchQuery,
    actions: pagedActions,
  } = usePrefetchPagination({
    selector: (state) => state.users,
    actions: paginationActions,
    fixedPageSize: 5,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery || "");

  // Debounce search term to Redux
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        pagedActions.setSearch(searchTerm);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, searchQuery, pagedActions]);

  // Sync local search term if Redux changes externally
  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = String(text).split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              style={{
                backgroundColor: theme.status.warning + "88",
                padding: 0,
              }}
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  // Filter out Admin from the display list (UI preference)
  const displayData = useMemo(() => {
    return (staffList || []).filter((item) => {
      const id = item.role_id || item.roleId || item.role?.id;
      const name = item.role_name || item.role?.name;
      const isAdmin = id === 1 || (name && name.toLowerCase() === "admin");
      return !isAdmin;
    });
  }, [staffList]);

  useEffect(() => {
    if (error) {
      message.error(
        typeof error === "string"
          ? error
          : "An error occurred fetching staff data",
      );
      console.error(error);
      clearError();
      setIsSubmittingLocal(false);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (isSubmittingLocal && !submitting && !error) {
      message.success(
        editingStaff
          ? "Staff updated successfully"
          : "Staff member added successfully",
      );
      setIsSubmittingLocal(false);
      setIsModalVisible(false);
      setEditingStaff(null);
      form.resetFields();
      pagedActions.fetchPaged(1);
    }
  }, [isSubmittingLocal, submitting, error, editingStaff, pagedActions, form]);

  const showModal = (record = null) => {
    setEditingStaff(record);
    if (record) {
      const formData = {
        ...record,
        is_active:
          record.status === "active" ||
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
    // Resolve is_active status (preserve if missing from values)
    const currentIsActive = editingStaff
      ? editingStaff.status === "active" ||
        editingStaff.is_active === 1 ||
        editingStaff.is_active === true
      : true; // Default to active for new staff

    const isActive =
      values.is_active !== undefined ? values.is_active : currentIsActive;

    const payload = {
      ...values,
      name: `${values.first_name || ""} ${values.last_name || ""}`.trim(),
      is_active: isActive ? 1 : 0,
      status: isActive ? "active" : "inactive",
    };

    setIsSubmittingLocal(true);
    if (editingStaff) {
      updateStaff(editingStaff.id, payload);
    } else {
      addStaff(payload);
    }
  };

  const handleToggleActive = (checked, record) => {
    const roleId = record.role_id || record.roleId || record.role?.id;
    const cleanRecord = {
      ...record,
      role_id: roleId,
      is_active: checked ? 1 : 0,
      status: checked ? "active" : "inactive",
    };
    updateStaff(record.id, cleanRecord);
    message.success(`User ${checked ? "activated" : "deactivated"}`);
  };

  const handleDelete = (id) => {
    removeStaff(id);
    message.success("Staff member deleted");
  };

  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (_, record) => {
          const fullName =
            `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
            record.name;
          return highlightText(fullName, searchQuery);
        },
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (text) => highlightText(text, searchQuery),
      },
      {
        title: "Role",
        dataIndex: "role_id",
        key: "role",
        render: (roleId, record) => {
          const id =
            roleId || record.role_id || record.roleId || record.role?.id;
          const name =
            record.role_name ||
            record.role?.name ||
            (typeof record.role === "string" ? record.role : null);

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

          if (name) {
            const s = name.toUpperCase();
            const colorMap = {
              ADMIN: theme.status.error,
              NURSE: theme.status.success,
              PHARMACIST: "purple",
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
          const isActive = record.status
            ? record.status === "active"
            : record.is_active === 1 || record.is_active === true;
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
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined style={{ color: theme.primary }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStaff(record);
                }}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: theme.primary }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  showModal(record);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure you want to delete this staff member?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [theme, searchQuery, handleToggleActive, showModal, handleDelete],
  );

  return (
    <div>
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

      <CardWrapper>
        <StyledTable
          columns={columns}
          dataSource={displayData}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={pagedActions.handleTableChange}
          onRow={(record) => ({
            onClick: () => setSelectedStaff(record),
            style: { cursor: "pointer" },
          })}
          rowClassName={(record) => {
            const isActive = record.status
              ? record.status === "active"
              : record.is_active === 1 || record.is_active === true;
            return isActive ? "" : "inactive-row";
          }}
          scroll={{ x: 800 }}
        />
      </CardWrapper>

      <StaffModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onFinish={handleFinish}
        editingStaff={editingStaff}
        form={form}
        submitting={submitting}
      />

      {selectedStaff && (
        <div style={{ padding: "0 clamp(16px, 5vw, 40px) 80px clamp(16px, 5vw, 40px)", animation: "fadeIn 0.5s" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', marginTop: '32px' }}>
            <Text strong style={{ color: theme.primary, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Selected Staff Profile
            </Text>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(90deg, ${theme.border}, transparent)` }} />
          </div>
          <ProfileDetailsCard
            data={selectedStaff}
            title="Staff Details"
            onClose={() => setSelectedStaff(null)}
          />
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
