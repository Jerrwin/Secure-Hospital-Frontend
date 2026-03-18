import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, Space, Tag, message, Popconfirm, Typography, Progress } from 'antd';
import { PlusOutlined, EditOutlined, TeamOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import useAuth from '../../modules/auth/hooks/useAuth';
import useUsers from '../../modules/users/hooks/useUsers';
import styled from 'styled-components';

// const { Option } = Select; // Deprecated in AntD v5, use options prop instead

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    color: #1e3a8a;
    font-size: 1.75rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #eff6ff;
    color: #1e3a8a;
    font-weight: 600;
  }

  .inactive-row {
    background-color: #f8fafc;
    opacity: 0.6;
    transition: all 0.3s ease;
    
    td {
      color: #94a3b8 !important;
    }
    
    .ant-tag {
      opacity: 0.5;
    }
  }
`;

const StaffManagement = () => {
  const { user } = useAuth();
  const { staffList, loading, error, fetchStaff, addStaff, updateStaff, removeStaff } = useUsers();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [form] = Form.useForm();
  
  // Watch password field for strength meter
  const password = Form.useWatch('password', form);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (pwd.length < 6) return { score: 25, label: 'Very Weak', color: '#ff4d4f' };
    if (score <= 1) return { score: 33, label: 'Weak', color: '#ff4d4f' };
    if (score <= 3) return { score: 66, label: 'Average', color: '#faad14' };
    return { score: 100, label: 'Strong', color: '#52c41a' };
  };

  const strength = getPasswordStrength(password);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = String(text).split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <mark key={i} style={{ backgroundColor: '#ffea00', padding: 0 }}>{part}</mark> : 
            part
        )}
      </span>
    );
  };

  // Filter data based on search and roles
  const displayData = useMemo(() => {
    // 1. First, exclude 'Admin' role from the general staff list view
    const nonAdminStaff = (staffList || []).filter(item => {
      const id = item.role_id || item.roleId || (item.role?.id) || (typeof item.role === 'number' ? item.role : null);
      const name = item.role_name || item.role?.name || (typeof item.role === 'string' ? item.role : null);
      
      // role_id 1 is usually Admin, also check by name
      const isAdmin = id == 1 || (name && name.toLowerCase() === 'admin');
      return !isAdmin;
    });

    // 2. Then apply search filter
    if (!debouncedSearch) return nonAdminStaff;
    const lowerQuery = debouncedSearch.toLowerCase();
    return nonAdminStaff.filter(item => 
      item.name?.toLowerCase().includes(lowerQuery) ||
      item.email?.toLowerCase().includes(lowerQuery) ||
      item.phone_number?.toLowerCase().includes(lowerQuery)
    );
  }, [staffList, debouncedSearch]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (error) {
      message.error(typeof error === 'string' ? error : "An error occurred fetching staff data");
      console.error(error);
    }
  }, [error]);

  const showModal = (record = null) => {
    setEditingStaff(record);
    if (record) {
      // If the record only has 'name' but form expects first/last, split it
      const formData = { 
        ...record,
        is_active: record.is_active === true || record.is_active === 1 || record.is_active === '1'
      };
      if (!formData.first_name && formData.name) {
        const parts = formData.name.split(' ');
        formData.first_name = parts[0];
        formData.last_name = parts.slice(1).join(' ');
      }
      if (!formData.role_id && formData.role?.id) {
        formData.role_id = formData.role.id;
      } else if (!formData.role_id && formData.role && typeof formData.role === 'number') {
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
      name: `${values.first_name || ''} ${values.last_name || ''}`.trim(),
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
    const roleId = record.role_id || record.roleId || (record.role?.id) || (typeof record.role === 'number' ? record.role : null);

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
      status: checked ? 'active' : 'inactive' // Support both column formats
    };
    
    updateStaff(record.id, cleanRecord);
    message.success(`User ${checked ? 'activated' : 'deactivated'}`);
  };

  const handleDelete = (id) => {
    removeStaff(id);
    message.success('Staff member deleted');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        const fullName = `${record.first_name || ''} ${record.last_name || ''}`.trim() || record.name;
        return highlightText(fullName, debouncedSearch);
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => highlightText(text, debouncedSearch)
    },
    {
      title: 'Role',
      dataIndex: 'role_id',
      key: 'role',
      render: (roleId, record) => {
        // 1. Try to find a numeric ID from any potential field
        const id = roleId || record.role_id || record.roleId || (typeof record.role === 'number' ? record.role : null);
        
        // 2. Try to find a string name directly (e.g. from record.role.name or record.role_name)
        const name = record.role_name || record.role?.name || (typeof record.role === 'string' ? record.role : null);

        // 3. Mapping for known IDs
        const roleMap = {
          1: { name: 'Admin', color: 'red' },
          2: { name: 'Doctor', color: 'blue' },
          3: { name: 'Nurse', color: 'cyan' },
          4: { name: 'Pharmacist', color: 'purple' },
          5: { name: 'Receptionist', color: 'orange' },
        };

        if (id && roleMap[id]) {
          return <Tag color={roleMap[id].color}>{roleMap[id].name}</Tag>;
        }

        // 4. Fallback to name if ID mapping failed
        if (name) {
          const s = name.toUpperCase();
          const colorMap = { ADMIN: 'red', NURSE: 'cyan', PHARMACIST: 'purple', PROVIDER: 'blue' };
          return <Tag color={colorMap[s] || 'default'}>{name}</Tag>;
        }

        return <Tag color="default">{id ? `Role ${id}` : 'No Role'}</Tag>;
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        // Prioritize 'status' column if it exists, as it's the more reliable indicator for this backend
        const isActive = record.status ? record.status === 'active' : (record.is_active === true || record.is_active === 1 || record.is_active === '1');
        return (
          <Switch 
            checked={isActive} 
            onChange={(checked) => handleToggleActive(checked, record)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this staff member?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <DashboardLayout user={user} currentPath="/staff">
      <div style={{ 
        background: '#fff', 
        padding: 'clamp(16px, 4vw, 32px)', 
        borderRadius: '12px', 
        minHeight: '75vh', 
        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.05)' 
      }}>
        <PageHeader>
          <h1 style={{ fontSize: '1.75rem' }}>
            <TeamOutlined style={{ color: '#2563eb' }}/> Staff Management
          </h1>
          <Space size="middle">
            <Input 
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Search by name, email or phone..." 
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              allowClear
              style={{ width: '300px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              size="large"
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()} 
              style={{ background: '#2563eb', height: '40px', borderRadius: '8px', fontWeight: 500 }}
            >
              Add Staff
            </Button>
          </Space>
        </PageHeader>

        <StyledTable 
          columns={columns} 
          dataSource={displayData} 
          rowKey="id" 
          loading={loading && staffList.length === 0}
          pagination={{ pageSize: 5, placement: 'bottomCenter', showSizeChanger: false }}
          rowClassName={(record) => {
            const isActive = record.status ? record.status === 'active' : (record.is_active === 1 || record.is_active === '1' || record.is_active === true);
            return isActive ? '' : 'inactive-row';
          }}
          scroll={{ x: 800 }}
        />

        <Modal
          title={<span style={{ color: '#1e3a8a', fontSize: '1.2rem', fontWeight: 600 }}>{editingStaff ? "Edit Staff Details" : "Add New Staff Member"}</span>}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          destroyOnHidden
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ is_active: true }}
            style={{ marginTop: '24px' }}
          >
            <Space style={{ display: 'flex', width: '100%' }}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'First name is required' }]}
                style={{ flex: 1 }}
              >
                <Input size="large" placeholder="E.g. Gregory" style={{ borderRadius: '6px' }} />
              </Form.Item>
              <Form.Item
                name="last_name"
                label="Last Name"
                style={{ flex: 1 }}
              >
                <Input size="large" placeholder="E.g. House" style={{ borderRadius: '6px' }} />
              </Form.Item>
            </Space>

            <Space style={{ display: 'flex', width: '100%' }}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' }
                ]}
                style={{ flex: 1 }}
              >
                <Input size="large" placeholder="doctor@hospital.com" style={{ borderRadius: '6px' }} />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Gender is required' }]}
                style={{ flex: 1, paddingLeft: '24px' }}
              >
                <Select 
                  size="large" 
                  placeholder="Select gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </Space>

            {!editingStaff && (
              <div style={{ marginBottom: '24px' }}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Password is required for new users' }]}
                  style={{ marginBottom: 8 }}
                >
                  <Input.Password size="large" placeholder="Secure password" style={{ borderRadius: '6px' }} />
                </Form.Item>
                {password && (
                  <div style={{ marginTop: '-4px' }}>
                    <Progress 
                      percent={strength.score} 
                      showInfo={false} 
                      strokeColor={strength.color} 
                      size="small" 
                      style={{ marginBottom: 4 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: strength.color, fontWeight: 600 }}>
                        Strength: {strength.label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Use 8+ chars with mix of letters, numbers & symbols
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Space style={{ display: 'flex', width: '100%' }}>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Phone number is required' },
                  { pattern: /^\d{10}$/, message: 'Please enter exactly 10 digits' }
                ]}
                style={{ flex: 1 }}
              >
                <Input 
                  size="large" 
                  placeholder="9070503210" 
                  style={{ borderRadius: '6px' }} 
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
                rules={[{ required: true, message: 'Address is required' }]}
                style={{ flex: 1, paddingLeft: '24px' }}
              >
                <Input size="large" placeholder="E.g. Chennai" style={{ borderRadius: '6px' }} />
              </Form.Item>
            </Space>

            <Space style={{ display: 'flex', width: '100%' }}>
              <Form.Item
                name="role_id"
                label="Assigned Role"
                rules={[{ required: true, message: 'Select a role' }]}
                style={{ flex: 1 }}
              >
                <Select 
                  size="large" 
                  placeholder="Select role"
                  options={[
                    { value: 2, label: 'Provider' },
                    { value: 3, label: 'Nurse' },
                    { value: 4, label: 'Pharmacist' },
                    { value: 5, label: 'Receptionist' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="is_active"
                label="Account Status"
                valuePropName="checked"
                style={{ flex: 1, paddingLeft: '24px' }}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Suspended" />
              </Form.Item>
            </Space>

            <Form.Item style={{ marginBottom: 0, marginTop: '24px', textAlign: 'right' }}>
              <Button size="large" onClick={handleCancel} style={{ marginRight: 12, borderRadius: '6px' }}>
                Cancel
              </Button>
              <Button size="large" type="primary" htmlType="submit" style={{ background: '#2563eb', borderRadius: '6px', fontWeight: 500 }}>
                {editingStaff ? "Save Changes" : "Create Account"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default StaffManagement;
