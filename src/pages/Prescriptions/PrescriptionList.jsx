import React from 'react';
import { Result } from 'antd';
import DashboardLayout from '../../components/layout/DashboardLayout/DashboardLayout';
import useAuth from '../../modules/auth/hooks/useAuth';

const PrescriptionList = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout user={user} currentPath="/prescriptions">
      <div style={{ padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '70vh' }}>
        <Result
          status="info"
          title="Prescriptions Management"
          subTitle="This page is under construction. You can view pending prescriptions on your dashboard."
        />
      </div>
    </DashboardLayout>
  );
};

export default PrescriptionList;
