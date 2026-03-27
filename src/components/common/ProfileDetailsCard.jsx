import React from "react";
import styled from "styled-components";
import { Card, Row, Col, Typography, Tag, Space, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  IdcardOutlined,
  CloseOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const StyledCard = styled(Card)`
  background: ${(props) => props.theme.background.card};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 12px;
  box-shadow: ${(props) => props.theme.shadow};
  margin-top: 24px;
  animation: slideIn 0.3s ease-out;
  position: relative;
  z-index: 10; /* Ensure it stays above background elements */

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .ant-card-head {
    border-bottom: 1px solid ${(props) => props.theme.border};
    background: ${(props) => props.theme.background.header || props.theme.background.main};
    border-radius: 12px 12px 0 0;
    padding: 16px 24px; /* Increased height/padding */
  }
`;

const PulseIndicator = styled.div`
  width: 7px;
  height: 7px;
  background: ${(props) => props.theme.status.success};
  border-radius: 50%;
  position: relative;
  display: inline-block;
  vertical-align: middle;
  margin-top: -2px; /* Fine-tuned alignment */
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: inherit;
    border-radius: inherit;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(3); opacity: 0; }
  }
`;

const DetailItem = styled.div`
  padding: 16px;
  background: ${(props) => (props.active ? props.theme.primaryLight + "44" : "transparent")};
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled(Text)`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${(props) => props.theme.text.light};
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Value = styled(Text)`
  font-size: 15px;
  font-weight: 500;
  color: ${(props) => props.theme.text.primary};
`;

const HeaderIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${(props) => props.theme.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.primary};
`;

const ProfileDetailsCard = ({ data, title = "Profile Details", onClose }) => {
  if (!data) return null;

  const fullName = data.full_name || data.name || `${data.first_name || ""} ${data.last_name || ""}`.trim();
  const role = data.role_name || data.role || "N/A";
  const joinedDate = data.created_at || data.joined_at;

  return (
    <StyledCard
      title={
        <Space size="middle">
          <HeaderIcon>
            <IdcardOutlined />
          </HeaderIcon>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Title level={5} style={{ margin: 0, fontSize: "16px", fontWeight: 700, lineHeight: 1.2 }}>
              {title}
            </Title>
            <Space size={8} align="center" style={{ marginTop: '2px' }}>
              <PulseIndicator />
              <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.3px' }}>
                Active Record
              </Text>
            </Space>
          </div>
        </Space>
      }
      extra={
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{ color: "#94a3b8" }}
        />
      }
    >
      <Row gutter={[0, 0]} style={{ border: `1px solid rgba(0,0,0,0.05)`, borderRadius: "8px", overflow: "hidden" }}>
        {/* Name Section */}
        <Col xs={24} md={12} style={{ borderRight: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <DetailItem active>
            <Label>
              <UserOutlined /> FULL NAME
            </Label>
            <Value>{fullName}</Value>
          </DetailItem>
        </Col>

        {/* Email Section */}
        <Col xs={24} md={12} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <DetailItem>
            <Label>
              <MailOutlined /> EMAIL ADDRESS
            </Label>
            <Value>{data.email || "N/A"}</Value>
          </DetailItem>
        </Col>

        {/* Phone Section */}
        <Col xs={24} md={12} style={{ borderRight: "1px solid rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <DetailItem>
            <Label>
              <PhoneOutlined /> PHONE NUMBER
            </Label>
            <Value>{data.phone_number || data.phone || "N/A"}</Value>
          </DetailItem>
        </Col>

        {/* Gender Section */}
        <Col xs={24} md={12} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <DetailItem>
            <Label>
              {data.gender === "female" ? <WomanOutlined /> : <ManOutlined />} GENDER
            </Label>
            <Value style={{ textTransform: "capitalize" }}>{data.gender || "N/A"}</Value>
          </DetailItem>
        </Col>

        {/* Address Section */}
        <Col xs={24} md={data.blood_group ? 16 : 24} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <DetailItem>
            <Label>
              <EnvironmentOutlined /> PERMANENT ADDRESS
            </Label>
            <Value>{data.address || "N/A"}</Value>
          </DetailItem>
        </Col>

        {/* Blood Group Section (Patient Only) */}
        {data.blood_group && (
          <Col xs={24} md={8} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", borderLeft: "1px solid rgba(0,0,0,0.05)" }}>
            <DetailItem active>
              <Label>
                <HeartOutlined /> BLOOD GROUP
              </Label>
              <Tag color="red" style={{ fontWeight: 700, borderRadius: '4px' }}>
                {data.blood_group}
              </Tag>
            </DetailItem>
          </Col>
        )}

        {/* Footer Info */}
        <Col xs={24} md={12} style={{ borderRight: "1px solid rgba(0,0,0,0.05)" }}>
          <DetailItem>
            <Label>
              <CalendarOutlined /> MEMBER SINCE
            </Label>
            <Tag color="processing" style={{ width: "fit-content", borderRadius: "100px", border: "none", padding: "0 12px" }}>
              {joinedDate ? dayjs(joinedDate).format("MMMM D, YYYY") : "N/A"}
            </Tag>
          </DetailItem>
        </Col>

        <Col xs={24} md={12}>
          <DetailItem>
            <Label>
              {data.blood_group ? (
                <>
                  <CalendarOutlined /> AGE
                </>
              ) : (
                <>
                  <IdcardOutlined /> CURRENT ROLE
                </>
              )}
            </Label>
            <Tag
              color={data.blood_group ? "default" : "blue"}
              style={{
                width: "fit-content",
                borderRadius: "100px",
                border: "none",
                padding: "0 12px",
                fontWeight: 600,
              }}
            >
              {data.blood_group
                ? `${data.dob ? dayjs().diff(dayjs(data.dob), "year") : "N/A"} YRS`
                : role.toUpperCase()}
            </Tag>
          </DetailItem>
        </Col>
      </Row>
    </StyledCard>
  );
};

export default ProfileDetailsCard;
