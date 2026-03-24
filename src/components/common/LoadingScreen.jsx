import React from "react";
import { Spin } from "antd";
import styled from "styled-components";

/**
 * A reusable, theme-aware loading screen/element.
 * Can be used for full-page loading or nested within a container.
 */
const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: ${props => (props.$fullPage ? "100vh" : "100%")};
  min-height: ${props => (props.$fullPage ? "100vh" : "200px")};
  background: ${props => props.theme.background.main};
  transition: background 0.3s ease;
`;

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: ${props => props.theme.primary} !important;
  }
  .ant-spin-text {
    color: ${props => props.theme.primary} !important;
    font-weight: 500;
    margin-top: 12px;
  }
`;

const LoadingScreen = ({ label = "Loading...", fullPage = false }) => {
  return (
    <LoaderWrapper $fullPage={fullPage}>
      <StyledSpin size="large" tip={label} />
    </LoaderWrapper>
  );
};

export default LoadingScreen;
