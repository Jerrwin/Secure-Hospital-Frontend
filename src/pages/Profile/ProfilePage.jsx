import React, { useEffect, useState, useMemo } from 'react';
import { Card, Avatar, Typography, Tag, Space, Form, Input, Select, Button, Descriptions, Progress, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, SaveOutlined, EditOutlined, CloseOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import useAuth from '../../modules/auth/hooks/useAuth';
import useUsers from '../../modules/users/hooks/useUsers';
import dayjs from 'dayjs';
import axiosClient from '../../services/axiosClient';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: 'None', color: '#e5e7eb' };
  if (pass.length < 6) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (pass.length < 10) return { score: 2, label: 'Average', color: '#f59e0b' };
  return { score: 3, label: 'Strong', color: '#10b981' };
};

const ProfileWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px;
`;

const HeaderSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.05);
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const FormCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .ant-card-head {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 0 24px;
  }
  
  .ant-card-head-title {
    font-weight: 600;
    color: #1e3a8a;
  }
`;

const ProfilePage = () => {
  const { user, userRole } = useAuth();
  const { staffList, fetchStaff, loading: staffLoading } = useUsers();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  // Monitor password for strength indicator
  const passwordValue = Form.useWatch('new_password', form);
  const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);

  // Fetch full list to find this user's deep details if missing from login
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const staffProfile = useMemo(() => 
    (staffList || []).find(s => s.id === (user?.id || 0)) || {},
    [staffList, user?.id]
  );

  const activeProfile = useMemo(() => ({ ...user, ...staffProfile }), [user, staffProfile]);
  
  const fullName = useMemo(() => 
    activeProfile.name || `${activeProfile.first_name || ''} ${activeProfile.last_name || ''}`.trim() || 'No Name',
    [activeProfile]
  );

  const initialValues = useMemo(() => ({
    name: fullName,
    email: activeProfile.email,
    phone_number: activeProfile.phone_number || activeProfile.phone || activeProfile.contact || activeProfile.mobile,
    gender: activeProfile.gender,
    address: activeProfile.address || activeProfile.permanent_address || activeProfile.resident_address,
    dob: activeProfile.dob ? dayjs(activeProfile.dob) : (activeProfile.date_of_birth ? dayjs(activeProfile.date_of_birth) : null),
  }), [activeProfile, fullName]);

  // Update form when deeper profile data is loaded
  useEffect(() => {
    if (staffProfile.id) {
      form.setFieldsValue({
        name: fullName,
        email: staffProfile.email,
        phone_number: staffProfile.phone_number || staffProfile.phone || staffProfile.contact || staffProfile.mobile,
        gender: staffProfile.gender,
        address: staffProfile.address || staffProfile.permanent_address || staffProfile.resident_address,
        dob: staffProfile.dob ? dayjs(staffProfile.dob) : (staffProfile.date_of_birth ? dayjs(staffProfile.date_of_birth) : null),
      });
    }
  }, [staffProfile, form, fullName]);

  if (!user) return <div style={{ padding: '80px', textAlign: 'center' }}><Text type="secondary">Unable to load profile data.</Text></div>;

  const onFinish = async (values) => {
    try {
      // 1. Handle Profile Update (General)
      console.log('Update main profile:', values);
      
      // 2. Handle Password Change if requested
      if (values.new_password) {
        if (!values.current_password) {
          return message.error('Current password is required to set a new password');
        }

        const response = await axiosClient.post('/api/auth/change-password', {
          current_password: values.current_password,
          new_password: values.new_password,
          new_password_confirmation: values.confirm_password
        });

        if (response.data.success) {
          message.success('Password updated successfully');
        }
      }

      message.success('Profile updated successfully');
      setIsEditing(false);
      form.setFieldsValue({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Update failed:', error);
      message.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <ProfileWrapper>
      <HeaderSection>
        <Avatar
          size={120}
          icon={<UserOutlined />}
          style={{
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
          }}
        />
        <div style={{ flex: 1 }}>
          <Title level={2} style={{ margin: 0 }}>{fullName}</Title>
          <Space size="middle" wrap>
            <Tag color="geekblue" style={{ borderRadius: '12px' }}>{userRole || 'USER'}</Tag>
            <Tag color={user.status === 'active' || !user.status ? 'success' : 'error'} style={{ borderRadius: '12px' }}>
              {(user.status || 'Active').toUpperCase()}
            </Tag>
            <Text type="secondary"><IdcardOutlined /> ID: #{user.id}</Text>
          </Space>
        </div>
      </HeaderSection>

      <FormCard title={isEditing ? "Edit Profile" : "Profile Details"}>
        {isEditing ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={onFinish}
            autoComplete="off"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '0 32px' }}>
              <Form.Item label="Full Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
                <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} size="large" />
              </Form.Item>

              <Form.Item label="Email Address" name="email" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
                <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} size="large" />
              </Form.Item>

              <Form.Item label="Phone Number" name="phone_number">
                <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder="E.g., +1 234 567 890" />
              </Form.Item>

              <Form.Item label="Gender" name="gender">
                <Select size="large" placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Permanent Address" name="address" style={{ gridColumn: '1 / -1' }}>
                <TextArea rows={3} placeholder="Provide your full address" />
              </Form.Item>
            </div>

            <Divider orientation="left" style={{ color: '#1e3a8a', fontWeight: 500 }}>
              <SafetyOutlined /> Security & Password
            </Divider>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 32px' }}>
              <Form.Item 
                label="Current Password" 
                name="current_password"
                tooltip="Required to confirm identity if changing passwords"
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder="Settings password" />
              </Form.Item>

              <div>
                <Form.Item 
                  label="New Password" 
                  name="new_password"
                  rules={[
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" />
                </Form.Item>
                {passwordValue && (
                  <div style={{ marginTop: '-16px', marginBottom: '16px' }}>
                    <Progress 
                      percent={strength.score * 33.3} 
                      showInfo={false} 
                      strokeColor={strength.color} 
                      size="small" 
                    />
                    <Text style={{ fontSize: '12px', color: strength.color }}>
                      Strength: {strength.label}
                    </Text>
                  </div>
                )}
              </div>

              <Form.Item 
                label="Confirm New Password" 
                name="confirm_password"
                dependencies={['new_password']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Password mismatch'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <Button
                icon={<CloseOutlined />}
                onClick={() => setIsEditing(false)}
                style={{ borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                style={{ padding: '0 32px', borderRadius: '8px' }}
                loading={staffLoading}
              >
                Save
              </Button>
            </div>
          </Form>
        ) : (
          <div style={{ padding: '8px' }}>
            <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} bordered layout="vertical">
              <Descriptions.Item label="Full Name">
                <Text strong style={{ fontSize: '15px' }}>{fullName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email Address">
                <Text style={{ fontSize: '15px' }}>{activeProfile.email || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <Text style={{ fontSize: '15px' }}>{initialValues.phone_number || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                <Text style={{ fontSize: '15px', textTransform: 'capitalize' }}>{activeProfile.gender || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Permanent Address" span={2}>
                <Text style={{ fontSize: '15px' }}>{activeProfile.address || activeProfile.permanent_address || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Joined from">
                <Tag color="blue">{activeProfile.created_at ? new Date(activeProfile.created_at).toLocaleDateString() : 'N/A'}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: '32px', textAlign: 'right', paddingRight: '8px' }}>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => setIsEditing(true)}
                style={{ padding: '0 40px', height: '45px', borderRadius: '8px', fontWeight: 600 }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </FormCard>
    </ProfileWrapper>
  );
};

export default ProfilePage;
