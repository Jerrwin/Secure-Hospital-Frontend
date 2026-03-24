import React from "react";
import { Typography } from "antd";
import styled, { keyframes } from "styled-components";
import { useTheme } from "../../../context/ThemeContext";

const { Text } = Typography;

const shimmer = keyframes`
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(300%) rotate(45deg); }
`;

const floatUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;



const CardWrap = styled.div`
  position: relative;
  border-radius: ${(p) => p.theme.borderRadius.xl};
  border: 1px solid ${(p) => p.theme.border};
  background: ${(p) => p.theme.background.card};
  box-shadow: ${(p) => p.theme.shadow};
  padding: 24px;
  overflow: hidden;
  cursor: default;
  animation: ${floatUp} 0.45s ease both;
  animation-delay: ${(p) => p.$delay || "0s"};
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${(p) => p.theme.glow};
  }

  /* Shimmer sweep on hover */
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 30%;
    height: 200%;
    background: linear-gradient(
      105deg,
      transparent 40%,
      ${(p) => p.$accentColor}18 50%,
      transparent 60%
    );
    transform: translateX(-100%) rotate(45deg);
    transition: none;
  }
  &:hover::before {
    animation: ${shimmer} 0.6s ease forwards;
  }

  /* Accent bar on the left */
  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(
      180deg,
      ${(p) => p.$accentColor},
      ${(p) => p.$accentColor}55
    );
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const IconBox = styled.div`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: ${(p) => p.theme.borderRadius.lg};
  background: linear-gradient(
    135deg,
    ${(p) => p.$color}22,
    ${(p) => p.$color}0a
  );
  border: 1px solid ${(p) => p.$color}33;
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition: transform 0.2s ease;

  ${CardWrap}:hover & {
    transform: scale(1.1) rotate(-4deg);
  }
`;

const Label = styled(Text)`
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${(p) => p.theme.text.secondary} !important;
  font-family: ${(p) => p.theme.headingFont || "inherit"} !important;
  display: block;
  margin-bottom: 6px;
`;

const ValueText = styled.div`
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: ${(p) => p.$color || p.theme.secondary};
  font-family: ${(p) => p.theme.headingFont || "inherit"};
  letter-spacing: -0.02em;
  margin-top: 2px;
`;

const TrendBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: ${(p) =>
    p.$positive ? p.theme.status.success + "18" : p.theme.status.error + "18"};
  color: ${(p) =>
    p.$positive ? p.theme.status.success : p.theme.status.error};
`;

const BgPattern = styled.div`
  position: absolute;
  right: -16px;
  bottom: -16px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, ${(p) => p.$color}0f 0%, transparent 70%);
  pointer-events: none;
`;

const StatWidget = ({ title, value, icon, trend, color, delay }) => {
  const { theme } = useTheme();
  const accentColor = color || theme.primary;
  const safeValue = value !== undefined && value !== null ? value : "—";

  return (
    <CardWrap theme={theme} $accentColor={accentColor} $delay={delay}>
      <BgPattern theme={theme} $color={accentColor} />
      <TopRow>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Label theme={theme}>{title}</Label>
          <ValueText theme={theme} $color={accentColor}>
            {safeValue}
          </ValueText>
          {trend !== undefined && trend !== null && (
            <TrendBadge theme={theme} $positive={trend >= 0}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              <span style={{ fontWeight: 400, opacity: 0.75 }}>
                vs last month
              </span>
            </TrendBadge>
          )}
        </div>
        <IconBox theme={theme} $color={accentColor}>
          {icon}
        </IconBox>
      </TopRow>
    </CardWrap>
  );
};

export default React.memo(StatWidget);
