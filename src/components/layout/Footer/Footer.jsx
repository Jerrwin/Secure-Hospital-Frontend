import React from "react";
import { Layout, Typography } from "antd";
import styled from "styled-components";

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const StyledFooter = styled(AntFooter)`
  text-align: center;
  background: transparent;
  padding: 16px 16px 0px 16px;
  color: ${props => props.theme.text.primary};

  @media (max-width: 576px) {
    padding: 16px 0px 0px 0px;
  }
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <StyledFooter>
      <Text style={{ color: "inherit", opacity: 0.6, fontSize: "0.85rem" }}>
        © {currentYear} MedPortal Enterprise System. All rights reserved.
      </Text>
    </StyledFooter>
  );
};

export default Footer;
