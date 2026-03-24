import React from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Switch,
  Divider,
  Space,
  message,
  Row,
  Col,
} from "antd";
import {
  LockOutlined,
  BellOutlined,
  SafetyOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { useTheme } from "../../context/ThemeContext";

const { Text } = Typography;

// ─── Breakpoints (Dynamic Helpers) ───────────────────────────────────────────
const bp = {
  xs: (props) => props.theme.breakpoints.xs,
  sm: (props) => props.theme.breakpoints.sm,
  md: (props) => props.theme.breakpoints.md,
  lg: (props) => props.theme.breakpoints.lg,
  xl: (props) => props.theme.breakpoints.xl,
};

const SettingsWrapper = styled.div`
  padding: 0;
`;

const HeaderCard = styled.div`
  background: ${props => props.theme.background.card};
  border: 1px solid ${props => props.theme.border};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadow};
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
  @media (min-width: ${bp.md}) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
`;

const PageTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.text.primary};
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (min-width: ${bp.sm}) {
    font-size: 17px;
  }
  @media (min-width: ${bp.md}) {
    font-size: 18px;
  }
`;

const StyledCard = styled(Card)`
  border-radius: 12px !important;
  box-shadow: ${props => props.theme.shadow} !important;
  border: 1px solid ${props => props.theme.border} !important;
  background: ${props => props.theme.background.card} !important;
  height: 100%;

  .ant-card-head {
    border-bottom: 1px solid ${props => props.theme.border};
    background: ${props => props.theme.background.main};
    border-radius: 12px 12px 0 0 !important;
  }

  .ant-card-head-title {
    color: ${props => props.theme.primary};
    font-weight: 600;
    font-size: 15px;
  }
`;

const SecuritySettings = () => {
  const { theme } = useTheme();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Update settings:", values);
    message.success("Settings updated successfully");
  };

  return (
    <SettingsWrapper>
      <HeaderCard>
        <HeaderRow>
          <HeaderLeft>
            <TitleIcon>
              <SafetyOutlined style={{ fontSize: "20px", color: theme.primary }} />
            </TitleIcon>
            <PageTitle>Security & Settings</PageTitle>
          </HeaderLeft>
        </HeaderRow>
      </HeaderCard>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <StyledCard
            title={
              <Space>
                <LockOutlined /> Account Security
              </Space>
            }
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item label="Change Password" name="password">
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="New password"
                  size="large"
                />
              </Form.Item>

              <Form.Item label="Confirm Password" name="confirm">
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                  size="large"
                />
              </Form.Item>

              <Divider />

              <Form.Item
                label="Two-Factor Authentication"
                valuePropName="checked"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text type="secondary">
                    Add an extra layer of security to your account.
                  </Text>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  size="large"
                  style={{
                    borderRadius: "8px",
                    background: theme.primary,
                    border: "none",
                  }}
                >
                  Save Security Settings
                </Button>
              </Form.Item>
            </Form>
          </StyledCard>
        </Col>

        <Col xs={24} lg={12}>
          <StyledCard
            title={
              <Space>
                <BellOutlined /> Notification Preferences
              </Space>
            }
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <Text strong style={{ fontSize: "15px" }}>
                    Email Notifications
                  </Text>
                  <Switch defaultChecked />
                </div>
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Receive updates about your appointments via email.
                </Text>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <Text strong style={{ fontSize: "15px" }}>
                    System Notifications
                  </Text>
                  <Switch defaultChecked />
                </div>
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Receive real-time alerts in the dashboard.
                </Text>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <Text strong style={{ fontSize: "15px" }}>
                    SMS Alerts
                  </Text>
                  <Switch />
                </div>
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Get text messages for urgent appointment changes.
                </Text>
              </div>
            </div>
          </StyledCard>
        </Col>
      </Row>
    </SettingsWrapper>
  );
};

export default SecuritySettings;
