import React, { useEffect } from "react";
import { Form, Input, Button, Alert } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MedicineBoxOutlined,
  CheckCircleFilled,
  SafetyOutlined,
  ArrowRightOutlined,
  GlobalOutlined,
  ExperimentOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import useAuth from "../../modules/auth/hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

// ─── Keyframes ────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const drift = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.1); }
`;

const staggerIn = (delay) => css`
  animation: ${fadeUp} 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay} both;
`;

const float = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0); }
  33% { transform: translate(-15px, -20px) rotate(10deg); }
  66% { transform: translate(15px, 10px) rotate(-10deg); }
`;

// ─── Root Layout ──────────────────────────────────────────────────────────────

const PageRoot = styled.div`
  min-height: 100vh;
  display: flex;
  background: linear-gradient(
    135deg,
    ${(p) => p.theme.primary}12 0%,
    ${(p) => p.theme.background.main} 50%,
    ${(p) => p.theme.secondary}18 100%
  );
  font-family: "Outfit", sans-serif;
  position: relative;
  overflow: hidden;

  @media (max-width: 900px) {
    flex-direction: column;
    overflow-y: auto;
  }
`;

// ─── Background: Vibrant Theme Blobs ──────────────────────────────────────────

const BgCanvas = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.4;
  animation: ${drift} 25s infinite alternate ease-in-out;
  mix-blend-mode: soft-light;
`;

const Blob1 = styled(Blob)`
  width: 800px;
  height: 800px;
  top: -200px;
  left: -200px;
  background: ${(p) => p.theme.primary};
`;

const Blob2 = styled(Blob)`
  width: 600px;
  height: 600px;
  bottom: -150px;
  right: -100px;
  background: ${(p) => p.theme.secondary};
  animation-delay: -5s;
`;

const Blob3 = styled(Blob)`
  width: 400px;
  height: 400px;
  top: 40%;
  left: 30%;
  background: ${(p) => p.theme.accent || p.theme.primary};
  opacity: 0.3;
  animation-delay: -10s;
`;

const FloatingIcon = styled.div`
  position: absolute;
  color: white;
  opacity: 0.06;
  font-size: ${(p) => p.$size || "32px"};
  filter: blur(${(p) => p.$blur || "0px"});
  z-index: 0;
  left: ${(p) => p.$left};
  top: ${(p) => p.$top};
  animation: ${float} ${(p) => p.$duration || "25s"} infinite ease-in-out;
  animation-delay: ${(p) => p.$delay || "0s"};
  pointer-events: none;
`;

const AnimationLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
`;

// ─── 50/50 Glass Panes ────────────────────────────────────────────────────────

const GlassSide = styled.div`
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  backdrop-filter: blur(45px);
  -webkit-backdrop-filter: blur(45px);
`;

const LeftHero = styled(GlassSide)`
  padding: 4rem 5rem;
  position: relative;
  overflow: hidden;
  background: ${(p) => {
    const darkStop =
      p.theme.name === "dark"
        ? "#020617"
        : p.theme.name === "warm"
          ? "#2a0f02"
          : "#060b1a";
    if (p.theme.name === "dark") {
      return `linear-gradient(165deg, rgba(255, 255, 255, 0.08) 0%, ${p.theme.secondary} 100%)`;
    }
    return `linear-gradient(165deg, #ffffff 0%, ${p.theme.secondary} 35%, ${darkStop} 100%)`;
  }};
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 10px 0 50px rgba(0, 0, 0, 0.25);
  color: white;

  /* Ensure text is readable on the gradient */
  h1,
  p,
  .head,
  .body,
  span {
    color: white;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 1200px) {
    padding: 4rem;
  }
  @media (max-width: 900px) {
    display: none;
  }
`;

const RightForm = styled(GlassSide)`
  padding: 3rem;
  background: ${(p) => p.theme.background.card};
  border-left: 1px solid ${(p) => p.theme.border};
  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  @media (max-width: 900px) {
    padding: 2.5rem 1.5rem;
  }
`;

// ─── Hero Components (Bigger Text) ───────────────────────────────────────────

const ContentWrap = styled.div`
  max-width: 580px;
  width: 100%;
  ${staggerIn("0.1s")}
`;

const BrandLine = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  width: 54px;
  height: 54px;
  background: ${(p) =>
    p.theme.name === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : `${p.theme.primary}15`};
  border: 1px solid
    ${(p) =>
      p.theme.name === "dark"
        ? "rgba(255, 255, 255, 0.2)"
        : `${p.theme.primary}33`};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
`;

const BrandTxt = styled.span`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const BigTitle = styled.h1`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: inherit;
  margin-bottom: 1.5rem;
  ${staggerIn("0.2s")}

  span {
    opacity: 0.6;
  }

  @media (max-width: 1200px) {
    font-size: 2.6rem;
  }
`;

const DescriptionText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: inherit;
  opacity: 0.85;
  margin-bottom: 3rem;
  max-width: 460px;
  font-weight: 500;
  ${staggerIn("0.3s")}
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  ${staggerIn("0.4s")}
`;

const FeatureItem = styled.div`
  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 6px;
    color: inherit;
  }
  .body {
    font-size: 0.9rem;
    color: inherit;
    opacity: 0.7;
    line-height: 1.5;
  }
`;

// ─── Form Components ─────────────────────────────────────────────────────────

const InnerForm = styled.div`
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
  animation: ${fadeIn} 1s ease both;
`;

const WelcomeHeading = styled.h2`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 2.1rem;
  font-weight: 800;
  color: ${(p) => p.theme.text.primary};
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
`;

const WelcomeSubtitle = styled.p`
  font-size: 0.95rem;
  color: ${(p) => p.theme.text.secondary};
  margin-bottom: 2.5rem;
`;

const TenantBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: ${(p) => p.theme.primaryLight};
  border: 1px solid ${(p) => p.theme.primary}22;
  border-radius: 12px;
  margin-bottom: 2rem;

  .text {
    font-size: 0.95rem;
    font-weight: 700;
    color: ${(p) => p.theme.primary};
  }
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${(p) => p.theme.text.secondary};
  margin-bottom: 8px;
`;

const StyledInp = styled(Input)`
  height: 54px;
  border-radius: 12px !important;
  background: ${(p) => p.theme.inputBg} !important;
  border: 1.5px solid ${(p) => p.theme.border} !important;
  font-family: inherit;

  &:hover,
  &:focus {
    border-color: ${(p) => p.theme.primary} !important;
  }
`;

const StyledPass = styled(Input.Password)`
  height: 54px;
  border-radius: 12px !important;
  background: ${(p) => p.theme.inputBg} !important;
  border: 1.5px solid ${(p) => p.theme.border} !important;

  &:hover,
  &:focus {
    border-color: ${(p) => p.theme.primary} !important;
  }
`;

const ActionButton = styled(Button)`
  height: 60px !important;
  width: 100%;
  border-radius: 16px !important;
  background: linear-gradient(
    135deg,
    ${(p) => p.theme.primary},
    ${(p) => p.theme.primaryHover}
  ) !important;
  border: none !important;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  box-shadow: ${(p) => p.theme.glow};
  margin-top: 1.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px -6px ${(p) => p.theme.primary}55;
  }
`;

const SecurityStamp = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 2.5rem;
  color: ${(p) => p.theme.text.light};
  font-size: 0.75rem;
  font-weight: 500;

  .anticon {
    color: ${(p) => p.theme.status.success};
  }
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const LoginPage = () => {
  const { theme } = useTheme();
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
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const onFinish = (values) => {
    clearAuthError();
    login({ email: values.email, password: values.password });
  };

  return (
    <PageRoot theme={theme}>
      {/* ─── Bg Blobs ─── */}
      <BgCanvas>
        <Blob1 theme={theme} />
        <Blob2 theme={theme} />
        <Blob3 theme={theme} />
      </BgCanvas>

      {/* ─── Left Side (Deep Glass) ─── */}
      <LeftHero theme={theme}>
        {/* ─── Subtle SaaS Background Elements ─── */}
        <AnimationLayer>
          <FloatingIcon
            $top="10%"
            $left="15%"
            $size="100px"
            $blur="1px"
            $duration="30s"
          >
            <MedicineBoxOutlined />
          </FloatingIcon>
          <FloatingIcon
            $top="70%"
            $left="10%"
            $size="60px"
            $delay="-5s"
            $duration="25s"
          >
            <HeartOutlined />
          </FloatingIcon>
          <FloatingIcon
            $top="40%"
            $left="75%"
            $size="80px"
            $delay="-12s"
            $duration="35s"
          >
            <SafetyOutlined />
          </FloatingIcon>
          <FloatingIcon
            $top="85%"
            $left="60%"
            $size="120px"
            $blur="2px"
            $delay="-18s"
            $duration="40s"
          >
            <ExperimentOutlined />
          </FloatingIcon>
          <FloatingIcon
            $top="25%"
            $left="65%"
            $size="50px"
            $delay="-8s"
            $duration="22s"
          >
            <GlobalOutlined />
          </FloatingIcon>
        </AnimationLayer>

        <ContentWrap>
          <BrandLine>
            <LogoIcon>
              <MedicineBoxOutlined />
            </LogoIcon>
            <BrandTxt>MedPortal</BrandTxt>
          </BrandLine>

          <BigTitle>
            Smarter care.
            <br />
            <span>Better outcomes.</span>
          </BigTitle>

          <DescriptionText>
            Enterprise-grade management for modern clinicians. A secure portal
            designed for surgical, laboratory, and pharmacy excellence.
          </DescriptionText>

          <FeatureGrid>
            <FeatureItem>
              <div className="head">
                <SafetyOutlined /> Zero-Trust
              </div>
              <div className="body">AES-256 cloud encryption.</div>
            </FeatureItem>
            <FeatureItem>
              <div className="head">
                <ExperimentOutlined /> Clinical
              </div>
              <div className="body">Pathology & surgical workflows.</div>
            </FeatureItem>
            <FeatureItem>
              <div className="head">
                <GlobalOutlined /> Scale
              </div>
              <div className="body">Multi-tenant group architecture.</div>
            </FeatureItem>
            <FeatureItem>
              <div className="head">
                <HeartOutlined /> Human
              </div>
              <div className="body">Built for care teams & patients.</div>
            </FeatureItem>
          </FeatureGrid>
        </ContentWrap>
      </LeftHero>

      {/* ─── Right Side (Light Glass) ─── */}
      <RightForm theme={theme}>
        <InnerForm>
          {isSubdomain && (
            <TenantBanner theme={theme}>
              <SafetyOutlined style={{ color: theme.primary }} />
              <span className="text">{hospitalName} Healthcare Workspace</span>
              <CheckCircleFilled
                style={{ color: theme.status.success, marginLeft: "auto" }}
              />
            </TenantBanner>
          )}

          <WelcomeHeading theme={theme}>Welcome back</WelcomeHeading>
          <WelcomeSubtitle theme={theme}>
            Secure login to your medportal workspace.
          </WelcomeSubtitle>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={clearAuthError}
              style={{
                marginBottom: "2rem",
                borderRadius: "14px",
                padding: "14px",
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
              label={<FormLabel theme={theme}>Professional Email</FormLabel>}
              name="email"
              rules={[
                { required: true, message: "Required" },
                { type: "email", message: "Invalid email" },
              ]}
            >
              <StyledInp
                theme={theme}
                prefix={<UserOutlined style={{ color: theme.text.light }} />}
                placeholder="doctor@hospital.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<FormLabel theme={theme}>Password</FormLabel>}
              name="password"
              rules={[{ required: true, message: "Required" }]}
            >
              <StyledPass
                theme={theme}
                prefix={<LockOutlined style={{ color: theme.text.light }} />}
                placeholder="••••••••"
                size="large"
              />
            </Form.Item>

            <ActionButton
              theme={theme}
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
            >
              Sign In to System
            </ActionButton>
          </Form>

          <SecurityStamp theme={theme}>
            <SafetyOutlined />
            <span>Encrypted Session &middot; MedPortal v3.1</span>
          </SecurityStamp>
        </InnerForm>
      </RightForm>
    </PageRoot>
  );
};

export default LoginPage;
