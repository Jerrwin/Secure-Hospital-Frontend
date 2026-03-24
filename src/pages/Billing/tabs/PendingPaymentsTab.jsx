import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Empty } from "antd";
import { CreditCardOutlined, DollarOutlined } from "@ant-design/icons";
import useBilling from "../../../modules/billing/hooks/useBilling";
import usePatients from "../../../modules/patients/hooks/usePatients";
import styled from "styled-components";
import { useTheme } from "../../../context/ThemeContext";

const { Option } = Select;

const ActionBtn = styled(Button)`
  border-radius: 8px;
  background: ${props => props.theme.status.success} !important;
  border-color: ${props => props.theme.status.success} !important;
  color: #ffffff !important;

  &:hover {
    background: ${props => props.theme.status.success}dd !important;
    border-color: ${props => props.theme.status.success}dd !important;
  }
  @media (max-width: 576px) {
    padding: 4px 8px;
    font-size: 13px;
    height: auto;
  }
`;

const PendingPaymentsTab = ({ setActiveKey }) => {
  const { theme } = useTheme();
  const { 
    fetchInvoices, 
    invoices, 
    loading, 
    processPayment, 
    paymentSuccess, 
    submitting, 
    submitError, 
    clearBillingError 
  } = useBilling();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form] = Form.useForm();
  const { patients, fetchPatients } = usePatients();

  useEffect(() => {
    fetchInvoices(); // Fetch all to ensure local filtering works
    fetchPatients();
  }, [fetchInvoices, fetchPatients]);

  const pendingInvoices = useMemo(() => {
    const filtered = (invoices || []).filter(invoice => {
      const status = invoice.STATUS || invoice.status || invoice.Status || 'pending';
      return status.toLowerCase() === 'pending';
    });
    return filtered;
  }, [invoices]);

  useEffect(() => {
    if (submitError) {
      message.error(submitError);
      clearBillingError();
    }

    if (paymentSuccess) {
      message.success("Payment recorded successfully!");
      // Switch to Completed Payments tab
      setTimeout(() => {
        setActiveKey("completed");
        clearBillingError(); 
      }, 500);
    }
  }, [submitError, paymentSuccess, clearBillingError, setActiveKey]);

  const handlePayClick = (record) => {
    setSelectedInvoice(record);
    const amount = record.amount || record.AMOUNT || record.Amount || record.total_amount || record.totalAmount || record.total || record.price || record.Price || record.cost || record.Cost || 0;
    form.setFieldsValue({
      amount: amount,
      method: "Cash",
      transaction_id: `TXN-${Date.now()}`,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (values) => {
    const invoiceId = selectedInvoice.id || selectedInvoice.Id || selectedInvoice.INVOICE_ID || selectedInvoice.invoice_id || selectedInvoice.invoiceId || selectedInvoice.INV_ID;
    processPayment({
      invoice_id: invoiceId,
      amount: values.amount,
      method: values.method,
      transaction_id: values.transaction_id,
    });
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    { 
      title: "Patient", 
      key: "patient", 
      render: (_, record) => {
        let name = record.patient_name || record.patientName;
        const pid = record.patient_id || record.PATIENT_ID || record.patientId || record.patientID || record.PatientId;
        if (!name && pid && patients.length > 0) {
          const found = patients.find(p => String(p.id) === String(pid));
          if (found) name = `${found.first_name || ""} ${found.last_name || ""}`.trim() || found.name;
        }
        return name ? <span style={{ fontWeight: 600, color: theme.primary }}>{name}</span> : 'Unknown Patient';
      }
    },
    { 
      title: "Amount", 
      dataIndex: "amount", 
      key: "amount", 
      render: (v, record) => {
        const amount = v || record.AMOUNT || record.Amount || record.total_amount || record.totalAmount || record.total || record.price || record.Price || record.cost || record.Cost;
        return amount ? <strong>₹{amount}</strong> : <strong>₹0</strong>;
      }
    },
    { 
      title: "Status", 
      dataIndex: "STATUS", 
      key: "status",
      render: (s, record) => {
        const status = s || record.status || record.Status || record.STATE || record.state || 'pending';
        return <Tag color="orange">{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <ActionBtn
          type="primary"
          icon={<DollarOutlined />}
          onClick={() => handlePayClick(record)}
        >
          Collect Payment
        </ActionBtn>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={pendingInvoices}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: <Empty description="No pending invoices found" /> }}
      />

      <Modal
        title={
          <Space>
            <CreditCardOutlined style={{ color: theme.status.success }} />
            <span style={{ color: theme.text.primary }}>Process Payment</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Record Payment"
        destroyOnHidden
      >
        {selectedInvoice && (
          <div style={{ marginBottom: 16, padding: 12, background: theme.primaryLight, border: `1px solid ${theme.border}`, borderRadius: 8 }}>
            <p style={{ color: theme.text.primary }}><strong>Invoice ID:</strong> #{selectedInvoice.id || selectedInvoice.Id || selectedInvoice.INVOICE_ID || selectedInvoice.invoice_id || selectedInvoice.invoiceId || selectedInvoice.INV_ID || 'N/A'}</p>
            <p style={{ color: theme.text.primary }}><strong>Amount Due:</strong> ₹{selectedInvoice.amount || selectedInvoice.AMOUNT || selectedInvoice.Amount || selectedInvoice.total_amount || selectedInvoice.totalAmount || selectedInvoice.total || selectedInvoice.price || selectedInvoice.Price || selectedInvoice.cost || selectedInvoice.Cost || 0}</p>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="amount"
            label="Payment Amount"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input disabled prefix="₹" />
          </Form.Item>
          <Form.Item
            name="method"
            label="Payment Method"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Cash">Cash</Option>
              <Option value="Card">Credit/Debit Card</Option>
              <Option value="Insurance">Insurance Claim</Option>
              <Option value="UPI">UPI/Online</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="transaction_id"
            label="Transaction ID / Receipt #"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="Enter reference number" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PendingPaymentsTab;
