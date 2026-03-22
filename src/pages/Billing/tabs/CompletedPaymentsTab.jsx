import React, { useEffect, useMemo } from "react";
import { Table, Tag, Empty, Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useBilling from "../../../modules/billing/hooks/useBilling";
import InvoiceReceipt from "../components/InvoiceReceipt";
import styled from "styled-components";

const DownloadBtn = styled(Button)`
  border-radius: 8px;
  @media (max-width: 576px) {
    padding: 4px 8px;
    font-size: 13px;
    height: auto;
  }
`;

const CompletedPaymentsTab = () => {
  const { fetchInvoices, invoices, loading } = useBilling();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const paidInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const status = (inv.STATUS || inv.status || '').toLowerCase();
      return status === 'paid' || status === 'completed'; // Common paid statuses
    });
  }, [invoices]);

  const downloadReceipt = (record) => {
    const printContent = document.getElementById(`receipt-${record.id}`);
    const WinPrint = window.open('', '', 'width=900,height=650');
    WinPrint.document.write('<html><head><title>Invoice Receipt</title>');
    const styles = document.querySelectorAll('style');
    styles.forEach(style => {
      WinPrint.document.write(style.outerHTML);
    });
    WinPrint.document.write('</head><body>');
    WinPrint.document.write(printContent.innerHTML);
    WinPrint.document.write('</body></html>');
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  };

  const columns = [
    { title: "Invoice ID", dataIndex: "id", key: "id", render: (id) => `#${id}` },
    { title: "Patient ID", dataIndex: "patient_id", key: "patient_id" },
    { title: "Amount Paid", dataIndex: "amount", key: "amount", render: (v) => <strong>₹{v}</strong> },
    {
      title: "Status",
      dataIndex: "STATUS",
      key: "status",
      render: (s) => <Tag color="success">{(s || 'paid').toUpperCase()}</Tag>
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "date",
      render: (v) => v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "Recently Completed"
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <DownloadBtn
          icon={<FilePdfOutlined />}
          onClick={() => downloadReceipt(record)}
        >
          Download Bill
        </DownloadBtn>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={paidInvoices}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: <Empty description="No completed payments found" /> }}
      />
      <div style={{ display: 'none' }}>
        {paidInvoices.map(inv => (
          <div key={inv.id} id={`receipt-${inv.id}`}>
            <InvoiceReceipt data={inv} />
          </div>
        ))}
      </div>
    </>
  );
};

export default CompletedPaymentsTab;
