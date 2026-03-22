import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Empty } from "antd";
import { CreditCardOutlined, DollarOutlined } from "@ant-design/icons";
import useBilling from "../../../modules/billing/hooks/useBilling";
import styled from "styled-components";

const { Option } = Select;

const ActionBtn = styled(Button)`
  border-radius: 8px;
  background: #52c41a;
  border-color: #52c41a;
  &:hover {
    background: #73d13d !important;
    border-color: #73d13d !important;
  }
  @media (max-width: 576px) {
    padding: 4px 8px;
    font-size: 13px;
    height: auto;
  }
`;

const PendingPaymentsTab = ({ setActiveKey }) => {
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

  useEffect(() => {
    fetchInvoices(); // Fetch all to ensure local filtering works
  }, [fetchInvoices]);

  const pendingInvoices = useMemo(() => {
    console.log("PendingPaymentsTab - INVOICES DATA:", invoices);
    if (invoices && invoices.length > 0) {
      console.log("ALL FIELDS IN FIRST INVOICE:", Object.keys(invoices[0]));
      console.log("FIRST INVOICE FULL OBJECT:", invoices[0]);
    }
    const filtered = (invoices || []).filter(invoice => {
      const status = invoice.STATUS || invoice.status || invoice.Status || 'pending';
      return status.toLowerCase() === 'pending';
    });
    console.log("PENDING INVOICES AFTER FILTERING:", filtered);
    if (filtered.length > 0) {
      console.log("PENDING INVOICE FIELDS:", Object.keys(filtered[0]));
      console.log("PENDING INVOICE FULL OBJECT:", filtered[0]);
    }
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
        setActiveKey("3");
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
      title: "Invoice ID", 
      dataIndex: "id", 
      key: "id", 
      render: (id, record) => {
        const invoiceId = id || record.Id || record.INVOICE_ID || record.invoice_id || record.invoiceId || record.INV_ID;
        return invoiceId ? `#${invoiceId}` : '#N/A';
      }
    },
    { 
      title: "Patient ID", 
      dataIndex: "patient_id", 
      key: "patient_id",
      render: (patientId, record) => {
        const pid = patientId || record.PATIENT_ID || record.patientId || record.patient_id || record.PATIENTID || record.patientID || record.patient || record.Patient;
        return pid || 'N/A';
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
            <CreditCardOutlined style={{ color: '#52c41a' }} />
            <span>Process Payment</span>
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
          <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
            <p><strong>Invoice ID:</strong> #{selectedInvoice.id || selectedInvoice.Id || selectedInvoice.INVOICE_ID || selectedInvoice.invoice_id || selectedInvoice.invoiceId || selectedInvoice.INV_ID || 'N/A'}</p>
            <p><strong>Amount Due:</strong> ₹{selectedInvoice.amount || selectedInvoice.AMOUNT || selectedInvoice.Amount || selectedInvoice.total_amount || selectedInvoice.totalAmount || selectedInvoice.total || selectedInvoice.price || selectedInvoice.Price || selectedInvoice.cost || selectedInvoice.Cost || 0}</p>
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
