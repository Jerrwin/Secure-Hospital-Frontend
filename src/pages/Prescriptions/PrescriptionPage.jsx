import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import PrescriptionList from "./PrescriptionList";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Tabs,
  message,
  Drawer,
} from "antd";
import {
  PlusOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import AppButton from "../../components/common/Button/AppButton";
import { useTheme } from "../../context/ThemeContext";
import {
  fetchRequest,
  setPage,
  setSearch,
  setStatus,
  fetchPagedRequest,
  createRequest,
  updateRequest,
  statusChangeRequest,
  deleteRequest,
  clearError,
  setProviderId,
} from "../../modules/prescription/prescriptionSlice";
import usePrescription from "../../modules/prescription/hooks/usePrescription";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import usePatients from "../../modules/patients/hooks/usePatients";
import { usePrefetchPagination } from "../../hooks/usePrefetchPagination";

const paginationActions = {
  fetchPagedRequest,
  setPage,
  setSearch,
  setStatus,
};

// ─── Breakpoints (Dynamic Helpers) ───────────────────────────────────────────
const bp = {
  xs: (props) => props.theme.breakpoints.xs,
  sm: (props) => props.theme.breakpoints.sm,
  md: (props) => props.theme.breakpoints.md,
  lg: (props) => props.theme.breakpoints.lg,
  xl: (props) => props.theme.breakpoints.xl,
};

const PageWrap = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme.background.main};
  font-family: ${(props) => props.theme.fontFamily};
`;

const HeaderCard = styled.div`
  background: ${(props) => props.theme.background.card};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadow};
  margin-bottom: 20px;
  overflow: hidden;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;

  @media (min-width: ${bp.lg}) {
    padding: 16px 22px;
    flex-wrap: nowrap;
    border-bottom: 1px solid ${(props) => props.theme.border};
  }
`;

const MobileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 16px;
  border-bottom: 1px solid ${(props) => props.theme.border};

  @media (min-width: ${bp.lg}) {
    display: none; // Hidden on desktop, moved into HeaderRow
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const TitleIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: ${(props) => props.theme.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @media (min-width: ${bp.md}) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
`;

const PageTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${(props) => props.theme.text.primary};
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
    font-size: 17px;
  }
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: 18px;
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    max-width: 320px;
  }
`;

const MedRow = styled.div`
  background: ${(props) => props.theme.background.main};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid ${(props) => props.theme.border};
`;

// (PatientCard moved to PrescriptionList.jsx)

// (MedGrid moved to PrescriptionList.jsx)

const SearchInput = styled(Input)`
  border-radius: 8px;
  width: 100%;
`;

const DesktopActions = styled.div`
  display: none;
  align-items: center;
  gap: 16px;

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    display: flex;
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
const MedicineFormList = memo(() => {
  const { theme } = useTheme();
  return (
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
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            Add Medicine
          </Button>
        </>
      )}
    </Form.List>
  );
});

// (MedicineFormList remains here as it's part of the creation form)

// ─── Main Page ────────────────────────────────────────────────────
const PrescriptionPage = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role?.toUpperCase() || "PATIENT";
  const {
    list,
    appointments,
    loading: prescriptionsLoading,
    submitting,
    error,
  } = usePrescription();
  const { patients, fetchPatients } = usePatients();
  const { fetchDropdowns: fetchAppointmentDropdowns } = useAppointments();

  const {
    pagination: tablePagination,
    actions: pagedActions,
    searchQuery: debouncedSearch,
    statusFilter,
  } = usePrefetchPagination({
    selector: (state) => state.prescription,
    actions: paginationActions,
    fixedPageSize: 5,
    initialStatus: userRole === "PHARMACIST" ? "created" : "all",
  });

  const loading = prescriptionsLoading;

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Filter State (Local for immediate UI feedback before debounce)
  const [searchText, setSearchText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    // Initial fetch of page 1 is now handled by the usePrefetchPagination hook internally

    const isMedicalStaff = ["DOCTOR", "ADMIN", "PROVIDER"].includes(userRole);

    // Set provider filter specifically for doctors
    if (userRole === "DOCTOR" || userRole === "PROVIDER") {
      dispatch(setProviderId(user?.id));
    } else {
      dispatch(setProviderId(null)); // Reset for Admin/Pharmacist
    }

    if (isMedicalStaff) {
      fetchPatients();
      fetchAppointmentDropdowns();
    }
  }, [dispatch, fetchPatients, fetchAppointmentDropdowns, userRole, user?.id]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => pagedActions.setSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText, pagedActions]);

  const handleStatusFilterChange = (val) => {
    pagedActions.setStatus(val);
  };

  const handleClose = useCallback(() => {
    setShowForm(false);
    setEditTarget(null);
    form.resetFields();
  }, [form]);

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
    },
    [form],
  );

  useEffect(() => {
    if (error) {
      if (error === "OFFLINE_QUEUED") {
        handleClose();
      } else {
        message.error(error);
      }
      dispatch(clearError());
      setIsSubmitting(false);
    }
  }, [error, dispatch, handleClose]);

  useEffect(() => {
    if (isSubmitting && !submitting && !error) {
      message.success(
        editTarget ? "Prescription updated!" : "Prescription created!",
      );
      setIsSubmitting(false);
      handleClose();
    }
  }, [isSubmitting, submitting, error, editTarget, handleClose]);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      if (editTarget) {
        dispatch(updateRequest({ id: editTarget.id, data: values }));
      } else {
        dispatch(createRequest(values));
      }
    } catch (e) {}
  }, [form, editTarget, dispatch]);

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
    const userId = user?.id || user?.user_id;

    const filtered = appointments.filter((a) => {
      // 1. Basic eligibility: No existing prescription OR it's the one we're editing
      const isEligible =
        !list.some((p) => p.appointment_id === a.id) ||
        (editTarget && editTarget.appointment_id === a.id);

      if (!isEligible) return false;

      // 2. Role-based filtering: If Doctor/Provider, only show their own appointments
      if (userRole === "DOCTOR" || userRole === "PROVIDER") {
        return String(a.provider_id) === String(userId);
      }

      return true; // Admin/Pharmacist etc. see all
    });

    return filtered.map((a) => {
      // Name resolution logic
      let name = a.patient_name || a.patientName;
      if (!name && a.patient_id && patients.length > 0) {
        const found = patients.find(
          (p) => String(p.id) === String(a.patient_id),
        );
        if (found) {
          name =
            `${found.first_name || ""} ${found.last_name || ""}`.trim() ||
            found.name;
        }
      }
      return {
        value: a.id,
        label: `${name || "Patient"} — ${new Date(a.appointment_date || a.date).toLocaleDateString()}`,
      };
    });
  }, [appointments, list, editTarget, patients, user, userRole]);

  const roleLabel = {
    DOCTOR: "Prescriptions",
    PROVIDER: "Prescriptions",
    PHARMACIST: "Prescription Management",
    PATIENT: "My Prescriptions",
  };

  return (
    <PageWrap>
      <HeaderCard>
        <HeaderRow>
          <HeaderLeft>
            <TitleIcon>
              <FileTextOutlined
                style={{ fontSize: "20px", color: theme.primary }}
              />
            </TitleIcon>
            <PageTitle>{roleLabel[userRole] || "Prescriptions"}</PageTitle>
          </HeaderLeft>

          {/* New Prescription */}
          {["DOCTOR", "PROVIDER", "ADMIN"].includes(userRole) && (
            <AppButton
              variant="header"
              icon={<PlusOutlined />}
              onClick={() => handleOpen(null)}
            >
              New Prescription
            </AppButton>
          )}

          {/* Desktop Controls (Merged row) */}
          <DesktopActions>
            <SearchWrapper>
              <SearchInput
                placeholder={
                  userRole === "PATIENT"
                    ? "Search meds..."
                    : "Search patient, meds..."
                }
                prefix={<SearchOutlined style={{ color: theme.text.light }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </SearchWrapper>

            {(userRole === "PATIENT" ||
              userRole === "DOCTOR" ||
              userRole === "PROVIDER") && (
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                style={{ width: 140 }}
                options={[
                  { value: "all", label: "All Status" },
                  {
                    value: "created",
                    label: userRole === "PATIENT" ? "Created" : "Recent",
                  },
                  { value: "verified", label: "Verified" },
                  {
                    value: "dispensed",
                    label: userRole === "PATIENT" ? "Dispensed" : "Done",
                  },
                ]}
              />
            )}

            <Button
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchRequest())}
              loading={loading}
            />
          </DesktopActions>
        </HeaderRow>

        {/* Mobile Controls (Second row) */}
        <MobileRow>
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <SearchWrapper>
              <SearchInput
                placeholder="Search..."
                prefix={<SearchOutlined style={{ color: theme.text.light }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </SearchWrapper>

            {(userRole === "PATIENT" ||
              userRole === "DOCTOR" ||
              userRole === "PROVIDER") && (
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                style={{ width: 120 }}
                options={[
                  { value: "all", label: "All" },
                  {
                    value: "created",
                    label: userRole === "PATIENT" ? "Created" : "Recent",
                  },
                  { value: "verified", label: "Verified" },
                  {
                    value: "dispensed",
                    label: userRole === "PATIENT" ? "Dispensed" : "Done",
                  },
                ]}
              />
            )}

            <Button
              icon={<ReloadOutlined />}
              onClick={() => dispatch(fetchRequest())}
              loading={loading}
              style={{ flexShrink: 0 }}
            />
          </div>
        </MobileRow>
      </HeaderCard>

      {userRole === "PHARMACIST" && (
        <Tabs
          activeKey={
            statusFilter === "dispensed"
              ? "processed"
              : statusFilter === "verified"
                ? "verified"
                : "pending"
          }
          onChange={(key) => {
            const statusMap = {
              pending: "created",
              verified: "verified",
              processed: "dispensed",
            };
            pagedActions.setStatus(statusMap[key] || "created");
          }}
          style={{
            marginBottom: 16,
            background: theme.background.card,
            padding: "0 20px",
            borderRadius: "12px",
          }}
          items={[
            {
              key: "pending",
              label: "Pending",
            },
            {
              key: "verified",
              label: "Verified",
            },
            {
              key: "processed",
              label: "Processed",
            },
          ]}
        />
      )}

      <PrescriptionList
        prescriptions={list}
        patients={patients}
        appointments={appointments}
        loading={loading}
        userRole={userRole}
        searchQuery={debouncedSearch}
        onEdit={handleOpen}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        pagination={tablePagination}
        pagedActions={pagedActions}
        statusFilter={statusFilter}
      />

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <TitleIcon
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: theme.primaryLight,
              }}
            >
              <FileTextOutlined
                style={{ fontSize: "16px", color: theme.primary }}
              />
            </TitleIcon>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: theme.text.primary,
              }}
            >
              {editTarget ? "Edit Prescription" : "Create New Prescription"}
            </span>
          </div>
        }
        placement="right"
        onClose={handleClose}
        open={showForm}
        size={window.innerWidth > 992 ? 800 : "100%"}
        styles={{
          body: { padding: "24px", background: theme.background.card },
          header: {
            borderBottom: `1px solid ${theme.border}`,
            padding: "16px 24px",
            background: theme.background.card,
          },
        }}
        closable={false}
        extra={
          <Button type="text" onClick={handleClose} icon={<CloseOutlined />} />
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
                  style={{ background: theme.background.main }}
                />
              </Form.Item>
            </Col>
          </Row>
          <div
            style={{
              fontWeight: 600,
              color: theme.secondary,
              marginBottom: 12,
              fontSize: "1.1rem",
              fontFamily: "Sora, sans-serif",
            }}
          >
            Medicines List
          </div>
          <MedicineFormList />
          <div
            style={{
              marginTop: 32,
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
                background: theme.primary,
                border: "none",
                minWidth: 150,
                borderRadius: "6px",
              }}
            >
              {editTarget ? "Update Changes" : "Confirm Prescription"}
            </Button>
          </div>
        </Form>
      </Drawer>
    </PageWrap>
  );
};

export default PrescriptionPage;
