import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";

// ─── Design Tokens ────────────────────────────────────────────────
const colors = {
  primary: "#2563eb",
  secondary: "#1e3a8a",
  background: "#eff6ff",
  white: "#ffffff",
  text: "#334155",
  textLight: "#64748b",
};

// ─── Animations ───────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.05); }
`;

// ─── Global Font ──────────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${colors.white};
    color: ${colors.text};
    -webkit-font-smoothing: antialiased;
  }
`;

// ─── Navbar ───────────────────────────────────────────────────────
const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  height: 72px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
  animation: ${fadeIn} 0.6s ease forwards;
`;

const NavLogo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;

  .logo-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    font-weight: 800;
    font-family: "Sora", sans-serif;
  }

  .logo-text {
    font-family: "Sora", sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: ${colors.secondary};
    letter-spacing: -0.02em;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${colors.textLight};
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: color 0.2s;

  &:hover {
    color: ${colors.primary};
  }
`;

const NavCTA = styled(Link)`
  padding: 10px 22px;
  background: ${colors.primary};
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  font-family: "Sora", sans-serif;
  letter-spacing: 0.01em;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);

  &:hover {
    background: ${colors.secondary};
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    color: white;
  }
`;

// ─── Hero ─────────────────────────────────────────────────────────
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 120px 5% 80px;
  position: relative;
  overflow: hidden;
  background: ${colors.white};
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  .blob-1 {
    position: absolute;
    top: -10%;
    right: -5%;
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      rgba(37, 99, 235, 0.08) 0%,
      transparent 70%
    );
    border-radius: 50%;
    animation: ${pulse} 8s ease-in-out infinite;
  }

  .blob-2 {
    position: absolute;
    bottom: -20%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      rgba(30, 58, 138, 0.06) 0%,
      transparent 70%
    );
    border-radius: 50%;
    animation: ${pulse} 10s ease-in-out infinite reverse;
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 680px;
`;

const HeroPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 8px;
  background: ${colors.background};
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 100px;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${colors.primary};
  margin-bottom: 2rem;
  animation: ${fadeUp} 0.6s 0.1s both;

  .dot {
    width: 20px;
    height: 20px;
    background: ${colors.primary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 10px;
  }
`;

const HeroTitle = styled.h1`
  font-family: "Sora", sans-serif;
  font-size: clamp(2.8rem, 5vw, 4.2rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: ${colors.secondary};
  margin-bottom: 1.5rem;
  animation: ${fadeUp} 0.6s 0.2s both;

  .highlight {
    background: linear-gradient(135deg, ${colors.primary}, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeroSubtext = styled.p`
  font-size: 1.15rem;
  line-height: 1.75;
  color: ${colors.textLight};
  max-width: 520px;
  margin-bottom: 2.5rem;
  font-weight: 300;
  animation: ${fadeUp} 0.6s 0.3s both;
`;

const HeroCTAs = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  animation: ${fadeUp} 0.6s 0.4s both;
`;

const PrimaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
  color: white;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: "Sora", sans-serif;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
  transition: all 0.25s;
  letter-spacing: 0.01em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(37, 99, 235, 0.45);
    color: white;
  }

  .arrow {
    transition: transform 0.2s;
  }

  &:hover .arrow {
    transform: translateX(4px);
  }
`;

const SecondaryBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: transparent;
  color: ${colors.text};
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s;

  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
    background: ${colors.background};
  }
`;

const HeroVisual = styled.div`
  position: absolute;
  right: 5%;
  top: 50%;
  transform: translateY(-50%);
  width: 420px;
  animation:
    ${float} 6s ease-in-out infinite,
    ${fadeIn} 0.8s 0.5s both;

  @media (max-width: 1100px) {
    display: none;
  }
`;

const HeroCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);

  &.main {
    margin-bottom: 1rem;
  }

  &.stat-row {
    display: flex;
    gap: 1rem;
  }
`;

const StatBox = styled.div`
  flex: 1;
  background: ${(p) => p.bg || colors.background};
  border-radius: 12px;
  padding: 1rem;
  text-align: center;

  .num {
    font-family: "Sora", sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: ${(p) => p.color || colors.primary};
  }

  .lbl {
    font-size: 0.72rem;
    color: ${colors.textLight};
    margin-top: 2px;
    font-weight: 500;
  }
`;

const PatientRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      ${(p) => p.c1 || "#2563eb"},
      ${(p) => p.c2 || "#1e3a8a"}
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: 700;
    font-family: "Sora", sans-serif;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
  }

  .name {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${colors.text};
  }

  .sub {
    font-size: 0.72rem;
    color: ${colors.textLight};
  }

  .badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    background: ${(p) => p.badgeBg || "#dbeafe"};
    color: ${(p) => p.badgeColor || colors.primary};
  }
`;

// ─── Stats Bar ────────────────────────────────────────────────────
const StatsBar = styled.section`
  padding: 3rem 5%;
  background: ${colors.secondary};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  text-align: center;
  animation: ${fadeUp} 0.6s both;
  animation-delay: ${(p) => p.delay || "0s"};

  .num {
    font-family: "Sora", sans-serif;
    font-size: 2.2rem;
    font-weight: 800;
    color: white;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, white, #93c5fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .lbl {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
    font-weight: 400;
  }
`;

// ─── Features ─────────────────────────────────────────────────────
const FeaturesSection = styled.section`
  padding: 100px 5%;
  background: ${colors.white};
`;

const SectionLabel = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.primary};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  animation: ${fadeUp} 0.6s both;
`;

const SectionTitle = styled.h2`
  font-family: "Sora", sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  color: ${colors.secondary};
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 1rem;
  max-width: 560px;
  animation: ${fadeUp} 0.6s 0.1s both;
`;

const SectionSubtext = styled.p`
  font-size: 1rem;
  color: ${colors.textLight};
  line-height: 1.7;
  max-width: 480px;
  font-weight: 300;
  margin-bottom: 4rem;
  animation: ${fadeUp} 0.6s 0.2s both;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  padding: 2rem;
  background: ${colors.white};
  border: 1px solid #e8eef6;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  animation: ${fadeUp} 0.6s both;
  animation-delay: ${(p) => p.delay || "0s"};
  cursor: default;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${colors.primary}, #60a5fa);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    border-color: rgba(37, 99, 235, 0.2);
    box-shadow: 0 16px 48px rgba(37, 99, 235, 0.1);
    transform: translateY(-4px);

    &::before {
      opacity: 1;
    }
  }

  .icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: ${colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    font-size: 24px;
    transition: transform 0.3s;
  }

  &:hover .icon-wrap {
    transform: scale(1.1);
  }

  .title {
    font-family: "Sora", sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${colors.secondary};
    margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }

  .desc {
    font-size: 0.9rem;
    color: ${colors.textLight};
    line-height: 1.7;
    font-weight: 300;
  }

  .tag {
    display: inline-block;
    margin-top: 1.25rem;
    padding: 4px 12px;
    background: ${colors.background};
    color: ${colors.primary};
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
`;

// ─── Trust Section ────────────────────────────────────────────────
const TrustSection = styled.section`
  padding: 80px 5%;
  background: ${colors.background};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(
      circle,
      rgba(37, 99, 235, 0.06) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

const TrustTitle = styled.p`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${colors.textLight};
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 3rem;
`;

const TrustLogos = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
  margin-bottom: 4rem;
`;

const TrustLogo = styled.div`
  font-family: "Sora", sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #cbd5e1;
  letter-spacing: -0.02em;
  transition: color 0.2s;

  &:hover {
    color: ${colors.primary};
  }
`;

const TrustStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 700px;
  margin: 0 auto;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const TrustStatItem = styled.div`
  .num {
    font-family: "Sora", sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: ${colors.secondary};
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .lbl {
    font-size: 0.85rem;
    color: ${colors.textLight};
    margin-top: 4px;
    font-weight: 400;
  }
`;

// ─── CTA Section ─────────────────────────────────────────────────
const CTASection = styled.section`
  padding: 100px 5%;
  background: linear-gradient(135deg, ${colors.secondary} 0%, #1e40af 100%);
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -40%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 70%
    );
    border-radius: 50%;
  }
`;

const CTATitle = styled.h2`
  font-family: "Sora", sans-serif;
  font-size: clamp(1.8rem, 3.5vw, 3rem);
  font-weight: 800;
  color: white;
  letter-spacing: -0.04em;
  line-height: 1.2;
  margin-bottom: 1.25rem;
`;

const CTASubtext = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.65);
  max-width: 460px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
  font-weight: 300;
`;

const CTABtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: white;
  color: ${colors.secondary};
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  font-family: "Sora", sans-serif;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.25s;
  letter-spacing: 0.01em;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
    color: ${colors.secondary};
  }
`;

// ─── Footer ───────────────────────────────────────────────────────
const Footer = styled.footer`
  background: #0f172a;
  padding: 4rem 5% 2rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FooterBrand = styled.div`
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1rem;
    text-decoration: none;

    .icon {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, ${colors.primary}, #60a5fa);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      font-weight: 800;
      font-family: "Sora", sans-serif;
    }

    .name {
      font-family: "Sora", sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
    }
  }

  .desc {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.7;
    max-width: 260px;
    font-weight: 300;
  }
`;

const FooterCol = styled.div`
  .heading {
    font-family: "Sora", sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  a {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    transition: color 0.2s;
    font-weight: 300;

    &:hover {
      color: white;
    }
  }
`;

const FooterBottom = styled.div`
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  p {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 300;
  }

  .socials {
    display: flex;
    gap: 1rem;

    a {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.07);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.4);
      text-decoration: none;
      font-size: 0.8rem;
      transition: all 0.2s;

      &:hover {
        background: ${colors.primary};
        color: white;
      }
    }
  }
`;

// ─── Component ────────────────────────────────────────────────────
const LandingPage = () => {
  const features = [
    {
      icon: "🏥",
      title: "Seamless Tenant Isolation",
      desc: "Each hospital operates on its own subdomain with fully isolated data, users, and configurations. Powered by subdomain-based architecture that scales effortlessly.",
      tag: "Multi-Tenant Architecture",
      delay: "0.1s",
    },
    {
      icon: "🩺",
      title: "Clinical Precision",
      desc: "End-to-end appointment scheduling, patient records management, and clinical workflow automation — built for the pace of modern healthcare.",
      tag: "Operational Excellence",
      delay: "0.2s",
    },
    {
      icon: "🔐",
      title: "Enterprise Security",
      desc: "HIPAA-aligned encryption, JWT authentication with HttpOnly refresh tokens, CSRF protection, and role-based access control at every layer.",
      tag: "HIPAA Compliant",
      delay: "0.3s",
    },
  ];

  const trustLogos = [
    "Apollo Health",
    "Medanta",
    "Fortis Care",
    "AIIMS Network",
    "Cloudnine",
    "Max Healthcare",
  ];

  return (
    <>
      <GlobalStyle />

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <Nav>
        <NavLogo to="/">
          <div className="logo-icon">M</div>
          <span className="logo-text">MedPortal</span>
        </NavLogo>

        <NavLinks>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#about">About</NavLink>
        </NavLinks>

        <NavCTA to="/login">Sign In →</NavCTA>
      </Nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroSection>
        <HeroBg>
          <div className="grid" />
          <div className="blob-1" />
          <div className="blob-2" />
        </HeroBg>

        <HeroContent>
          <HeroPill>
            <div className="dot">✦</div>
            Trusted by 500+ Healthcare Facilities
          </HeroPill>

          <HeroTitle>
            The Operating System
            <br />
            for <span className="highlight">Modern Care</span>
          </HeroTitle>

          <HeroSubtext>
            A secure, multi-tenant platform that gives every hospital its own
            digital backbone — from patient records to clinical operations, all
            in one place.
          </HeroSubtext>

          <HeroCTAs>
            <PrimaryBtn to="/login">
              Get Started Free
              <span className="arrow">→</span>
            </PrimaryBtn>
            <SecondaryBtn href="#features">▶ See how it works</SecondaryBtn>
          </HeroCTAs>
        </HeroContent>

        {/* Floating dashboard preview */}
        <HeroVisual>
          <HeroCard className="main">
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: colors.textLight,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Today's Appointments
            </div>
            {[
              {
                init: "JS",
                name: "John Smith",
                sub: "Cardiology · 09:00 AM",
                c1: "#2563eb",
                c2: "#1e3a8a",
                badge: "Confirmed",
                bb: "#dbeafe",
                bc: "#2563eb",
              },
              {
                init: "AR",
                name: "Aisha Rahman",
                sub: "Neurology · 10:30 AM",
                c1: "#7c3aed",
                c2: "#4c1d95",
                badge: "In Progress",
                bb: "#ede9fe",
                bc: "#7c3aed",
              },
              {
                init: "MC",
                name: "Maria Chen",
                sub: "Pediatrics · 11:00 AM",
                c1: "#059669",
                c2: "#064e3b",
                badge: "Waiting",
                bb: "#d1fae5",
                bc: "#059669",
              },
            ].map((p) => (
              <PatientRow
                key={p.name}
                c1={p.c1}
                c2={p.c2}
                badgeBg={p.bb}
                badgeColor={p.bc}
              >
                <div className="avatar">{p.init}</div>
                <div className="info">
                  <div className="name">{p.name}</div>
                  <div className="sub">{p.sub}</div>
                </div>
                <div className="badge">{p.badge}</div>
              </PatientRow>
            ))}
          </HeroCard>

          <HeroCard className="stat-row">
            <StatBox bg="#dbeafe" color={colors.primary}>
              <div className="num">248</div>
              <div className="lbl">Patients Today</div>
            </StatBox>
            <StatBox bg="#d1fae5" color="#059669">
              <div className="num">98%</div>
              <div className="lbl">Satisfaction</div>
            </StatBox>
            <StatBox bg="#ede9fe" color="#7c3aed">
              <div className="num">12</div>
              <div className="lbl">Departments</div>
            </StatBox>
          </HeroCard>
        </HeroVisual>
      </HeroSection>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <StatsBar>
        {[
          { num: "500+", lbl: "Hospitals Onboarded", delay: "0s" },
          { num: "2.4M", lbl: "Patient Records Managed", delay: "0.1s" },
          { num: "99.9%", lbl: "Uptime SLA", delay: "0.2s" },
          { num: "HIPAA", lbl: "Certified & Compliant", delay: "0.3s" },
        ].map((s) => (
          <StatItem key={s.lbl} delay={s.delay}>
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </StatItem>
        ))}
      </StatsBar>

      {/* ── Features ───────────────────────────────────────────── */}
      <FeaturesSection id="features">
        <SectionLabel>Platform Capabilities</SectionLabel>
        <SectionTitle>
          Everything a hospital needs to run at full capacity
        </SectionTitle>
        <SectionSubtext>
          From isolated tenant environments to clinical precision tools,
          MedPortal is engineered for the demands of enterprise healthcare.
        </SectionSubtext>

        <FeaturesGrid>
          {features.map((f) => (
            <FeatureCard key={f.title} delay={f.delay}>
              <div className="icon-wrap">{f.icon}</div>
              <div className="title">{f.title}</div>
              <div className="desc">{f.desc}</div>
              <div className="tag">{f.tag}</div>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>

      {/* ── Trust ──────────────────────────────────────────────── */}
      <TrustSection>
        <TrustTitle>
          Used by leading hospitals and healthcare networks
        </TrustTitle>

        <TrustLogos>
          {trustLogos.map((logo) => (
            <TrustLogo key={logo}>{logo}</TrustLogo>
          ))}
        </TrustLogos>

        <TrustStats>
          {[
            { num: "4.9/5", lbl: "Average Rating" },
            { num: "< 2min", lbl: "Avg. Onboarding Time" },
            { num: "24/7", lbl: "Clinical Support" },
          ].map((s) => (
            <TrustStatItem key={s.lbl}>
              <div className="num">{s.num}</div>
              <div className="lbl">{s.lbl}</div>
            </TrustStatItem>
          ))}
        </TrustStats>
      </TrustSection>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <CTASection>
        <CTATitle>
          Ready to modernise
          <br />
          your hospital?
        </CTATitle>
        <CTASubtext>
          Join 500+ healthcare facilities already running on MedPortal. Setup
          takes less than 2 minutes.
        </CTASubtext>
        <CTABtn to="/login">Start Your Free Trial →</CTABtn>
      </CTASection>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Footer>
        <FooterGrid>
          <FooterBrand>
            <Link to="/" className="logo" style={{ textDecoration: "none" }}>
              <div className="icon">M</div>
              <span className="name">MedPortal</span>
            </Link>
            <p className="desc">
              The operating system for modern healthcare. Secure, scalable, and
              built for clinical excellence.
            </p>
          </FooterBrand>

          <FooterCol>
            <div className="heading">Product</div>
            <ul>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#about">Security</a>
              </li>
              <li>
                <a href="#about">Changelog</a>
              </li>
            </ul>
          </FooterCol>

          <FooterCol>
            <div className="heading">Company</div>
            <ul>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#about">Careers</a>
              </li>
              <li>
                <a href="#about">Blog</a>
              </li>
              <li>
                <a href="#about">Contact</a>
              </li>
            </ul>
          </FooterCol>

          <FooterCol>
            <div className="heading">Legal</div>
            <ul>
              <li>
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms">Terms of Service</a>
              </li>
              <li>
                <a href="#hipaa">HIPAA Compliance</a>
              </li>
              <li>
                <a href="#cookies">Cookie Policy</a>
              </li>
            </ul>
          </FooterCol>
        </FooterGrid>

        <FooterBottom>
          <p>© {new Date().getFullYear()} MedPortal. All rights reserved.</p>
          <div className="socials">
            <a href="#twitter" title="Twitter">
              𝕏
            </a>
            <a href="#linkedin" title="LinkedIn">
              in
            </a>
            <a href="#github" title="GitHub">
              ⌥
            </a>
          </div>
        </FooterBottom>
      </Footer>
    </>
  );
};

export default LandingPage;
