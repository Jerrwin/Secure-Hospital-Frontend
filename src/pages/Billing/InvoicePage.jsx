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

const bp = {
  xs: "480px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
};

const Container = styled.div`
  padding: 0;
  background: #eff6ff;
  min-height: calc(100vh - 64px);
`;

const HeaderCard = styled.div`
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
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

  @media (min-width: ${bp.lg}) {
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
  background: #e8f0fe;
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
  color: #1e3a5f;
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
      <HeaderCard>
        <HeaderRow>
          <HeaderLeft>
            <TitleIcon>
              <DollarOutlined style={{ fontSize: 20, color: "#1677ff" }} />
            </TitleIcon>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <PageTitle>Billing & Payments</PageTitle>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>Manage patient invoices and transactions</span>
            </div>
          </HeaderLeft>
        </HeaderRow>
      </HeaderCard>

      <div style={{ padding: '0 4px' }}>
        <StyledTabs 
          activeKey={activeKey} 
          onChange={setActiveKey}
          items={tabItems} 
        />
      </div>
    </Container>
  );
};

export default InvoicePage;
