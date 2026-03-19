import React from 'react';
import { Result } from 'antd';

const PrescriptionList = () => {
  return (
    <div style={{ padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '70vh' }}>
      <Result
        status="info"
        title="Prescriptions Management"
        subTitle="This page is under construction. You can view pending prescriptions on your dashboard."
      />
    </div>
  );
};

export default PrescriptionList;
