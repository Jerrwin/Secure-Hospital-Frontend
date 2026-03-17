import React, { useEffect } from "react";
import { Form, Input, Button, Alert } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import useAuth from "../../modules/auth/hooks/useAuth";

// ─── Styled Components ───────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  background: #eff6ff; /* Very soft, cool blue-tinted white */
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
`;

const LeftPanel = styled.div`
  flex: 1;
  /* Smooth medical blue gradient: Deep Blue to Royal Blue */
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4rem 5rem;
  color: white;

  @media (max-width: 900px) {
    display: none;
  }
`;

const RightPanel = styled.div`
  width: 520px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  background: #ffffff;
  box-shadow: -8px 0 32px rgba(37, 99, 235, 0.05); /* Subtle blue shadow */

  @media (max-width: 900px) {
    width: 100%;
    padding: 2rem;
    box-shadow: none;
  }
`;

const FormCard = styled.div`
  animation: ${fadeIn} 0.5s ease-out forwards;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2.5rem;
  color: #1e3a8a; /* Deep blue text */
`;

const BrandName = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Heading = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e3a8a; /* Deep blue text */
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
`;

const SubHeading = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  margin: 0 0 2rem 0;
`;

const StyledLabel = styled.span`
  color: #334155;
  font-size: 0.875rem;
  font-weight: 500;
`;

const TenantBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 2rem;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3b82f6; /* Smooth blue indicator */
  }
`;

// Left Panel Specific Styles
const HeroTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 700;
  margin: 1.5rem 0 1rem 0;
  line-height: 1.15;
  letter-spacing: -1px;
  color: #ffffff;
`;

const HeroSubtitle = styled.p`
  color: #bfdbfe; /* Soft light blue text */
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 400px;
  margin-bottom: 3rem;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #eff6ff;
  font-size: 0.95rem;
  font-weight: 400;
`;

const FooterText = styled.p`
  color: #64748b;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 2.5rem;
`;

// ─── Component ───────────────────────────────────────────────────
const LoginPage = () => {
  console.log("The entire page just rendered!");

  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, error, clearAuthError } =
    useAuth();
  const [form] = Form.useForm();

  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isSubdomain =
    subdomain !== "localhost" && subdomain !== "www" && hostname.includes(".");

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
      {/* Left Panel — Branding & Value Prop */}
      <LeftPanel>
        <div>
          <MedicineBoxOutlined
            style={{ fontSize: "2.5rem", color: "#93c5fd" }}
          />
          <HeroTitle>Modernizing clinical workflows.</HeroTitle>
          <HeroSubtitle>
            A secure, unified platform designed to help healthcare professionals
            manage patients, appointments, and records efficiently.
          </HeroSubtitle>

          <FeatureList>
            {[
              "HIPAA compliant data architecture",
              "Role-based access & audit logging",
              "Integrated patient management",
            ].map((item) => (
              <FeatureItem key={item}>
                <CheckCircleFilled
                  style={{ color: "#93c5fd", fontSize: "1.1rem" }}
                />
                {item}
              </FeatureItem>
            ))}
          </FeatureList>
        </div>

        <div style={{ color: "#93c5fd", fontSize: "0.85rem", opacity: 0.8 }}>
          © {new Date().getFullYear()} MedPortal Enterprise. All rights
          reserved.
        </div>
      </LeftPanel>

      {/* Right Panel — Login Form */}
      <RightPanel>
        <FormCard>
          <BrandRow>
            <MedicineBoxOutlined
              style={{ fontSize: "1.8rem", color: "#2563eb" }}
            />
            <BrandName>MedPortal</BrandName>
          </BrandRow>

          {isSubdomain && (
            <TenantBadge>
              {subdomain.charAt(0).toUpperCase() + subdomain.slice(1)}{" "}
              Healthcare Workspace
            </TenantBadge>
          )}

          <Heading>Log in to your account</Heading>
          <SubHeading>
            Enter your credentials to access your workspace.
          </SubHeading>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={clearAuthError}
              style={{ marginBottom: "1.5rem", borderRadius: "6px" }}
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
              label={<StyledLabel>Email</StyledLabel>}
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email address" },
              ]}
            >
              <Input
                prefix={
                  <UserOutlined
                    style={{ color: "#94a3b8", marginRight: "8px" }}
                  />
                }
                placeholder="doctor@hospital.com"
                size="large"
                style={{ borderRadius: "6px", padding: "8px 12px" }}
              />
            </Form.Item>

            <Form.Item
              label={<StyledLabel>Password</StyledLabel>}
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    style={{ color: "#94a3b8", marginRight: "8px" }}
                  />
                }
                placeholder="••••••••"
                size="large"
                style={{ borderRadius: "6px", padding: "8px 12px" }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: "1rem", marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                block
                style={{
                  background: "#2563eb" /* Smooth primary blue */,
                  borderRadius: "6px",
                  height: "44px",
                  fontWeight: 500,
                  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
                }}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          <FooterText>Protected by enterprise-grade encryption.</FooterText>
        </FormCard>
      </RightPanel>
    </PageWrapper>
  );
};

export default LoginPage;
