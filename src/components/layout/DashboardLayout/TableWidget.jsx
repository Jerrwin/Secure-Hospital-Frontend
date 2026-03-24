import React from "react";
import { Card, Table, Typography } from "antd";
import styled from "styled-components";
import { useTheme } from "../../../context/ThemeContext";

const { Title } = Typography;

const StyledCard = styled(Card)`
  border-radius: ${(props) => props.theme.borderRadius.md};
  border: 1px solid ${(props) => props.theme.border};
  box-shadow: ${(props) => props.theme.shadow};
  background: ${(props) => props.theme.background.card};
  margin-top: 24px;

  .ant-card-head {
    border-bottom: 1px solid ${(props) => props.theme.border};
    padding: 0 24px;
  }

  .ant-card-body {
    padding: 0; /* Remove padding so the table touches the edges */
  }

  .ant-table-thead > tr > th {
    background: ${(props) => props.theme.primaryLight};
    color: ${(props) => props.theme.secondary};
    font-weight: 600;
    border-bottom: 1px solid ${(props) => props.theme.border};
  }
`;

const TableWidget = ({
  title,
  columns,
  dataSource,
  loading,
  rowKey = "id",
  pagination,
}) => {
  const { theme } = useTheme();
  return (
    <StyledCard
      title={
        <Title level={4} style={{ margin: 0, color: theme.secondary }}>
          {title}
        </Title>
      }
      variant="borderless"
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination ?? { pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />
    </StyledCard>
  );
};

export default TableWidget;
