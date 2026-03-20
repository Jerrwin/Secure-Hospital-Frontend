import React, { useState } from "react";
import styled from "styled-components";
import { Tabs } from "antd";
import { 
  FileTextOutlined, 
  HourglassOutlined, 
  CheckCircleOutlined,
  DollarOutlined 
} from "@ant-design/icons";
import CreateInvoiceTab from "./tabs/CreateInvoiceTab";
import PendingPaymentsTab from "./tabs/PendingPaymentsTab";
import CompletedPaymentsTab from "./tabs/CompletedPaymentsTab";

const Container = styled.div`
  padding: clamp(12px, 3vw, 24px);
  background: #ffffff;
  min-height: calc(100vh - 64px);
`;

const Header = styled.div`
  margin-bottom: 24px;
  h1 {
    color: #1a3353;
    font-size: clamp(20px, 4vw, 24px);
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    color: #64748b;
    font-size: clamp(13px, 2.5vw, 14px);
  }
  
  @media (max-width: 576px) {
    margin-bottom: 16px;
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 32px !important;
    &::before {
      display: none;
    }
  }

  .ant-tabs-tab {
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    margin: 0 8px 0 0 !important;

    &:hover {
      border-color: #1e3a8a !important;
      color: #1e3a8a !important;
    }

    .ant-tabs-tab-btn {
      color: #475569 !important;
      font-weight: 500 !important;
    }
  }

  .ant-tabs-tab-active {
    background: #1e293b !important;
    border-color: #1e293b !important;

    .ant-tabs-tab-btn {
      color: #ffffff !important;
    }
  }

  .ant-tabs-ink-bar {
    display: none !important;
  }

  .ant-tabs-content-holder {
    background: white;
    padding: clamp(12px, 4vw, 24px);
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 576px) {
    .ant-tabs-nav {
      margin-bottom: 16px !important;
    }
    .ant-tabs-tab {
      padding: 6px 10px !important;
      margin-right: 4px !important;
      .ant-tabs-tab-btn {
        font-size: 12px;
      }
    }
  }
`;

const InvoicePage = () => {
  const [activeKey, setActiveKey] = useState("1");

  const tabItems = [
    {
      key: "1",
      label: (
        <span>
          <FileTextOutlined /> Payment Create
        </span>
      ),
      children: <CreateInvoiceTab setActiveKey={setActiveKey} />,
    },
    {
      key: "2",
      label: (
        <span>
          <HourglassOutlined /> Pending Payments
        </span>
      ),
      children: <PendingPaymentsTab setActiveKey={setActiveKey} />,
    },
    {
      key: "3",
      label: (
        <span>
          <CheckCircleOutlined /> Completed Payments
        </span>
      ),
      children: <CompletedPaymentsTab />,
    },
  ];

  return (
    <Container>
      <Header>
        <h1><DollarOutlined style={{ color: '#1677ff' }} /> Billing & Payments</h1>
        <p>Manage patient invoices and record transactions</p>
      </Header>

      <StyledTabs 
        activeKey={activeKey} 
        onChange={setActiveKey}
        items={tabItems} 
      />
    </Container>
  );
};

export default InvoicePage;
