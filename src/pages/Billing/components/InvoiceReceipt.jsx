import React from "react";
import styled from "styled-components";
import { BankOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTheme } from "../../../context/ThemeContext";

const ReceiptContainer = styled.div`
  padding: 40px;
  background: white;
  color: #333;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #eee;

  @media print {
    border: none;
    padding: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid ${props => props.theme.primary};
  padding-bottom: 20px;
  margin-bottom: 30px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.primary};
  font-size: 28px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Title = styled.h2`
  margin: 0;
  color: ${props => props.theme.primary};
  font-size: 24px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
`;

const InfoBox = styled.div`
  h4 {
    margin: 0 0 10px 0;
    color: ${props => props.theme.text.secondary};
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 1px;
  }
  p {
    margin: 4px 0;
    font-size: 14px;
    font-weight: 500;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;

  th {
    text-align: left;
    background: ${props => props.theme.background.header};
    padding: 12px;
    border-bottom: 2px solid ${props => props.theme.border};
    color: ${props => props.theme.text.secondary};
    font-size: 12px;
    text-transform: uppercase;
  }

  td {
    padding: 16px 12px;
    border-bottom: 1px solid ${props => props.theme.border};
    font-size: 14px;
  }
`;

const Footer = styled.div`
  text-align: right;
  margin-top: 20px;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.text.primary};
  padding-top: 20px;
  border-top: 2px solid ${props => props.theme.primary};
`;

const ReceiptFooter = styled.div`
  margin-top: 60px;
  text-align: center;
  color: ${props => props.theme.text.light};
  font-size: 12px;
  border-top: 1px solid ${props => props.theme.border};
  padding-top: 20px;
`;

const InvoiceReceipt = ({ data }) => {
  const { theme } = useTheme();
  if (!data) return null;

  return (
    <ReceiptContainer id="printable-receipt">
      <Header>
        <div>
          <Logo>
             <BankOutlined /> Apollo Hospital
          </Logo>
          <p style={{ margin: '8px 0 0 0', color: theme.text.secondary, fontSize: '13px' }}>
            Quality Healthcare, Anywhere
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Title>PAYMENT RECEIPT</Title>
          <p style={{ margin: '4px 0', fontWeight: 600 }}>Receipt #{data.transaction_id || data.id}</p>
          <p style={{ margin: '0', color: theme.text.secondary }}>Date: {dayjs(data.payment_date || data.created_at).format("DD MMM YYYY, hh:mm A")}</p>
        </div>
      </Header>

      <InfoGrid>
        <InfoBox>
          <h4>Billed To:</h4>
          <p><strong>Patient ID:</strong> {data.patient_id}</p>
          <p><strong>Patient Name:</strong> {data.patient_name || "Patient"}</p>
        </InfoBox>
        <InfoBox>
          <h4>Payment Details:</h4>
          <p><strong>Method:</strong> {data.method || "Cash"}</p>
          <p><strong>Transaction ID:</strong> {data.transaction_id || "N/A"}</p>
          <p><strong>Status:</strong> PAID</p>
        </InfoBox>
      </InfoGrid>

      <Table>
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Medical Consultation #APPT-{data.appointment_id}</td>
            <td style={{ textAlign: 'right' }}>₹{data.amount}</td>
          </tr>
        </tbody>
      </Table>

      <Footer>
        <TotalRow>
          <span>TOTAL PAID:</span>
          <span style={{ color: theme.status.success }}>₹{data.amount}</span>
        </TotalRow>
      </Footer>

      <ReceiptFooter>
        <p>This is a computer-generated receipt and does not require a physical signature.</p>
        <p>© {dayjs().year()} Apollo Hospital Management System</p>
      </ReceiptFooter>
    </ReceiptContainer>
  );
};

export default InvoiceReceipt;
