import React from "react";
import { Result, Button } from "antd";
import styled from "styled-components";

const Container = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
`;

const HospitalNotFound = () => {
  return (
    <Container>
      <Result
        status="404"
        title="Hospital Workspace Not Found"
        subTitle="The workspace you are looking for does not exist or has been deactivated. Please check the URL and try again."
        extra={
          <Button type="primary" href="http://localhost:3000">
            Go to Landing Page
          </Button>
        }
      />
    </Container>
  );
};

export default HospitalNotFound;
