import React from "react";
import { Button } from "antd";
import styled, { css } from "styled-components";

const StyledButton = styled(Button)`
  display: flex !important;
  align-items: center;
  justify-content: center;
  font-weight: 600 !important;
  transition: all 0.2s ease;
  border-radius: ${props => props.theme.borderRadius.md} !important;
  
  ${props => props.type === "primary" && css`
    background: ${props.theme.primary} !important;
    border: none !important;
    color: #ffffff !important;
    box-shadow: ${props => props.theme.glow};

    &:hover {
      background: ${props.theme.primaryHover} !important;
      transform: translateY(-1px);
      box-shadow: ${props => props.theme.glow};
    }
  `}

  ${props => props.variant === "header" && css`
    height: 38px !important;
    padding: 0 16px !important;
    font-size: 14px !important;
    
    @media (max-width: ${props.theme.breakpoints.sm}) {
      height: 36px !important;
      padding: 0 12px !important;
      font-size: 13px !important;
    }
  `}

  &:active {
    transform: translateY(0);
  }

  /* Handle icon spacing */
  .anticon {
    font-size: 16px;
  }
`;

/**
 * Universal Button component for the entire project.
 * Uses the theme from CustomThemeProvider.
 */
const AppButton = ({ children, icon, onClick, type = "primary", variant = "default", ...props }) => {
  return (
    <StyledButton
      type={type}
      icon={icon}
      onClick={onClick}
      variant={variant}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default AppButton;
