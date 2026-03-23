import React, { useEffect } from "react";
import { Form, Input, Button, Alert } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  CheckCircleFilled,
  SafetyOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import useAuth from "../../modules/auth/hooks/useAuth";

// ─── Animations ──────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
`;

// ─── Layout ──────────────────────────────────────────────
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
`;

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 5rem;
  color: white;
  position: relative;
  overflow: hidden;

  /* Subtle grid pattern overlay */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }

  /* Decorative glow */
  &::after {
    content: "";
    position: absolute;
    top: 20%;
    right: -5%;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

const LeftContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 480px;
`;

const RightPanel = styled.div`
  width: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 4rem;
  background: #ffffff;

  @media (max-width: 900px) {
    width: 100%;
    padding: 2rem 1.5rem;
  }
`;

const FormCard = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
  max-width: 380px;
  width: 100%;
`;

// ─── Left Panel Elements ─────────────────────────────────
const IconBox = styled.div`
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  animation: ${float} 4s ease-in-out infinite;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: #ffffff;
  margin: 0 0 1rem;
`;

const HeroSubtitle = styled.p`
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 0 2.5rem;
  max-width: 400px;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #cbd5e1;
  font-weight: 400;

  .anticon {
    color: #60a5fa;
    font-size: 14px;
  }
`;

const LeftPanelFooter = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 5rem;
  color: #d4dae3;
  font-size: 0.8rem;
  z-index: 1;
`;

// ─── Right Panel Elements ────────────────────────────────
const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2.5rem;
`;

const BrandIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
`;

const BrandName = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
`;

const Heading = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
`;

const SubHeading = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 1.75rem;
  line-height: 1.5;
`;

const TenantBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 1.75rem;
  letter-spacing: 0.01em;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #0ea5e9;
  }
`;

const StyledLabel = styled.span`
  color: #334155;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.01em;
`;

const StyledInput = styled(Input)`
  border-radius: 10px !important;
  padding: 10px 14px !important;
  border: 1.5px solid #e2e8f0 !important;
  transition: all 0.25s ease !important;

  &:hover {
    border-color: #93c5fd !important;
  }

  &:focus,
  &.ant-input-affix-wrapper-focused {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08) !important;
  }

  .ant-input-prefix {
    margin-right: 10px;
  }
`;

const StyledPasswordInput = styled(Input.Password)`
  border-radius: 10px !important;
  padding: 10px 14px !important;
  border: 1.5px solid #e2e8f0 !important;
  transition: all 0.25s ease !important;

  &:hover {
    border-color: #93c5fd !important;
  }

  &:focus,
  &.ant-input-affix-wrapper-focused {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08) !important;
  }

  .ant-input-prefix {
    margin-right: 10px;
  }
`;

const SignInButton = styled(Button)`
  height: 46px !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25) !important;
  transition: all 0.3s ease !important;

  &:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35) !important;
  }

  &:active {
    transform: translateY(0) !important;
  }
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 2rem;

  .anticon {
    font-size: 12px;
    color: #10b981;
  }
`;

// ─── Component ───────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, error, clearAuthError } =
    useAuth();
  const [form] = Form.useForm();

  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isSubdomain =
    subdomain !== "localhost" && subdomain !== "www" && hostname.includes(".");

  const hospitalName = isSubdomain
    ? subdomain.charAt(0).toUpperCase() + subdomain.slice(1)
    : "MedPortal";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onFinish = (values) => {
    clearAuthError();
    login({ email: values.email, password: values.password });
  };

  return (
    <PageWrapper>
      {/* ─── Left Panel ─── */}
      <LeftPanel>
        <LeftContent>
          <IconBox>
            <MedicineBoxOutlined style={{ fontSize: "24px", color: "#60a5fa" }} />
          </IconBox>
          <HeroTitle>
            Smarter care,
            <br />
            better outcomes.
          </HeroTitle>
          <HeroSubtitle>
            A secure, all-in-one platform for managing patients, scheduling,
            prescriptions, and clinical workflows — designed for modern
            healthcare teams.
          </HeroSubtitle>

          <FeatureList>
            {[
              "End-to-end encrypted patient records",
              "Role-based access with audit logging",
              "Real-time appointment & prescription management",
              "Multi-tenant architecture for hospital groups",
            ].map((item) => (
              <FeatureItem key={item}>
                <CheckCircleFilled />
                {item}
              </FeatureItem>
            ))}
          </FeatureList>
        </LeftContent>

        <LeftPanelFooter>
          © {new Date().getFullYear()} MedPortal Enterprise System. All rights
          reserved.
        </LeftPanelFooter>
      </LeftPanel>

      {/* ─── Right Panel ─── */}
      <RightPanel>
        <FormCard>
          <BrandRow>
            <BrandIcon>
              <MedicineBoxOutlined />
            </BrandIcon>
            <BrandName>{hospitalName}</BrandName>
          </BrandRow>

          {isSubdomain && (
            <TenantBadge>
              {hospitalName} Healthcare Workspace
            </TenantBadge>
          )}

          <Heading>Welcome back</Heading>
          <SubHeading>
            Sign in to access your dashboard and manage your workspace.
          </SubHeading>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={clearAuthError}
              style={{
                marginBottom: "1.25rem",
                borderRadius: "10px",
                border: "1px solid #fecaca",
                background: "#fef2f2",
              }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label={<StyledLabel>Email address</StyledLabel>}
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email address" },
              ]}
            >
              <StyledInput
                prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                placeholder="you@hospital.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<StyledLabel>Password</StyledLabel>}
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <StyledPasswordInput
                prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <Form.Item style={{ marginTop: "0.5rem", marginBottom: 0 }}>
              <SignInButton
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                block
              >
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRightOutlined style={{ marginLeft: 8 }} />}
              </SignInButton>
            </Form.Item>
          </Form>

          <SecurityNote>
            <SafetyOutlined />
            Protected by enterprise-grade encryption
          </SecurityNote>
        </FormCard>
      </RightPanel>
    </PageWrapper>
  );
};

export default LoginPage;
