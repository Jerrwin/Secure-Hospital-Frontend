import React from 'react';
import { Result } from 'antd';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import useAuth from '../../modules/auth/hooks/useAuth';

const PatientList = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout user={user} currentPath="/patients">
      <div style={{ padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '70vh' }}>
        <Result
          status="info"
          title="Patients Management"
          subTitle="This page is under construction. View patient summaries on your unified dashboard."
        />
      </div>
    </DashboardLayout>
  );
};

export default PatientList;
