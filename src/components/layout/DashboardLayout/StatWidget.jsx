import React from 'react';
import { Card, Typography, Space } from 'antd';
import styled from 'styled-components';

const { Text, Title } = Typography;

const StyledCard = styled(Card)`
  border-radius: 12px;
  border: 1px solid #eff6ff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: #ffffff;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.1);
  }

  .ant-card-body {
    padding: 20px 24px;
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatWidget = ({ title, value, icon, trend }) => {
  return (
    <StyledCard variant="borderless">
      <Space align="start" size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Text style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
            {title}
          </Text>
          <Title level={2} style={{ color: '#1e3a8a', margin: '8px 0 0 0', fontWeight: 700 }}>
            {value !== undefined && value !== null ? value : '-'}
          </Title>
          {trend && (
            <Text style={{ color: trend >= 0 ? '#10b981' : '#ef4444', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </Text>
          )}
        </div>
        <IconWrapper>
          {icon}
        </IconWrapper>
      </Space>
    </StyledCard>
  );
};

export default StatWidget;