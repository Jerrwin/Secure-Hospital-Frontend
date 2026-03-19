import React from 'react';
import { Result } from 'antd';

const AppointmentList = () => {
  return (
    <div style={{ padding: '40px', background: '#fff', borderRadius: '12px', minHeight: '70vh' }}>
      <Result
        status="info"
        title="Appointments Module"
        subTitle="This page is under construction. Please use the dashboard to see upcoming appointments."
      />
    </div>
  );
};

export default AppointmentList;
