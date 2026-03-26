import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  Avatar,
  Typography,
  Tag,
  Form,
  Input,
  Select,
  Button,
  message,
  Tooltip,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined,
  SafetyOutlined,
  HomeOutlined,
  CalendarOutlined,
  ManOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import styled, { keyframes } from "styled-components";
import { useTheme } from "../../context/ThemeContext";
import useAuth from "../../modules/auth/hooks/useAuth";
import { updateUser } from "../../modules/auth/authSlice";
import dayjs from "dayjs";
import axiosClient from "../../services/axiosClient";
import { updateStaffAPI } from "../../modules/users/userAPI";
import { updatePatientAPI } from "../../modules/patients/patientAPI";
import { useDispatch } from "react-redux";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ─── Animations ──────────────────────────────────────────
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${(props) => props.theme.primary}66; }
  50%      { box-shadow: 0 0 0 12px ${(props) => props.theme.primary}00; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// ─── Styled Components ───────────────────────────────────
const ProfileWrapper = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const HeroBanner = styled.div`
  background: ${(props) => props.theme.primary};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.secondary} 0%,
    ${(props) => props.theme.primary} 50%,
    ${(props) => props.theme.accent} 100%
  );
  border-radius: 20px;
  padding: 48px 40px 40px;
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: ${(props) => props.theme.shadow};

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 70%
    );
    border-radius: 50%;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 70%
    );
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
  background: ${(props) => props.theme.status.success};
  border: 3px solid ${(props) => props.theme.primary};
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
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: ${(props) => props.theme.background.card};
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  box-shadow: ${(props) => props.theme.shadow};
  border: 1px solid ${(props) => props.theme.border};
  transition: all 0.25s ease;
  cursor: default;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${(props) => props.theme.glow};
    border-color: ${(props) => props.theme.primary};
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
    color: ${(props) => props.theme.text.primary};
    display: block;
    margin-bottom: 2px;
  }

  .stat-label {
    font-size: 11.5px;
    color: ${(props) => props.theme.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 650;
    opacity: 0.85;
  }
`;

const DetailCard = styled(Card)`
  border-radius: 16px;
  border: 1px solid ${(props) => props.theme.border};
  box-shadow: ${(props) => props.theme.shadow};
  background: ${(props) => props.theme.background.card};
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;

  .ant-card-head {
    background: ${(props) => props.theme.background.header};
    border-bottom: 1px solid ${(props) => props.theme.border};
    padding: 0 28px;
    min-height: 54px;
  }

  .ant-card-head-title {
    font-weight: 700;
    color: ${(props) => props.theme.primary};
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
  border-bottom: 1px solid ${(props) => props.theme.border};
  transition: background 0.2s;

  &:hover {
    background: ${(props) => props.theme.background.main};
  }

  &:nth-child(odd) {
    border-right: 1px solid ${(props) => props.theme.border};

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
  color: ${(props) => props.theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 700;
  margin-bottom: 6px;
  opacity: 0.9;

  .anticon {
    font-size: 13px;
    color: ${(props) => props.theme.primary};
  }
`;

const InfoValue = styled.div`
  font-size: 15px;
  color: ${(props) => props.theme.text.primary};
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
  border-top: 1px solid ${(props) => props.theme.border};

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
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.primary} 0%,
    ${(props) => props.theme.secondary} 100%
  );
  border: none;
  box-shadow: ${(props) => props.theme.shadow};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.glow} !important;
    background: linear-gradient(
      135deg,
      ${(props) => props.theme.primaryHover} 0%,
      ${(props) => props.theme.secondary} 100%
    ) !important;
  }
`;

const ShimmerTag = styled(Tag)`
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.background.main} 25%,
    ${(props) => props.theme.primaryLight} 50%,
    ${(props) => props.theme.background.main} 75%
  );
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
  border: none;
  border-radius: 20px;
  padding: 2px 14px;
  font-weight: 600;
  color: ${(props) => props.theme.primary};
`;

// ─── Component ───────────────────────────────────────────
const ProfilePage = () => {
  const { user, userRole } = useAuth();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [enrichedProfile, setEnrichedProfile] = useState({});
  const [fetchingProfile, setFetchingProfile] = useState(false);

  const dispatch = useDispatch();

  const { theme } = useTheme();

  const loadEnrichedProfile = useCallback(async () => {
    if (!user?.id) return;
    setFetchingProfile(true);
    try {
      const isPatient = userRole === "PATIENT";

      if (isPatient) {
        // Direct resourceful fetch for patients
        const response = await axiosClient.get(`/api/patients/${user.id}`);
        setEnrichedProfile(response.data?.data || response.data || {});
      } else {
        // Staff still uses query param for now as per legacy pattern
        const response = await axiosClient.get("/api/staff", {
          params: { user_id: user.id },
        });
        const list = response.data?.data || response.data || [];
        const profileData =
          list.find((s) => String(s.user_id) === String(user.id)) || {};
        setEnrichedProfile(profileData);
      }
    } catch (err) {
      console.error("Failed to fetch enriched profile:", err);
    } finally {
      setFetchingProfile(false);
    }
  }, [user?.id, userRole]);

  useEffect(() => {
    loadEnrichedProfile();
  }, [loadEnrichedProfile]);

  const activeProfile = useMemo(
    // Identity from Auth (user) takes precedence over metadata from Staff (enrichedProfile)
    () => ({ ...enrichedProfile, ...user }),
    [user, enrichedProfile],
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
    if (enrichedProfile.id) {
      form.setFieldsValue({
        name: fullName,
        email: enrichedProfile.email,
        phone_number:
          enrichedProfile.phone_number ||
          enrichedProfile.phone ||
          enrichedProfile.contact ||
          enrichedProfile.mobile,
        gender: enrichedProfile.gender,
        address:
          enrichedProfile.address ||
          enrichedProfile.permanent_address ||
          enrichedProfile.resident_address,
        dob: enrichedProfile.dob
          ? dayjs(enrichedProfile.dob)
          : enrichedProfile.date_of_birth
            ? dayjs(enrichedProfile.date_of_birth)
            : null,
      });
    }
  }, [enrichedProfile, form, fullName]);

  if (!user)
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <Text type="secondary">Unable to load profile data.</Text>
      </div>
    );

  const onFinish = async (values) => {
    try {
      console.log("Update main profile:", values);
      const isPatient = userRole === "PATIENT";

      // 1. Update Basic Profile Info
      const updateData = {
        name: values.name,
        email: values.email,
        phone_number: values.phone_number,
        gender: values.gender,
        address: values.address,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      };

      if (isPatient) {
        // For patients, use the direct resourceful route
        await updatePatientAPI({ id: user.id, data: updateData });
      } else {
        // CRITICAL: use enrichedProfile.id (Staff Table) not user.id (User Table)
        if (!enrichedProfile.id) {
          throw new Error("Staff profile not found. Unable to update.");
        }

        // Handle names for staff table
        const nameParts = values.name.split(" ");
        const staffUpdateData = {
          ...updateData,
          name: values.name, // Ensure full name is sent
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(" "),
          user_id: user.id,
        };

        await updateStaffAPI({ id: enrichedProfile.id, data: staffUpdateData });
      }

      // Update local Redux state so header/sidebar refresh immediately
      dispatch(updateUser(updateData));

      message.success("Profile updated successfully");
      setIsEditing(false);

      // Re-fetch enriched profile to ensure consistency
      loadEnrichedProfile();
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
                border: "4px solid rgba(255, 255, 255, 0.3)",
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
            style={{ background: theme.primaryLight, color: theme.primary }}
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
            style={{
              background:
                theme.name === "dark" ? "rgba(16, 185, 129, 0.1)" : "#f0fdf4",
              color: theme.status.success,
            }}
          >
            <PhoneOutlined />
          </div>
          <span className="stat-value">{phoneNumber ? "On File" : "N/A"}</span>
          <span className="stat-label">Phone</span>
        </StatCard>
        <StatCard>
          <div
            className="stat-icon"
            style={{
              background:
                theme.name === "dark" ? "rgba(124, 58, 237, 0.1)" : "#faf5ff",
              color: theme.status.info,
            }}
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
            style={{
              background:
                theme.name === "dark" ? "rgba(234, 88, 12, 0.1)" : "#fff7ed",
              color: theme.accent,
            }}
          >
            <CrownOutlined />
          </div>
          <span className="stat-value">{userRole || "USER"}</span>
          <span className="stat-label">Role</span>
        </StatCard>
      </QuickStatsRow>

      {/* ─── Details / Edit Card ─── */}
      <DetailCard
        title={
          <Space>
            {isEditing ? <EditOutlined /> : <FileTextOutlined />}
            {isEditing ? "Edit Profile" : "Profile Details"}
          </Space>
        }
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
                loading={fetchingProfile}
                style={{
                  borderRadius: 10,
                  height: 46,
                  padding: "0 32px",
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
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
                <InfoValue style={{ textTransform: "capitalize" }}>
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
                  <ShimmerTag color={theme.primary}>{joinedDate}</ShimmerTag>
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <CrownOutlined /> Current Role
                </InfoLabel>
                <InfoValue>
                  <Tag
                    color={theme.primary}
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
