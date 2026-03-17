import React from 'react';
import { Result } from 'antd';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import useAuth from '../../modules/auth/hooks/useAuth';

const AppointmentList = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout user={user} currentPath="/appointments">
      <div style={{ padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '70vh' }}>
        <Result
          status="info"
          title="Appointments Module"
          subTitle="This page is under construction. Please use the dashboard to see upcoming appointments."
        />
      </div>
    </DashboardLayout>
  );
};

export default AppointmentList;
