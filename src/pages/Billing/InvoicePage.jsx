import React, { useState } from "react";
import styled from "styled-components";
import useAuth from "../../modules/auth/hooks/useAuth";
import {
  FileTextOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  BankOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Tabs, Input } from "antd";
import CreateInvoiceTab from "./tabs/CreateInvoiceTab";
import BillingList from "./components/BillingList";
import { useTheme } from "../../context/ThemeContext";
import { usePrefetchPagination } from "../../hooks/usePrefetchPagination";
import {
  fetchPagedRequest,
  prefetchRequest,
  setPage,
  setSearch,
  setStatus,
} from "../../modules/billing/billingSlice";

const { Search } = Input;

const bp = {
  xs: "480px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
};

const Container = styled.div`
  padding: 0;
  flex: 1;
`;

const HeaderCard = styled.div`
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
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

  .ant-tabs-nav {
    margin-bottom: 0px !important;
    background: transparent;
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

const ContentCard = styled.div`
  background: white;
  padding: clamp(12px, 4vw, 24px);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-top: 16px;

  .ant-table-pagination {
    justify-content: center !important;
    padding-top: 16px;
  }

  .ant-pagination-item-active {
    border-color: transparent !important;
    background-color: transparent !important;
  }
  .ant-pagination-item-active:hover {
    border-color: transparent !important;
  }
`;

const paginationActions = {
  fetchPagedRequest,
  prefetchRequest,
  setPage,
  setSearch,
  setStatus,
};

const InvoicePage = () => {
  const { theme } = useTheme();
  const { userRole } = useAuth();
  const isPatient = userRole === "PATIENT";

  // Prefetch Pagination Hook
  const {
    list,
    pagination,
    loading,
    actions: pagedActions,
    statusFilter,
  } = usePrefetchPagination({
    selector: (state) => state.billing,
    actions: paginationActions,
    initialStatus: isPatient ? "pending" : "unbilled",
  });

  // Map tab keys to API status values
  const handleTabChange = (key) => {
    const statusMap = {
      create: "unbilled",
      pending: "pending",
      completed: "paid",
    };
    if (statusMap[key]) {
      pagedActions.setStatus(statusMap[key]);
    }
  };

  // Derive active tab from statusFilter
  const activeTabKey = (statusFilter === "unbilled")
      ? "create"
      : (statusFilter === "paid" ? "completed" : "pending");

  const tabItems = [
    ...(isPatient
      ? []
      : [
          {
            key: "create",
            label: (
              <span>
                <FileTextOutlined /> Payment Create
              </span>
            ),
          },
        ]),
    {
      key: "pending",
      label: (
        <span>
          <HourglassOutlined />{" "}
          {isPatient ? "My Pending Bills" : "Pending Payments"}
        </span>
      ),
    },
    {
      key: "completed",
      label: (
        <span>
          <CheckCircleOutlined />{" "}
          {isPatient ? "My Payment History" : "Completed Payments"}
        </span>
      ),
    },
  ];

  return (
    <Container>
      <HeaderCard>
        <HeaderRow>
          <HeaderLeft>
            <TitleIcon>
              <BankOutlined style={{ fontSize: 22, color: theme.primary }} />
            </TitleIcon>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <PageTitle>Billing & Payments</PageTitle>
              <span
                style={{ fontSize: "12px", color: "#64748b", fontWeight: 400 }}
              >
                Manage patient invoices and transactions
              </span>
            </div>
          </HeaderLeft>
          {activeTabKey !== "create" && (
            <div style={{ minWidth: "250px", flex: "0 1 auto" }}>
              <Search
                placeholder="Search patient or invoice..."
                allowClear
                onChange={(e) => pagedActions.setSearch(e.target.value)}
                style={{ width: "100%" }}
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              />
            </div>
          )}
        </HeaderRow>
      </HeaderCard>

      <StyledTabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        items={tabItems}
      />

      <ContentCard>
        {statusFilter === "unbilled" ? (
          <CreateInvoiceTab 
            setActiveKey={(key) => handleTabChange(key)} 
            completedAppointments={list}
            pagination={pagination}
            pagedActions={pagedActions}
            loading={loading}
          />
        ) : (
          <BillingList
            statusFilter={statusFilter}
            list={list}
            pagination={pagination}
            loading={loading}
            pagedActions={pagedActions}
          />
        )}
      </ContentCard>
    </Container>
  );
};

export default React.memo(InvoicePage);
