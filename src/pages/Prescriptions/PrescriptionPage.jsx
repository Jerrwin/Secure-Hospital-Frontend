import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import PrescriptionList from "./PrescriptionList";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Space,
  Button,
  message,
} from "antd";
import {
  PlusOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import {
  fetchRequest,
  createRequest,
  updateRequest,
  statusChangeRequest,
  deleteRequest,
  clearError,
} from "../../modules/prescription/prescriptionSlice";

// ─── Design Tokens ────────────────────────────────────────────────
const C = {
  primary: "#2563eb",
  secondary: "#1e3a8a",
  bg: "#eff6ff",
  white: "#ffffff",
  text: "#334155",
  textLight: "#64748b",
  border: "#e2e8f0",
};

// (STATUS moved to PrescriptionList.jsx)

// ─── Styled ───────────────────────────────────────────────────────
const PageWrap = styled.div`
  min-height: 100vh;
  background: ${C.bg};
  font-family: "DM Sans", sans-serif;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-family: "Sora", sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${C.secondary};
  margin: 0;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledCard = styled(Card)`
  border-radius: 12px !important;
  border: 1px solid ${C.border} !important;
  box-shadow: 0 2px 12px rgba(37, 99, 235, 0.05) !important;

  .ant-card-head {
    border-bottom: 1px solid ${C.border};
    font-family: "Sora", sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: ${C.secondary};
  }
`;

const MedRow = styled.div`
  background: ${C.bg};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid ${C.border};
`;

// (PatientCard moved to PrescriptionList.jsx)

// (MedGrid moved to PrescriptionList.jsx)

const SearchInput = styled(Input)`
  width: 300px;
  border-radius: 8px;
  @media (max-width: 576px) {
    width: 100%;
  }
`;

// (Highlight moved to PrescriptionList.jsx)

// ─── Constants ────────────────────────────────────────────────────
const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once Daily" },
  { value: "twice_daily", label: "Twice Daily" },
  { value: "thrice_daily", label: "Thrice Daily" },
  { value: "four_times_daily", label: "Four Times Daily" },
  { value: "as_needed", label: "As Needed" },
  { value: "weekly", label: "Weekly" },
];

// ─── Helpers ──────────────────────────────────────────────────────
// (highlightText moved to PrescriptionList.jsx)

// ─── Sub-Components ───────────────────────────────────────────────
const MedicineFormList = memo(() => (
  <Form.List name="items" initialValue={[{}]}>
    {(fields, { add, remove }) => (
      <>
        {fields.map(({ key, name, ...rest }) => {
          const hasDelete = fields.length > 1;
          return (
            <MedRow key={key}>
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} sm={hasDelete ? 7 : 8}>
                  <Form.Item
                    {...rest}
                    name={[name, "medicine_name"]}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Medicine name" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={hasDelete ? 5 : 6}>
                  <Form.Item
                    {...rest}
                    name={[name, "dosage"]}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Dosage (e.g. 500mg)" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Item
                    {...rest}
                    name={[name, "frequency"]}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      placeholder="Frequency"
                      options={FREQUENCY_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={hasDelete ? 4 : 4}>
                  <Form.Item
                    {...rest}
                    name={[name, "duration"]}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="Duration (e.g. 7 days)" />
                  </Form.Item>
                </Col>
                {hasDelete && (
                  <Col xs={12} sm={2} style={{ textAlign: "center" }}>
                    <Button
                      danger
                      type="text"
                      shape="circle"
                      icon={<CloseCircleOutlined style={{ fontSize: 20 }} />}
                      onClick={() => remove(name)}
                      style={{ marginTop: -4 }}
                    />
                  </Col>
                )}
              </Row>
            </MedRow>
          );
        })}
        <Button
          type="dashed"
          onClick={() => add()}
          icon={<PlusOutlined />}
          block
          style={{ borderColor: C.primary, color: C.primary }}
        >
          Add Medicine
        </Button>
      </>
    )}
  </Form.List>
));

// (MedicineFormList remains here as it's part of the creation form)

// ─── Main Page ────────────────────────────────────────────────────
const PrescriptionPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role?.toUpperCase() || "PATIENT";

  const { list, appointments, loading, submitting, error } = useSelector(
    (state) => state.prescription,
  );

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Search & Filter State
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form] = Form.useForm();
  const formRef = React.useRef(null);

  useEffect(() => {
    dispatch(fetchRequest());
  }, [dispatch]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Filtered List Logic
  const filteredList = useMemo(() => {
    let result = [...list];

    // 1. Status Filter
    if (statusFilter !== "all") {
      result = result.filter((v) => {
        const s = (v.status || v.STATUS || v.status_name || "").toLowerCase();
        return s === statusFilter.toLowerCase();
      });
    }

    // 2. Search Text
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((v) => {
        const patientName = (
          v.patient_name ||
          (v.patient ? `${v.patient.first_name} ${v.patient.last_name}` : "")
        ).toLowerCase();
        const doctorName = (
          v.provider_name ||
          v.doctor?.name ||
          (v.doctor ? `${v.doctor.first_name} ${v.doctor.last_name}` : "")
        ).toLowerCase();
        const meds = (v.items || v.medicines || []).some((m) =>
          (m.medicine_name || "").toLowerCase().includes(q),
        );

        return patientName.includes(q) || doctorName.includes(q) || meds;
      });
    }

    return result;
  }, [list, debouncedSearch, statusFilter]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleOpen = useCallback(
    (record = null) => {
      setEditTarget(record);
      if (record) {
        form.setFieldsValue({
          appointment_id: record.appointment_id,
          notes: record.notes,
          items: record.items || record.medicines || [{}],
        });
      } else {
        form.resetFields();
      }
      setShowForm(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    [form],
  );

  const handleClose = useCallback(() => {
    setShowForm(false);
    setEditTarget(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (editTarget) {
        dispatch(updateRequest({ id: editTarget.id, data: values }));
      } else {
        dispatch(createRequest(values));
      }
      handleClose();
      message.success(
        editTarget ? "Prescription updated!" : "Prescription created!",
      );
    } catch (e) {}
  }, [form, editTarget, dispatch, handleClose]);

  const handleStatusChange = useCallback(
    (id, type) => {
      dispatch(statusChangeRequest({ id, type }));
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (id) => {
      dispatch(deleteRequest(id));
      message.success("Prescription deleted");
    },
    [dispatch],
  );

  const apptOptions = useMemo(() => {
    const filtered = appointments.filter(
      (a) =>
        !list.some((p) => p.appointment_id === a.id) ||
        (editTarget && editTarget.appointment_id === a.id),
    );
    return filtered.map((a) => ({
      value: a.id,
      label: `${a.patient_name || a.patientName || "Patient"} — ${new Date(a.appointment_date || a.date).toLocaleDateString()}`,
    }));
  }, [appointments, list, editTarget]);

  const roleLabel = {
    DOCTOR: "Prescriptions",
    PROVIDER: "Prescriptions",
    PHARMACIST: "Prescription Management",
    PATIENT: "My Prescriptions",
  };

  return (
    <PageWrap>
      <PageHeader>
        <PageTitle>
          <FileTextOutlined style={{ color: C.primary }} />{" "}
          {roleLabel[userRole] || "Prescriptions"}
        </PageTitle>

        <Space wrap size="middle">
          {/* Status Filter - Only for Pharmacist and Doctor (Patient has cards) */}
          {userRole !== "PATIENT" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FilterOutlined style={{ color: C.primary }} />
              <span style={{ fontWeight: 500, color: C.text }}>Status:</span>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 140 }}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "created", label: "Created" },
                  { value: "verified", label: "Verified" },
                  { value: "dispensed", label: "Dispensed" },
                ]}
              />
            </div>
          )}

          <SearchInput
            placeholder={
              userRole === "PATIENT"
                ? "Search by Doctor or Medicine..."
                : "Search by Patient, Doctor or Medicine..."
            }
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={searchText}
            onChange={(e) => {
              const val = e.target.value;
              setSearchText(val);
              if (!val) setDebouncedSearch("");
            }}
            allowClear
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => dispatch(fetchRequest())}
            loading={loading}
          />

          {["DOCTOR", "PROVIDER", "ADMIN"].includes(userRole) && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpen(null)}
              style={{ background: C.primary, border: "none" }}
            >
              New Prescription
            </Button>
          )}
        </Space>
      </PageHeader>

      <PrescriptionList
        prescriptions={filteredList}
        loading={loading}
        userRole={userRole}
        searchQuery={debouncedSearch}
        onEdit={handleOpen}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      {showForm && ["DOCTOR", "PROVIDER", "ADMIN"].includes(userRole) && (
        <div ref={formRef} style={{ marginTop: 24 }}>
          <StyledCard
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "Sora, sans-serif",
                    fontWeight: 700,
                    color: C.secondary,
                  }}
                >
                  {editTarget ? "Edit Prescription" : "New Prescription"}
                </span>
                <CloseOutlined
                  onClick={handleClose}
                  style={{
                    cursor: "pointer",
                    fontSize: 18,
                    color: C.textLight,
                  }}
                />
              </div>
            }
          >
            <Form form={form} layout="vertical">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="appointment_id"
                    label="Appointment"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Select
                      placeholder="Select appointment"
                      options={apptOptions}
                      showSearch
                      size="large"
                      disabled={!!editTarget}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="notes"
                    label="Clinical Notes"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Notes..."
                      size="large"
                      style={{ background: C.bg }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div
                style={{
                  fontWeight: 600,
                  color: C.secondary,
                  marginBottom: 12,
                  fontSize: "1.1rem",
                }}
              >
                Medicines
              </div>
              <MedicineFormList />
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                <Button size="large" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  loading={submitting}
                  onClick={handleSubmit}
                  style={{
                    background: C.primary,
                    border: "none",
                    minWidth: 120,
                  }}
                >
                  {editTarget ? "Update Changes" : "Create Prescription"}
                </Button>
              </div>
            </Form>
          </StyledCard>
        </div>
      )}
    </PageWrap>
  );
};

export default PrescriptionPage;
