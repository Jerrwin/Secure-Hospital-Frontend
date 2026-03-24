import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, InputNumber, Space, Tag, message, Empty } from "antd";
import { PlusCircleOutlined, SolutionOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useBilling from "../../../modules/billing/hooks/useBilling";
import styled from "styled-components";
import { useTheme } from "../../../context/ThemeContext";

const ActionBtn = styled(Button)`
  border-radius: 8px;
  font-weight: 500;
  background: ${props => props.theme.primary} !important;
  border-color: ${props => props.theme.primary} !important;
  color: #ffffff !important;

  &:hover {
    background: ${props => props.theme.primaryHover} !important;
    border-color: ${props => props.theme.primaryHover} !important;
  }

  @media (max-width: 576px) {
    padding: 4px 8px;
    font-size: 13px;
    height: auto;
  }
`;

const CreateInvoiceTab = ({ setActiveKey }) => {
  const { theme } = useTheme();
  const { 
    fetchInvoices, 
    invoices, 
    pendingInvoices,
    paidInvoices,
    sessionBilledIds,
    fetchCompletedAppointments, 
    completedAppointments, 
    loading, 
    createInvoice, 
    createSuccess, 
    submitting, 
    submitError, 
    clearBillingError 
  } = useBilling();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [localBilledIds, setLocalBilledIds] = useState(new Set());
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCompletedAppointments();
    fetchInvoices(); 
  }, [fetchCompletedAppointments, fetchInvoices]);

  useEffect(() => {
    if (submitError) {
      if (submitError !== "OFFLINE_QUEUED") {
        message.error(submitError);
      }
      clearBillingError();
    }
    
    if (createSuccess) {
      message.success("Invoice created successfully!");
      setActiveKey("pending");
      clearBillingError(); 
    }
  }, [submitError, createSuccess, clearBillingError, setActiveKey]);

  // Logic: Only show COMPLETED appointments that don't have an invoice yet
  const billableAppointments = useMemo(() => {
    // Combine ALL sources: Local (instant), Session (persisted), and Server (refreshed)
    const allKnownInvoices = [...(invoices || []), ...(pendingInvoices || []), ...(paidInvoices || [])];
    
    const billedIds = new Set([
      ...allKnownInvoices.map(inv => {
        const id = inv.appointment_id || inv.appointmentId || inv.APPOINTMENT_ID || inv.appointment?.id || inv.appointment?.ID;
        return String(id || '');
      }),
      ...(sessionBilledIds || []),
      ...Array.from(localBilledIds || [])
    ].filter(Boolean));
    
    const filtered = (completedAppointments || []).filter(app => {
      const status = (app.STATUS || app.status || '').toLowerCase();
      const appId = String(app.id || app.ID || '');
      return status === 'completed' && appId && !billedIds.has(appId);
    });

    return filtered;
  }, [completedAppointments, invoices, pendingInvoices, paidInvoices, sessionBilledIds, localBilledIds]);

  const handleCreateClick = (record) => {
    setSelectedAppointment(record);
    form.setFieldsValue({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = (values) => {
    createInvoice({
      appointment_id: selectedAppointment.id,
      amount: values.amount,
    });
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "appointment_date",
      key: "date",
      render: (v) => dayjs(v).format("DD MMM YYYY"),
    },
    {
      title: "Patient",
      dataIndex: "patient_name",
      key: "patient",
      render: (text, record) => text || record.patientName || `Patient #${record.patient_id}`,
    },
    {
      title: "Provider",
      dataIndex: "provider_name",
      key: "provider",
      render: (text, record) => text || record.providerName || `Doctor #${record.provider_id}`,
    },
    {
      title: "Status",
      dataIndex: "STATUS",
      key: "status",
      render: (s) => <Tag color="green">{s?.toUpperCase()}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <ActionBtn
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => handleCreateClick(record)}
        >
          Generate Invoice
        </ActionBtn>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={billableAppointments}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: <Empty description="No billable appointments found" /> }}
      />

      <Modal
        title={
          <Space>
            <SolutionOutlined style={{ color: theme.primary }} />
            <span style={{ color: theme.text.primary }}>Generate New Invoice</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Create Invoice"
        destroyOnHidden
      >
        {selectedAppointment && (
          <div style={{ marginBottom: 16, padding: 12, background: theme.primaryLight, borderRadius: 8, border: `1px solid ${theme.border}` }}>
            <p style={{ color: theme.text.primary }}><strong>Patient:</strong> {selectedAppointment.patient_name || selectedAppointment.patientName}</p>
            <p style={{ color: theme.text.secondary }}><strong>Appointment Date:</strong> {dayjs(selectedAppointment.appointment_date).format("DD MMM YYYY")}</p>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="amount"
            label="Invoice Amount"
            rules={[{ required: true, message: "Please enter the amount" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder="0.00"
              prefix="₹"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateInvoiceTab;
