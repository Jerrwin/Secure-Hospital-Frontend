import React from 'react';
import { Card, Typography, Space } from 'antd';
import styled from 'styled-components';
import { useTheme } from '../../../context/ThemeContext';

const { Text, Title } = Typography;

const StyledCard = styled(Card)`
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.border};
  box-shadow: ${props => props.theme.shadow};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: ${props => props.theme.background.card};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.glow};
  }

  .ant-card-body {
    padding: 20px 24px;
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${(p) => p.$color ? `${p.$color}15` : p.theme.primaryLight};
  color: ${(p) => p.$color || p.theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatWidget = ({ title, value, icon, trend, color }) => {
  const { theme } = useTheme();
  return (
    <StyledCard variant="borderless">
      <Space align="start" size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Text style={{ color: theme.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>
            {title}
          </Text>
          <Title level={2} style={{ color: color || theme.secondary, margin: '8px 0 0 0', fontWeight: 700 }}>
            {value !== undefined && value !== null ? value : '-'}
          </Title>
          {trend && (
            <Text style={{ color: trend >= 0 ? theme.status.success : theme.status.error, fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </Text>
          )}
        </div>
        <IconWrapper $color={color}>
          {icon}
        </IconWrapper>
      </Space>
    </StyledCard>
  );
};

export default StatWidget;