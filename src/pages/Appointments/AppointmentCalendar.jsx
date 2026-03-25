import React, { useEffect, useState, useMemo, useRef } from "react";
import styled from "styled-components";
import {
  CalendarOutlined,
  UnorderedListOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Calendar,
  Spin,
  Tag,
  Popover,
  Badge,
  Input,
  Select,
  Button,
  Space,
} from "antd";

import { useTheme } from "../../context/ThemeContext";
import useAuth from "../../modules/auth/hooks/useAuth";
import useCalendar from "../../modules/calendar/hooks/useCalendar";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import AppointmentList from "./AppointmentList";
import AppButton from "../../components/common/Button/AppButton";

const StyledSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: ${props => props.theme.primary} !important;
  }
  .ant-spin-text {
    color: ${props => props.theme.primary} !important;
    font-weight: 500;
  }
`;

// ─── Styled Components ──────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    gap: 20px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.background.card};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadow};
  border: 1px solid ${(props) => props.theme.border};
  overflow: hidden;

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    border-radius: 14px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: nowrap;
  padding: 10px 12px;
  width: 100%;

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    padding: 12px 16px;
    gap: 12px;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    padding: 16px 22px;
  }
`;

const MobileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px 10px 12px;
  width: 100%;

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    padding: 0 16px 12px 16px;
    gap: 12px;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    display: none; // Hidden on desktop, moved into HeaderRow
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    max-width: 320px;
  }
`;

const SearchInput = styled(Input)`
  border-radius: ${(props) => props.theme.borderRadius.md};
  width: 100%;
`;

const StatusSelect = styled(Select)`
  min-width: 140px;
  .ant-select-selector {
    border-radius: ${(props) => props.theme.borderRadius.md} !important;
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
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
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

const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  background: ${(props) => props.theme.background.main};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
  flex-shrink: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    border-radius: 10px;
    padding: 4px;
    gap: 3px;
  }
`;

const ToggleBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.17s ease;
  font-family: inherit;
  white-space: nowrap;
  background: ${({ $active, theme }) =>
    $active ? theme.primary : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? "#ffffff" : theme.text.secondary};
  box-shadow: ${({ $active, theme }) => ($active ? theme.shadow : "none")};

  .btn-text {
    display: none;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.xs}) {
    padding: 7px 14px;
    gap: 6px;
    .btn-text {
      display: inline;
    }
  }
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    padding: 8px 18px;
    font-size: 13px;
    gap: 7px;
    border-radius: 7px;
  }
  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.primary : theme.primaryLight};
    color: ${({ $active, theme }) => ($active ? "#ffffff" : theme.primary)};
  }
`;

const CalendarCard = styled.div`
  background: ${(props) => props.theme.background.card};
  border-radius: 12px;
  box-shadow: ${(props) => props.theme.shadow};
  border: 1px solid ${(props) => props.theme.border};
  overflow: hidden;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    border-radius: 14px;
  }

  .ant-picker-calendar {
    background: transparent;
    font-family: inherit;
  }

  /* ── Style the built-in Ant header (month/year selects) ── */
  .ant-picker-calendar-header {
    padding: 10px 14px 10px;
    border-bottom: 1px solid ${(props) => props.theme.border};
    background: ${(props) => props.theme.background.header};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      padding: 12px 20px;
    }
  }

  /* Month select */
  .ant-picker-calendar-header .ant-select:first-child .ant-select-selector {
    border-radius: 8px !important;
    border-color: ${(props) => props.theme.border} !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: ${(props) => props.theme.text.primary} !important;
    background: ${(props) => props.theme.background.card} !important;
    min-width: 110px;
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      font-size: 13px !important;
      min-width: 120px;
    }
  }

  /* Year select */
  .ant-picker-calendar-header .ant-select:last-child .ant-select-selector {
    border-radius: 8px !important;
    border-color: ${(props) => props.theme.border} !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: ${(props) => props.theme.text.primary} !important;
    background: ${(props) => props.theme.background.card} !important;
    min-width: 80px;
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      font-size: 13px !important;
      min-width: 90px;
    }
  }

  .ant-picker-calendar-header .ant-select-selector:hover {
    border-color: ${(props) => props.theme.primary} !important;
  }

  .ant-picker-calendar-header .ant-select-focused .ant-select-selector {
    border-color: ${props => props.theme.primary} !important;
    box-shadow: 0 0 0 2px ${props => props.theme.primary}22 !important;
  }

  /* Hide the default Ant Design header completely — we have a custom one */
  .ant-picker-calendar-header {
    display: none !important;
  }

  .ant-picker-content thead th {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${(props) => props.theme.text.light};
    padding: 8px 0 6px;
    background: ${(props) => props.theme.background.header};
    border-bottom: 1px solid ${(props) => props.theme.border};
    text-align: center;
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      font-size: 11px;
      padding: 10px 0 8px;
    }
  }

  .ant-picker-cell {
    padding: 1px;
  }
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    .ant-picker-cell {
      padding: 2px;
    }
  }

  .ant-picker-cell-inner.ant-picker-calendar-date {
    border-radius: 6px;
    margin: 1px;
    transition: background 0.14s;
    border: 1px solid transparent;
    min-height: 42px; /* Reduced for XS */
    @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
      min-height: 64px;
      border-radius: 7px;
    }
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      min-height: 80px;
      border-radius: 8px;
      margin: 2px;
    }
  }

  .ant-picker-cell:hover .ant-picker-cell-inner.ant-picker-calendar-date {
    background: ${(props) => props.theme.primaryLight} !important;
    border-color: ${(props) => props.theme.primary};
  }
  .ant-picker-cell-today .ant-picker-calendar-date-value {
    color: ${(props) => props.theme.primary} !important;
    font-weight: 700;
  }
  .ant-picker-cell-today .ant-picker-cell-inner.ant-picker-calendar-date {
    border-color: ${(props) => props.theme.primary} !important;
    background: ${(props) => props.theme.primaryLight};
  }
  .ant-picker-calendar-date-value {
    font-size: 10px; /* Scaled down for mobile */
    font-weight: 500;
    color: ${(props) => props.theme.text.primary};
    line-height: 1.4;
    padding: 2px 4px;
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      font-size: 13px;
      padding: 4px 6px;
    }
  }
  .ant-picker-calendar-date-content {
    height: auto !important;
    min-height: 20px; /* Reduced for XS */
    overflow: visible;
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      min-height: 44px;
    }
  }
  .ant-picker-cell-selected .ant-picker-cell-inner.ant-picker-calendar-date {
    background: ${(props) => props.theme.primaryLight} !important;
    border-color: ${(props) => props.theme.primary} !important;
  }
  .ant-picker-cell:first-child .ant-picker-calendar-date-value,
  .ant-picker-cell:last-child .ant-picker-calendar-date-value {
    color: ${props => props.theme.text.light};
  }
`;

/* ── Legend + Nav top bar ── */
const CalTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px; /* Slightly reduced gap */
  padding: 10px 12px; /* Slightly more compact padding for mobile */
  border-bottom: 1px solid ${(props) => props.theme.border};
  background: ${(props) => props.theme.background.header};
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    padding: 14px 20px 12px;
    gap: 10px;
  }
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px; /* Reduced for XS */
  font-weight: 500;
  color: ${(props) => props.theme.text.secondary};
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: 12px;
    gap: 6px;
  }
`;

/* ── ‹ Today › nav ── */
const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    gap: 8px;
  }
`;

const NavArrowBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
  background: ${(props) => props.theme.background.card};
  color: ${(props) => props.theme.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.14s;
  flex-shrink: 0;
  &:hover {
    background: ${(props) => props.theme.primaryLight};
    border-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.primary};
  }
  &:active {
    transform: scale(0.95);
  }
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    width: 34px;
    height: 34px;
  }
`;

const MonthLabel = styled.div`
  font-size: 12px; /* Scaled down for XS */
  font-weight: 700;
  color: ${(props) => props.theme.text.primary};
  min-width: 90px;
  text-align: center;
  letter-spacing: -0.2px;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: 15px;
    min-width: 120px;
  }
`;

const TodayButton = styled.button`
  padding: 5px 14px;
  border-radius: 8px;
  border: 1.5px solid ${(props) => props.theme.primary};
  background: ${(props) => props.theme.background.card};
  color: ${(props) => props.theme.primary};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.14s;
  white-space: nowrap;
  &:hover {
    background: ${(props) => props.theme.primary};
    color: #ffffff;
  }
  &:active {
    transform: scale(0.97);
  }
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: 13px;
    padding: 6px 16px;
  }
`;

const CalendarBody = styled.div`
  padding: 4px 6px 8px;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    padding: 8px 12px 12px;
  }
`;

const EventBadgeWrapper = styled.div`
  margin-bottom: 2px;
  cursor: pointer;
  .ant-badge-status-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      width: 6px;
      height: 6px;
    }
  }
  .ant-badge-status-text {
    display: none; /* Hidden on XS by default */
    font-size: 9px;
    font-weight: 500;
    margin-left: 4px;
    color: #4a5568;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 80%;
    vertical-align: middle;
    @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
      display: inline-block;
    }
    @media (min-width: ${(props) => props.theme.breakpoints.md}) {
      font-size: 10.5px;
      max-width: 88%;
      margin-left: 5px;
    }
  }
`;

const MoreCount = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: ${(props) => props.theme.primary};
  padding-left: 10px;
  margin-top: 1px;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    font-size: 10px;
    padding-left: 12px;
  }
`;

const TooltipContent = styled.div`
  min-width: 200px;
  max-width: 280px;
  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    min-width: 230px;
    max-width: 300px;
  }
`;

const TooltipApptBlock = styled.div`
  padding-bottom: 10px;
  margin-bottom: 8px;
  border-bottom: ${({ $last }) => ($last ? "none" : "1px solid #f0f0f0")};
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
`;

const TimeLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${(props) => props.theme.primary};
`;

const PatientName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => props.theme.text.primary};
  display: block;
`;

const ConditionText = styled.div`
  font-size: 11px;
  color: #8c8c8c;
  margin-top: 2px;
  margin-bottom: 4px;
  padding-left: 2px;
`;

const DoctorBlock = styled.div`
  font-size: 11px;
  color: #595959;
  margin-top: 6px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 6px 8px;
  line-height: 1.6;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    case "scheduled":
    default:
      return "processing";
  }
};

const getStatusTagColor = (status, theme) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    case "scheduled":
    default:
      return theme.primary;
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AppointmentCalendar = () => {
  const { userRole } = useAuth();
  const { theme } = useTheme();
  const { patients, list: allAppts, fetchPaged, loading } = useAppointments();
  const role = userRole;
  const isDoctor = role === "DOCTOR" || role === "PROVIDER";

  const {
    rangeLoading,
    fetchByDate,
  } = useCalendar();

  const [viewMode, setViewMode] = useState("list");
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // Unified Control State
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  const listRef = useRef(null);
  const handleRefresh = () => {
    fetchPaged(1);
  };

  const handleNewAppointment = () => {
    if (listRef.current?.openCreate) {
      listRef.current.openCreate();
    }
  };

  useEffect(() => {
    if (viewMode === "calendar") {
      // Data is already handled by allAppts from useAppointments
    }
  }, [viewMode]);

  // ── Nav handlers ─────────────────────────────────────────────────────────
  const goPrev = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const goNext = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToday = () => setCurrentMonth(dayjs());

  const isCurrentMonth = currentMonth.isSame(dayjs(), "month");

  const handleDateClick = (date) => {
    setSelectedDate(date.format("YYYY-MM-DD"));
    fetchByDate(date.format("YYYY-MM-DD"));
  };

  const rangeDict = useMemo(() => {
    const dict = {};
    if (!Array.isArray(allAppts)) return dict;

    const q = (searchText || "").toLowerCase();
    const sFilter = (statusFilter || "all").toLowerCase();

    allAppts.forEach((appt) => {
      // 1. Status Filter
      const status = (appt.status || appt.STATUS || "").toLowerCase();
      const statusMatch = sFilter === "all" || status === sFilter;

      // 2. Search Filter (Patient or Provider Name)
      const patientName = appt.patient_name || appt.patientName || 
                         (typeof appt.patient === 'string' ? appt.patient : appt.patient?.name || "");
      const providerName = appt.provider_name || appt.doctor?.name || "";
      const nameMatch = !q || 
                       String(patientName).toLowerCase().includes(q) || 
                       String(providerName).toLowerCase().includes(q);

      if (statusMatch && nameMatch) {
        const dateStr = dayjs(appt.appointment_date).format("YYYY-MM-DD");
        if (!dict[dateStr]) dict[dateStr] = [];
        dict[dateStr].push({ 
          ...appt,
          time: appt.start_time ? dayjs(appt.start_time, "HH:mm:ss").format("hh:mm A") : "N/A",
          status: appt.status || appt.STATUS
        });
      }
    });
    return dict;
  }, [allAppts, searchText, statusFilter]);

  const filteredTooltipData = useMemo(() => {
    if (!selectedDate) return [];
    return rangeDict[selectedDate] || [];
  }, [selectedDate, rangeDict]);

  const dateCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayAppointments = rangeDict[dateStr] || [];
    if (dayAppointments.length === 0) return null;

    const displayList = dayAppointments.slice(0, 2);
    const moreCount = dayAppointments.length - 2;

    return (
      <Popover
        trigger="click"
        onOpenChange={(visible) => {
          if (visible) handleDateClick(value);
        }}
        title={
          <span
            style={{ fontSize: 13, fontWeight: 700, color: theme.text.primary }}
          >
            {value.format("ddd, D MMM YYYY")}
          </span>
        }
        overlayStyle={{ borderRadius: 12, maxWidth: "90vw" }}
        styles={{
          body: { borderRadius: 12, padding: "10px 12px" },
        }}
        content={
          <StyledSpin spinning={loading}>
            {filteredTooltipData && filteredTooltipData.length > 0 ? (
              <TooltipContent>
                {filteredTooltipData.map((appt, idx) => (
                  <TooltipApptBlock
                    key={idx}
                    $last={idx === filteredTooltipData.length - 1}
                  >
                    <TooltipRow>
                      <TimeLabel>{appt.time}</TimeLabel>
                      <Tag
                        color={getStatusTagColor(appt.status, theme)}
                        style={{
                          margin: 0,
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 20,
                          padding: "0 8px",
                        }}
                      >
                        {appt.status?.toUpperCase()}
                      </Tag>
                    </TooltipRow>

                    <PatientName>
                      {(() => {
                        const directName = appt.patient?.full_name || appt.patient_name || appt.patient;
                        if (directName && directName !== "Unknown Patient") return directName;
                        if (appt.patient_id && patients.length > 0) {
                          const found = patients.find(p => String(p.id) === String(appt.patient_id));
                          if (found) return `${found.first_name || ""} ${found.last_name || ""}`.trim() || found.name;
                        }
                        return directName || `Patient #${appt.patient_id || "?"}`;
                      })()}
                    </PatientName>

                    {appt.patient?.medical_history && (
                      <ConditionText>
                        {appt.patient.medical_history}
                      </ConditionText>
                    )}

                    {!isDoctor && appt.doctor && (
                      <DoctorBlock>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>
                          Dr. {appt.doctor.name}
                        </div>
                        {appt.doctor.phone && <div>📞 {appt.doctor.phone}</div>}
                        {appt.doctor.email && <div>✉️ {appt.doctor.email}</div>}
                      </DoctorBlock>
                    )}
                  </TooltipApptBlock>
                ))}
              </TooltipContent>
            ) : (
              <div
                style={{ padding: "12px 4px", color: theme.text.light, fontSize: 13 }}
              >
                No details available.
              </div>
            )}
          </StyledSpin>
        }
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {displayList.map((appt, idx) => (
            <li key={idx}>
              <EventBadgeWrapper>
                <Badge
                  status={getStatusColor(appt.status)}
                  text={(() => {
                    const time = appt.time ? appt.time.split(" ")[0] : "";
                    let name = appt.patient || appt.patient_name;
                    if ((!name || name === "Unknown Patient") && appt.patient_id && patients.length > 0) {
                       const found = patients.find(p => String(p.id) === String(appt.patient_id));
                       if (found) name = `${found.first_name || ""} ${found.last_name || ""}`.trim() || found.name;
                    }
                    return `${name || `Patient #${appt.patient_id || "?"}`} · ${time}`;
                  })()}
                />
              </EventBadgeWrapper>
            </li>
          ))}
          {moreCount > 0 && <MoreCount>+{moreCount} more</MoreCount>}
        </ul>
      </Popover>
    );
  };

  return (
    <PageWrapper>
      {/* ── Page Header (Unified Controls) ── */}
      <PageHeader>
        <HeaderRow>
          <HeaderLeft>
            <TitleIcon>
              {viewMode === "list" ? (
                <UnorderedListOutlined
                  style={{ fontSize: 16, color: theme.primary }}
                />
              ) : (
                <CalendarOutlined style={{ fontSize: 16, color: theme.primary }} />
              )}
            </TitleIcon>
            <PageTitle>Appointment Management</PageTitle>
          </HeaderLeft>

          {/* Desktop Only: Inline Controls */}
          <Space size="middle" className="desktop-only">
            <SearchWrapper>
              <SearchInput
                placeholder="Search..."
                prefix={<SearchOutlined style={{ color: theme.text.light }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </SearchWrapper>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FilterOutlined style={{ color: theme.primary }} />
              <StatusSelect
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
                style={{ width: 140 }}
              >
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="scheduled">Scheduled</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
              </StatusSelect>
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              disabled={loading}
              style={{ borderRadius: "8px" }}
            />

            <ViewToggle>
              <ToggleBtn
                $active={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                <UnorderedListOutlined />
              </ToggleBtn>
              <ToggleBtn
                $active={viewMode === "calendar"}
                onClick={() => setViewMode("calendar")}
              >
                <CalendarOutlined />
              </ToggleBtn>
            </ViewToggle>

            {role !== "PATIENT" && (
              <AppButton
                variant="header"
                icon={<PlusOutlined />}
                onClick={handleNewAppointment}
              >
                New Appointment
              </AppButton>
            )}
          </Space>

          <style>{`
            .desktop-only { display: none !important; }
            @media (min-width: ${theme.breakpoints.lg}) {
              .desktop-only { display: flex !important; }
            }
          `}</style>
        </HeaderRow>

        {/* Mobile View: Row 2 (Toggle + Search) */}
        <MobileRow>
          <ViewToggle>
            <ToggleBtn
              $active={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              <UnorderedListOutlined />
              <span className="btn-text">List</span>
            </ToggleBtn>
            <ToggleBtn
              $active={viewMode === "calendar"}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarOutlined />
              <span className="btn-text">Cal</span>
            </ToggleBtn>
          </ViewToggle>

          <SearchWrapper style={{ flex: 1, minWidth: 0, maxWidth: "160px" }}>
            <SearchInput
              placeholder="Search..."
              prefix={<SearchOutlined style={{ color: theme.text.light }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </SearchWrapper>

          {role !== "PATIENT" && (
            <AppButton
              variant="header"
              icon={<PlusOutlined />}
              onClick={handleNewAppointment}
              style={{ padding: "8px 12px", borderRadius: "8px" }}
            >
              Add
            </AppButton>
          )}
        </MobileRow>

        {/* Mobile View: Row 3 (Filter + Refresh) */}
        <MobileRow style={{ backgroundColor: "#fbfcfe" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
            }}
          >
            <FilterOutlined style={{ color: theme.primary }} />
            <StatusSelect
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ flex: 1 }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="scheduled">Scheduled</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </StatusSelect>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            disabled={loading}
            style={{ borderRadius: "8px" }}
          >
            Refresh
          </Button>
        </MobileRow>
      </PageHeader>

      {/* ── Content ── */}
      <div style={{ display: viewMode === "list" ? "block" : "none" }}>
        <AppointmentList
          ref={listRef}
          searchText={searchText}
          statusFilter={statusFilter}
        />
      </div>

      {viewMode === "calendar" && (
        <CalendarCard>
          {/* Row 1 — Legend + ‹ Month Year › + Today */}
          <CalTopBar>
            <LegendRow>
              <LegendItem>
                <Badge status="processing" />
                <span>Scheduled</span>
              </LegendItem>
              <LegendItem>
                <Badge status="success" />
                <span>Completed</span>
              </LegendItem>
              <LegendItem>
                <Badge status="error" />
                <span>Cancelled</span>
              </LegendItem>
            </LegendRow>

            <MonthNav>
              <NavArrowBtn onClick={goPrev} title="Previous month">
                <LeftOutlined style={{ fontSize: 11 }} />
              </NavArrowBtn>

              <MonthLabel>{currentMonth.format("MMMM YYYY")}</MonthLabel>

              <NavArrowBtn onClick={goNext} title="Next month">
                <RightOutlined style={{ fontSize: 11 }} />
              </NavArrowBtn>

              {!isCurrentMonth && (
                <TodayButton onClick={goToday}>Today</TodayButton>
              )}
            </MonthNav>
          </CalTopBar>

          {/* Row 2 — Ant Design month/year selects (styled, radio hidden) */}
          <CalendarBody>
            <Spin spinning={rangeLoading}>
              <Calendar
                cellRender={dateCellRender}
                headerRender={() => null} // Default header hidden in CSS, but this is an extra layer of safety
                value={currentMonth}
                onChange={setCurrentMonth}
              />
            </Spin>
          </CalendarBody>
        </CalendarCard>
      )}
    </PageWrapper>
  );
};

export default AppointmentCalendar;
