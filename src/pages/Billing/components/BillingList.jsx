import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Empty,
  App,
} from "antd";
import {
  CreditCardOutlined,
  BankOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styled from "styled-components";
import useBilling from "../../../modules/billing/hooks/useBilling";
import useAuth from "../../../modules/auth/hooks/useAuth";
import { useTheme } from "../../../context/ThemeContext";
import InvoiceReceipt from "./InvoiceReceipt";

const { Option } = Select;

const ActionBtn = styled(Button)`
  border-radius: 8px;
  background: ${(props) =>
    props.$success
      ? props.theme.status.success
      : props.theme.primary} !important;
  border-color: ${(props) =>
    props.$success
      ? props.theme.status.success
      : props.theme.primary} !important;
  color: #ffffff !important;

  &:hover {
    background: ${(props) =>
      props.$success
        ? props.theme.status.success + "dd"
        : props.theme.primaryHover} !important;
    border-color: ${(props) =>
      props.$success
        ? props.theme.status.success + "dd"
        : props.theme.primaryHover} !important;
  }
`;

const BillingList = ({
  statusFilter,
  pagination,
  loading,
  list,
  pagedActions,
}) => {
  const { theme } = useTheme();
  const { userRole } = useAuth();
  const { message } = App.useApp();

  // ── Local UI State ──────────────────────────────────────────────────────
  const {
    processPayment,
    paymentSuccess,
    submitting,
    submitError,
    clearBillingError,
  } = useBilling();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (submitError) {
      if (submitError !== "OFFLINE_QUEUED") {
        message.error(submitError);
      }
      clearBillingError();
    }

    if (paymentSuccess) {
      message.success(
        userRole === "PATIENT"
          ? "Payment successful!"
          : "Payment recorded successfully!",
      );
      setIsModalOpen(false);
      form.resetFields();
      clearBillingError();
      // The parent (InvoicePage) should handle the tab switch if needed,
      // but re-fetching is usually enough since it'll disappear from current list.
      pagedActions.fetchPaged(1);
    }
  }, [
    submitError,
    paymentSuccess,
    userRole,
    clearBillingError,
    pagedActions,
    form,
    message,
  ]);

  const handlePayClick = React.useCallback((record) => {
    setSelectedInvoice(record);
    const amount = record.amount || record.total_amount || 0;
    form.setFieldsValue({
      amount: amount,
      method: "Cash",
      transaction_id: `TXN-${Date.now()}`,
    });
    setIsModalOpen(true);
  }, [form]);

  const downloadReceipt = React.useCallback((record) => {
    const printContent = document.getElementById(`receipt-${record.id}`);
    if (!printContent) {
      message.error("Receipt content not found");
      return;
    }
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write("<html><head><title>Invoice Receipt</title>");
    const styles = document.querySelectorAll("style");
    styles.forEach((style) => {
      WinPrint.document.write(style.outerHTML);
    });
    WinPrint.document.write("</head><body>");
    WinPrint.document.write(printContent.innerHTML);
    WinPrint.document.write("</body></html>");
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  }, [message]);

  const handleFormSubmit = (values) => {
    processPayment({
      invoice_id: selectedInvoice.id,
      amount: values.amount,
      method: values.method,
      transaction_id: values.transaction_id,
    });
  };

  const columns = useMemo(
    () =>
      [
        {
          title: "Patient",
          key: "patient",
          render: (_, record) => {
            const name =
              record.patient_name ||
              record.patientName ||
              `Patient #${record.patient_id}`;
            return (
              <span style={{ fontWeight: 600, color: theme.primary }}>
                {name}
              </span>
            );
          },
        },
        {
          title: "Amount",
          dataIndex: "amount",
          key: "amount",
          render: (v) => <strong>₹{v || 0}</strong>,
        },
        {
          title: "Status",
          dataIndex: "STATUS",
          key: "status",
          render: (s) => {
            const status = (s || "pending").toLowerCase();
            let color = "orange";
            if (status === "paid" || status === "completed")
              color = theme.status.success;
            if (status === "cancelled") color = "red";
            return <Tag color={color}>{status.toUpperCase()}</Tag>;
          },
        },
        {
          title: statusFilter === "paid" ? "Payment Date" : "Created Date",
          dataIndex: statusFilter === "paid" ? "payment_date" : "created_at",
          key: "date",
          render: (v) => {
            if (!v) return "N/A";
            // payment_date is usually just a date string, so avoid '12:00 AM' dummy time
            if (statusFilter === "paid") return dayjs(v).format("DD MMM YYYY");
            return dayjs(v).format("DD MMM YYYY, hh:mm A");
          },
        },
        {
          title: "Action",
          key: "action",
          hidden: statusFilter === "cancelled",
          render: (_, record) => {
            if (statusFilter === "pending") {
              return (
                <ActionBtn
                  $success
                  type="primary"
                  icon={<BankOutlined />}
                  onClick={() => handlePayClick(record)}
                >
                  {userRole === "PATIENT" ? "Pay" : "Collect"}
                </ActionBtn>
              );
            }
            if (
              statusFilter === "paid" ||
              (record.STATUS || "").toLowerCase() === "paid"
            ) {
              return (
                <ActionBtn
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={() => downloadReceipt(record)}
                >
                  Receipt
                </ActionBtn>
              );
            }
            return null;
          },
        },
      ].filter((c) => !c.hidden),
    [theme, statusFilter, handlePayClick, downloadReceipt, userRole],
  );

  return (
    <>
      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={pagination}
        onChange={pagedActions.handleTableChange}
        locale={{
          emptyText: (
            <Empty description={`No ${statusFilter} invoices found`} />
          ),
        }}
      />

      {/* Hidden Receipt templates for printing */}
      <div style={{ display: "none" }}>
        {(list || []).map((inv) => (
          <div key={`receipt-container-${inv.id}`} id={`receipt-${inv.id}`}>
            <InvoiceReceipt data={inv} />
          </div>
        ))}
      </div>

      <Modal
        title={
          <Space>
            <CreditCardOutlined style={{ color: theme.status.success }} />
            <span style={{ color: theme.text.primary }}>
              {userRole === "PATIENT" ? "Make Payment" : "Process Payment"}
            </span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText={userRole === "PATIENT" ? "Pay Now" : "Record Payment"}
        destroyOnHidden
      >
        {selectedInvoice && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: theme.primaryLight,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
            }}
          >
            <p style={{ color: theme.text.primary }}>
              <strong>Invoice ID:</strong> #{selectedInvoice.id}
            </p>
            <p style={{ color: theme.text.primary }}>
              <strong>Amount Due:</strong> ₹{selectedInvoice.amount || 0}
            </p>
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

export default BillingList;
