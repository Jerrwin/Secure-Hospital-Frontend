import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Avatar,
  Typography,
  Tag,
  Form,
  Input,
  Select,
  Button,
  Progress,
  Divider,
  message,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined,
  LockOutlined,
  SafetyOutlined,
  HomeOutlined,
  CalendarOutlined,
  ManOutlined,
  CrownOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import styled, { keyframes } from "styled-components";
import useAuth from "../../modules/auth/hooks/useAuth";
import useUsers from "../../modules/users/hooks/useUsers";
import dayjs from "dayjs";
import axiosClient from "../../services/axiosClient";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ─── Animations ──────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
  50%      { box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ─── Helpers ─────────────────────────────────────────────
const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: "None", color: "#e5e7eb" };
  if (pass.length < 6) return { score: 1, label: "Weak", color: "#ef4444" };
  if (pass.length < 10) return { score: 2, label: "Average", color: "#f59e0b" };
  return { score: 3, label: "Strong", color: "#10b981" };
};

// ─── Styled Components ───────────────────────────────────
const ProfileWrapper = styled.div`
  max-width: 960px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const HeroBanner = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%);
  border-radius: 20px;
  padding: 48px 40px 40px;
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: 0 20px 60px rgba(30, 58, 138, 0.25);

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    padding: 32px 20px 28px;
    border-radius: 16px;
  }
`;

const HeroContent = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
`;

const AvatarRing = styled.div`
  position: relative;
  flex-shrink: 0;

  .ant-avatar {
    border: 4px solid rgba(255, 255, 255, 0.3);
    transition: transform 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: scale(1.08);
    }
  }

  &::after {
    content: "";
    position: absolute;
    inset: -6px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    animation: ${pulse} 3s ease-in-out infinite;
  }
`;

const OnlineBadge = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  background: #22c55e;
  border: 3px solid #1e3a8a;
  border-radius: 50%;
  z-index: 2;
`;

const HeroInfo = styled.div`
  flex: 1;

  h2 {
    color: #fff !important;
    margin: 0 0 6px !important;
    font-size: clamp(1.4rem, 3vw, 1.85rem);
    font-weight: 700;
    letter-spacing: -0.02em;
  }
`;

const HeroMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const MetaPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 5px 14px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12.5px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .anticon {
    font-size: 12px;
    opacity: 0.8;
  }
`;

const QuickStatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;

  @media (max-width: 576px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  transition: all 0.25s ease;
  cursor: default;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.1);
    border-color: #dbeafe;
  }

  .stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    font-size: 18px;
  }

  .stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    display: block;
    margin-bottom: 2px;
  }

  .stat-label {
    font-size: 11.5px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }
`;

const DetailCard = styled(Card)`
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;

  .ant-card-head {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
    padding: 0 28px;
    min-height: 54px;
  }

  .ant-card-head-title {
    font-weight: 700;
    color: #1e3a8a;
    font-size: 15px;
  }

  .ant-card-body {
    padding: 28px;

    @media (max-width: 576px) {
      padding: 20px 16px;
    }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;

  &:hover {
    background: #fafbfe;
  }

  &:nth-child(odd) {
    border-right: 1px solid #f1f5f9;

    @media (max-width: 768px) {
      border-right: none;
    }
  }

  &.full-width {
    grid-column: 1 / -1;
    border-right: none;
  }
`;

const InfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 600;
  margin-bottom: 6px;

  .anticon {
    font-size: 13px;
    color: #3b82f6;
  }
`;

const InfoValue = styled.div`
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
  padding-left: 21px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: 1 / -1;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;

  @media (max-width: 576px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const EditBtn = styled(Button)`
  height: 48px;
  padding: 0 40px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4) !important;
    background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%) !important;
  }
`;

const ShimmerTag = styled(Tag)`
  background: linear-gradient(90deg, #eff6ff 25%, #dbeafe 50%, #eff6ff 75%);
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
  border: none;
  border-radius: 20px;
  padding: 2px 14px;
  font-weight: 600;
`;

// ─── Component ───────────────────────────────────────────
const ProfilePage = () => {
  const { user, userRole } = useAuth();
  const { staffList, fetchStaff, loading: staffLoading } = useUsers();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  const passwordValue = Form.useWatch("new_password", form);
  const strength = useMemo(
    () => getPasswordStrength(passwordValue),
    [passwordValue],
  );

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const staffProfile = useMemo(
    () => (staffList || []).find((s) => s.id === (user?.id || 0)) || {},
    [staffList, user?.id],
  );

  const activeProfile = useMemo(
    () => ({ ...user, ...staffProfile }),
    [user, staffProfile],
  );

  const fullName = useMemo(
    () =>
      activeProfile.name ||
      `${activeProfile.first_name || ""} ${activeProfile.last_name || ""}`.trim() ||
      "No Name",
    [activeProfile],
  );

  const phoneNumber = useMemo(
    () =>
      activeProfile.phone_number ||
      activeProfile.phone ||
      activeProfile.contact ||
      activeProfile.mobile ||
      null,
    [activeProfile],
  );

  const address = useMemo(
    () =>
      activeProfile.address ||
      activeProfile.permanent_address ||
      activeProfile.resident_address ||
      null,
    [activeProfile],
  );

  const initialValues = useMemo(
    () => ({
      name: fullName,
      email: activeProfile.email,
      phone_number: phoneNumber,
      gender: activeProfile.gender,
      address: address,
      dob: activeProfile.dob
        ? dayjs(activeProfile.dob)
        : activeProfile.date_of_birth
          ? dayjs(activeProfile.date_of_birth)
          : null,
    }),
    [activeProfile, fullName, phoneNumber, address],
  );

  useEffect(() => {
    if (staffProfile.id) {
      form.setFieldsValue({
        name: fullName,
        email: staffProfile.email,
        phone_number:
          staffProfile.phone_number ||
          staffProfile.phone ||
          staffProfile.contact ||
          staffProfile.mobile,
        gender: staffProfile.gender,
        address:
          staffProfile.address ||
          staffProfile.permanent_address ||
          staffProfile.resident_address,
        dob: staffProfile.dob
          ? dayjs(staffProfile.dob)
          : staffProfile.date_of_birth
            ? dayjs(staffProfile.date_of_birth)
            : null,
      });
    }
  }, [staffProfile, form, fullName]);

  if (!user)
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <Text type="secondary">Unable to load profile data.</Text>
      </div>
    );

  const onFinish = async (values) => {
    try {
      console.log("Update main profile:", values);

      if (values.new_password) {
        if (!values.current_password) {
          return message.error(
            "Current password is required to set a new password",
          );
        }

        const response = await axiosClient.post("/api/auth/change-password", {
          current_password: values.current_password,
          new_password: values.new_password,
          new_password_confirmation: values.confirm_password,
        });

        if (response.data.success) {
          message.success("Password updated successfully");
        }
      }

      message.success("Profile updated successfully");
      setIsEditing(false);
      form.setFieldsValue({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Update failed:", error);
      message.error(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  };

  const joinedDate = activeProfile.created_at
    ? new Date(activeProfile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ProfileWrapper>
      {/* ─── Hero Banner ─── */}
      <HeroBanner>
        <HeroContent>
          <AvatarRing>
            <Avatar
              size={100}
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "32px",
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <OnlineBadge />
          </AvatarRing>

          <HeroInfo>
            <Title level={2}>{fullName}</Title>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
                display: "block",
              }}
            >
              {activeProfile.email || "No email on file"}
            </Text>

            <HeroMeta>
              <MetaPill>
                <CrownOutlined /> {userRole || "USER"}
              </MetaPill>
              <MetaPill>
                <CheckCircleOutlined />
                {(user.status || "Active").charAt(0).toUpperCase() +
                  (user.status || "Active").slice(1)}
              </MetaPill>
              <MetaPill>
                <IdcardOutlined /> ID #{user.id}
              </MetaPill>
              {joinedDate !== "N/A" && (
                <MetaPill>
                  <CalendarOutlined /> Joined {joinedDate}
                </MetaPill>
              )}
            </HeroMeta>
          </HeroInfo>

          {!isEditing && (
            <Tooltip title="Edit Profile">
              <EditBtn
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </EditBtn>
            </Tooltip>
          )}
        </HeroContent>
      </HeroBanner>

      {/* ─── Quick Stats ─── */}
      <QuickStatsRow>
        <StatCard>
          <div
            className="stat-icon"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            <MailOutlined />
          </div>
          <span className="stat-value">
            {activeProfile.email ? "Verified" : "Unverified"}
          </span>
          <span className="stat-label">Email Status</span>
        </StatCard>
        <StatCard>
          <div
            className="stat-icon"
            style={{ background: "#f0fdf4", color: "#16a34a" }}
          >
            <PhoneOutlined />
          </div>
          <span className="stat-value">{phoneNumber ? "On File" : "N/A"}</span>
          <span className="stat-label">Phone</span>
        </StatCard>
        <StatCard>
          <div
            className="stat-icon"
            style={{ background: "#faf5ff", color: "#7c3aed" }}
          >
            <SafetyOutlined />
          </div>
          <span className="stat-value">
            {user.status === "active" || !user.status ? "Secure" : "Review"}
          </span>
          <span className="stat-label">Account</span>
        </StatCard>
        <StatCard>
          <div
            className="stat-icon"
            style={{ background: "#fff7ed", color: "#ea580c" }}
          >
            <CrownOutlined />
          </div>
          <span className="stat-value">{userRole || "USER"}</span>
          <span className="stat-label">Role</span>
        </StatCard>
      </QuickStatsRow>

      {/* ─── Details / Edit Card ─── */}
      <DetailCard
        title={isEditing ? "✏️ Edit Profile" : "📋 Profile Details"}
      >
        {isEditing ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={onFinish}
            autoComplete="off"
            requiredMark="optional"
          >
            <FormGrid>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[{ type: "email", message: "Enter a valid email" }]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Form.Item label="Phone Number" name="phone_number">
                <Input
                  prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />}
                  size="large"
                  placeholder="E.g., +1 234 567 890"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Form.Item label="Gender" name="gender">
                <Select
                  size="large"
                  placeholder="Select gender"
                  style={{ borderRadius: 10 }}
                >
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Permanent Address"
                name="address"
                className="full-width"
              >
                <TextArea
                  rows={3}
                  placeholder="Provide your full address"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </FormGrid>

            <Divider
              titlePlacement="left"
              style={{ color: "#1e3a8a", fontWeight: 600 }}
            >
              <SafetyOutlined /> Security & Password
            </Divider>

            <FormGrid>
              <Form.Item
                label="Current Password"
                name="current_password"
                tooltip="Required to confirm identity"
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                  size="large"
                  placeholder="Enter current password"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <div>
                <Form.Item
                  label="New Password"
                  name="new_password"
                  rules={[
                    {
                      min: 6,
                      message: "Password must be at least 6 characters",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                    size="large"
                    style={{ borderRadius: 10 }}
                  />
                </Form.Item>
                {passwordValue && (
                  <div style={{ marginTop: "-16px", marginBottom: "16px" }}>
                    <Progress
                      percent={strength.score * 33.3}
                      showInfo={false}
                      strokeColor={strength.color}
                      size="small"
                    />
                    <Text
                      style={{ fontSize: "12px", color: strength.color, fontWeight: 600 }}
                    >
                      Strength: {strength.label}
                    </Text>
                  </div>
                )}
              </div>

              <Form.Item
                label="Confirm New Password"
                name="confirm_password"
                dependencies={["new_password"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Password mismatch"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                  size="large"
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>
            </FormGrid>

            <ActionBar>
              <Button
                icon={<CloseOutlined />}
                onClick={() => setIsEditing(false)}
                size="large"
                style={{ borderRadius: 10, height: 46 }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                loading={staffLoading}
                style={{
                  borderRadius: 10,
                  height: 46,
                  padding: "0 32px",
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                Save Changes
              </Button>
            </ActionBar>
          </Form>
        ) : (
          <>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>
                  <UserOutlined /> Full Name
                </InfoLabel>
                <InfoValue>{fullName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <MailOutlined /> Email Address
                </InfoLabel>
                <InfoValue>{activeProfile.email || "N/A"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <PhoneOutlined /> Phone Number
                </InfoLabel>
                <InfoValue>{phoneNumber || "N/A"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <ManOutlined /> Gender
                </InfoLabel>
                <InfoValue
                  style={{ textTransform: "capitalize" }}
                >
                  {activeProfile.gender || "N/A"}
                </InfoValue>
              </InfoItem>
              <InfoItem className="full-width">
                <InfoLabel>
                  <HomeOutlined /> Permanent Address
                </InfoLabel>
                <InfoValue>{address || "N/A"}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <CalendarOutlined /> Member Since
                </InfoLabel>
                <InfoValue>
                  <ShimmerTag color="blue">{joinedDate}</ShimmerTag>
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <CrownOutlined /> Current Role
                </InfoLabel>
                <InfoValue>
                  <Tag
                    color="geekblue"
                    style={{
                      borderRadius: 20,
                      padding: "2px 14px",
                      fontWeight: 600,
                    }}
                  >
                    {userRole || "USER"}
                  </Tag>
                </InfoValue>
              </InfoItem>
            </InfoGrid>
          </>
        )}
      </DetailCard>
    </ProfileWrapper>
  );
};

export default ProfilePage;
