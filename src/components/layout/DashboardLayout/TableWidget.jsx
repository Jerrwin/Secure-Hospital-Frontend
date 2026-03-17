import React from 'react';
import { Card, Table, Typography } from 'antd';
import styled from 'styled-components';

const { Title } = Typography;

const StyledCard = styled(Card)`
  border-radius: 12px;
  border: 1px solid #eff6ff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
  background: #ffffff;
  margin-top: 24px;

  .ant-card-head {
    border-bottom: 1px solid #eff6ff;
    padding: 0 24px;
  }

  .ant-card-body {
    padding: 0; /* Remove padding so the table touches the edges */
  }

  .ant-table-thead > tr > th {
    background: #eff6ff;
    color: #1e3a8a;
    font-weight: 600;
    border-bottom: 1px solid #bfdbfe;
  }
`;

const TableWidget = ({ title, columns, dataSource, loading, rowKey = 'id' }) => {
  return (
    <StyledCard 
      title={<Title level={4} style={{ margin: 0, color: '#1e3a8a' }}>{title}</Title>}
      variant="borderless"
    >
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        loading={loading}
        rowKey={rowKey}
        pagination={{ pageSize: 5, placement: 'bottomCenter' }}
        scroll={{ x: 'max-content' }}
      />
    </StyledCard>
  );
};

export default TableWidget;