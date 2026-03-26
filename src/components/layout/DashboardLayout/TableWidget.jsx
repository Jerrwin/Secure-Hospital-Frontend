import React from "react";
import { Table, Typography } from "antd";
import styled, { keyframes } from "styled-components";
import { useTheme } from "../../../context/ThemeContext";
import { InboxOutlined } from "@ant-design/icons";

const { Title } = Typography;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.div`
  border-radius: ${(p) => p.theme.borderRadius.xl};
  border: 1px solid ${(p) => p.theme.border};
  box-shadow: ${(p) => p.theme.shadow};
  background: ${(p) => p.theme.background.card};
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease both;
  margin-top: 24px;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: ${(p) => p.theme.background.header};
  border-bottom: 1px solid ${(p) => p.theme.border};
`;

const StyledTable = styled(Table)`
  .ant-table {
    background: transparent;
  }
  .ant-table-thead > tr > th {
    background: ${(p) => p.$theme.primaryLight} !important;
    color: ${(p) => p.$theme.secondary} !important;
    font-weight: 700;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid ${(p) => p.$theme.border} !important;
    padding: 12px 16px;
  }
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${(p) => p.$theme.border}44;
    padding: 13px 16px;
    color: ${(p) => p.$theme.text.primary};
    font-size: 0.875rem;
  }
  .ant-table-tbody > tr:hover > td {
    background: ${(p) => p.$theme.primaryLight} !important;
  }
  .ant-table-tbody > tr:last-child > td {
    border-bottom: none;
  }
  .ant-pagination {
    padding: 12px 16px;
    margin: 0 !important;
  }
  .ant-pagination-item-active {
    background: ${(p) => p.$theme.primary} !important;
    border-color: ${(p) => p.$theme.primary} !important;
    a {
      color: #fff !important;
    }
  }
`;

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
  color: ${(p) => p.theme.text.light};

  .icon {
    font-size: 2.5rem;
    opacity: 0.35;
    color: ${(p) => p.theme.primary};
  }
  p {
    margin: 0;
    font-size: 0.9rem;
    color: ${(p) => p.theme.text.secondary};
  }
`;

const TableWidget = ({
  title,
  columns,
  dataSource,
  loading,
  rowKey = "id",
  pagination,
  extra,
  emptyText = "No records found",
}) => {
  const { theme } = useTheme();

  const emptyState = (
    <EmptyWrap theme={theme}>
      <InboxOutlined className="icon" />
      <p>{emptyText}</p>
    </EmptyWrap>
  );

  return (
    <Wrap theme={theme}>
      <CardHead theme={theme}>
        <Title level={5} style={{ margin: 0, color: theme.secondary }}>
          {title}
        </Title>
        {extra && <div>{extra}</div>}
      </CardHead>
      <StyledTable
        $theme={theme}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination ?? { pageSize: 5, size: "small" }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: emptyState }}
      />
    </Wrap>
  );
};

export default React.memo(TableWidget);
