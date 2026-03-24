import React, { useEffect, useMemo } from "react";
import { Table, Tag, Empty, Button } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useBilling from "../../../modules/billing/hooks/useBilling";
import usePatients from "../../../modules/patients/hooks/usePatients";
import InvoiceReceipt from "../components/InvoiceReceipt";
import styled from "styled-components";
import { useTheme } from "../../../context/ThemeContext";
import useAuth from "../../../modules/auth/hooks/useAuth";

import useAuth from "../../../modules/auth/hooks/useAuth";

const DownloadBtn = styled(Button)`
  border-radius: 8px;
  background: ${(props) => props.theme.primary} !important;
  border-color: ${(props) => props.theme.primary} !important;
  color: #ffffff !important;

  &:hover {
    background: ${(props) => props.theme.primaryHover} !important;
    border-color: ${(props) => props.theme.primaryHover} !important;
  }
  @media (max-width: 576px) {
    padding: 4px 8px;
    font-size: 13px;
    height: auto;
  }
`;

const CompletedPaymentsTab = () => {
  const { user, userRole } = useAuth();
  const isPatient = userRole === "PATIENT";
  const { theme } = useTheme();
  const { fetchInvoices, invoices, loading } = useBilling();
  const { patients, fetchPatients } = usePatients();

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, [fetchInvoices, fetchPatients]);

  const paidInvoices = useMemo(() => {
    return (invoices || []).filter((inv) => {
      const status = (inv.STATUS || inv.status || "").toLowerCase();
      const isPaid = status === "paid" || status === "completed";
      if (isPatient) {
        const pid = inv.patient_id || inv.PATIENT_ID || inv.patientId;
        return isPaid && (pid === user?.id || pid === user?.uhid);
      }
      return isPaid;
    });
  }, [invoices, isPatient, user]);

  const downloadReceipt = (record) => {
    const printContent = document.getElementById(`receipt-${record.id}`);
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
  };

  const columns = [
    {
      title: "Patient",
      key: "patient",
      render: (_, record) => {
        let name = record.patient_name || record.patientName;
        const pid =
          record.patient_id ||
          record.PATIENT_ID ||
          record.patientId ||
          record.patientID ||
          record.PatientId;
        if (!name && pid && patients.length > 0) {
          const found = patients.find((p) => String(p.id) === String(pid));
          if (found)
            name =
              `${found.first_name || ""} ${found.last_name || ""}`.trim() ||
              found.name;
        }
        return name ? (
          <span style={{ fontWeight: 600, color: theme.primary }}>{name}</span>
        ) : (
          "Unknown Patient"
        );
      },
    },
    {
      title: "Amount Paid",
      dataIndex: "amount",
      key: "amount",
      render: (v) => <strong>₹{v || 0}</strong>,
    },
    {
      title: "Status",
      dataIndex: "STATUS",
      key: "status",
      render: (s) => (
        <Tag color={theme.status.success}>{(s || "paid").toUpperCase()}</Tag>
      ),
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
      key: "date",
      render: (v) =>
        v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "Recently Completed",
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
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: <Empty description="No completed payments found" />,
        }}
      />
      <div style={{ display: "none" }}>
        {paidInvoices.map((inv) => (
          <div key={inv.id} id={`receipt-${inv.id}`}>
            <InvoiceReceipt data={inv} />
          </div>
        ))}
      </div>
    </>
  );
};

export default CompletedPaymentsTab;
