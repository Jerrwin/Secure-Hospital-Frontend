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
  Space 
} from "antd";

import useAuth from "../../modules/auth/hooks/useAuth";
import useCalendar from "../../modules/calendar/hooks/useCalendar";
import useAppointments from "../../modules/appointments/hooks/useAppointments";
import AppointmentList from "./AppointmentList";

const { Option } = Select;

// ─── Breakpoints ──────────────────────────────────────────────────────────────
const bp = {
  xs: "480px",
  sm: "576px",
  md: "768px",
  lg: "992px",
  xl: "1200px",
};

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (min-width: ${bp.md}) { gap: 20px; }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;

  @media (min-width: ${bp.md}) {
    border-radius: 14px;
  }
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
    border-bottom: 1px solid #f1f5f9;
  }
`;

const MobileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 16px;
  border-bottom: 1px solid #f1f5f9;
  
  @media (min-width: ${bp.lg}) {
    display: none; // Hidden on desktop, moved into HeaderRow
  }
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 0;
  @media (min-width: ${bp.md}) {
    max-width: 320px;
  }
`;

const SearchInput = styled(Input)`
  border-radius: 8px;
  width: 100%;
`;

const StatusSelect = styled(Select)`
  min-width: 140px;
  .ant-select-selector {
    border-radius: 8px !important;
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
  background: #e8f0fe;
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
  color: #1e3a5f;
  margin: 0;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (min-width: ${bp.sm}) { font-size: 17px; }
  @media (min-width: ${bp.md}) { font-size: 18px; }
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
  flex-shrink: 0;
  @media (min-width: ${bp.md}) {
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
  background: ${({ $active }) => ($active ? "#1677ff" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#64748b")};
  box-shadow: ${({ $active }) =>
    $active ? "0 2px 8px rgba(22,119,255,0.25)" : "none"};

  .btn-text { display: none; }

  @media (min-width: ${bp.xs}) {
    padding: 7px 14px;
    gap: 6px;
    .btn-text { display: inline; }
  }
  @media (min-width: ${bp.md}) {
    padding: 8px 18px;
    font-size: 13px;
    gap: 7px;
    border-radius: 7px;
  }
  &:hover {
    background: ${({ $active }) => ($active ? "#1677ff" : "#e2e8f0")};
    color: ${({ $active }) => ($active ? "#ffffff" : "#1e3a5f")};
  }
`;

const CalendarCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(30, 58, 95, 0.07);
  border: 1px solid #eef2f8;
  overflow: hidden;
  @media (min-width: ${bp.md}) { border-radius: 14px; }

  .ant-picker-calendar {
    background: transparent;
    font-family: inherit;
  }

  /* ── Style the built-in Ant header (month/year selects) ── */
  .ant-picker-calendar-header {
    padding: 10px 14px 10px;
    border-bottom: 1px solid #eef2f8;
    background: #fafbfe;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
    @media (min-width: ${bp.md}) {
      padding: 12px 20px;
    }
  }

  /* Month select */
  .ant-picker-calendar-header .ant-select:first-child .ant-select-selector {
    border-radius: 8px !important;
    border-color: #e2e8f0 !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #1e3a5f !important;
    background: #ffffff !important;
    min-width: 110px;
    @media (min-width: ${bp.md}) {
      font-size: 13px !important;
      min-width: 120px;
    }
  }

  /* Year select */
  .ant-picker-calendar-header .ant-select:last-child .ant-select-selector {
    border-radius: 8px !important;
    border-color: #e2e8f0 !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #1e3a5f !important;
    background: #ffffff !important;
    min-width: 80px;
    @media (min-width: ${bp.md}) {
      font-size: 13px !important;
      min-width: 90px;
    }
  }

  .ant-picker-calendar-header .ant-select-selector:hover {
    border-color: #1677ff !important;
  }

  .ant-picker-calendar-header .ant-select-focused .ant-select-selector {
    border-color: #1677ff !important;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
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
    color: #94a3b8;
    padding: 8px 0 6px;
    background: #fafbfe;
    border-bottom: 1px solid #eef2f8;
    text-align: center;
    @media (min-width: ${bp.md}) {
      font-size: 11px;
      padding: 10px 0 8px;
    }
  }

  .ant-picker-cell { padding: 1px; }
  @media (min-width: ${bp.md}) {
    .ant-picker-cell { padding: 2px; }
  }

  .ant-picker-cell-inner.ant-picker-calendar-date {
    border-radius: 6px;
    margin: 1px;
    transition: background 0.14s;
    border: 1px solid transparent;
    min-height: 42px; /* Reduced for XS */
    @media (min-width: ${bp.sm}) {
      min-height: 64px;
      border-radius: 7px;
    }
    @media (min-width: ${bp.md}) {
      min-height: 80px;
      border-radius: 8px;
      margin: 2px;
    }
  }

  .ant-picker-cell:hover .ant-picker-cell-inner.ant-picker-calendar-date {
    background: #f0f5ff !important;
    border-color: #c7d9f7;
  }
  .ant-picker-cell-today .ant-picker-calendar-date-value {
    color: #1677ff !important;
    font-weight: 700;
  }
  .ant-picker-cell-today .ant-picker-cell-inner.ant-picker-calendar-date {
    border-color: #1677ff !important;
    background: #f0f5ff;
  }
  .ant-picker-calendar-date-value {
    font-size: 10px; /* Scaled down for mobile */
    font-weight: 500;
    color: #374151;
    line-height: 1.4;
    padding: 2px 4px;
    @media (min-width: ${bp.md}) {
      font-size: 13px;
      padding: 4px 6px;
    }
  }
  .ant-picker-calendar-date-content {
    height: auto !important;
    min-height: 20px; /* Reduced for XS */
    overflow: visible;
    @media (min-width: ${bp.md}) { min-height: 44px; }
  }
  .ant-picker-cell-selected .ant-picker-cell-inner.ant-picker-calendar-date {
    background: #e8f0fe !important;
    border-color: #1677ff !important;
  }
  .ant-picker-cell:first-child .ant-picker-calendar-date-value,
  .ant-picker-cell:last-child .ant-picker-calendar-date-value {
    color: #94a3b8;
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
  border-bottom: 1px solid #eef2f8;
  background: #fafbfe;
  @media (min-width: ${bp.md}) { 
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
  color: #555;
  @media (min-width: ${bp.md}) {
    font-size: 12px;
    gap: 6px;
  }
`;

/* ── ‹ Today › nav ── */
const MonthNav = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  @media (min-width: ${bp.md}) { gap: 8px; }
`;

const NavArrowBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.14s;
  flex-shrink: 0;
  &:hover {
    background: #e8f0fe;
    border-color: #b3ccf8;
    color: #1677ff;
  }
  &:active { transform: scale(0.95); }
  @media (min-width: ${bp.md}) {
    width: 34px;
    height: 34px;
  }
`;

const MonthLabel = styled.div`
  font-size: 12px; /* Scaled down for XS */
  font-weight: 700;
  color: #1e3a5f;
  min-width: 90px;
  text-align: center;
  letter-spacing: -0.2px;
  @media (min-width: ${bp.md}) {
    font-size: 15px;
    min-width: 120px;
  }
`;

const TodayButton = styled.button`
  padding: 5px 14px;
  border-radius: 8px;
  border: 1.5px solid #1677ff;
  background: #ffffff;
  color: #1677ff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.14s;
  white-space: nowrap;
  &:hover {
    background: #1677ff;
    color: #ffffff;
  }
  &:active { transform: scale(0.97); }
  @media (min-width: ${bp.md}) {
    font-size: 13px;
    padding: 6px 16px;
  }
`;

const CalendarBody = styled.div`
  padding: 4px 6px 8px;
  @media (min-width: ${bp.md}) { padding: 8px 12px 12px; }
`;

const EventBadgeWrapper = styled.div`
  margin-bottom: 2px;
  cursor: pointer;
  .ant-badge-status-dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    @media (min-width: ${bp.md}) { width: 6px; height: 6px; }
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
    @media (min-width: ${bp.sm}) {
      display: inline-block;
    }
    @media (min-width: ${bp.md}) {
      font-size: 10.5px;
      max-width: 88%;
      margin-left: 5px;
    }
  }
`;

const MoreCount = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: #1677ff;
  padding-left: 10px;
  margin-top: 1px;
  @media (min-width: ${bp.md}) {
    font-size: 10px;
    padding-left: 12px;
  }
`;

const TooltipContent = styled.div`
  min-width: 200px;
  max-width: 280px;
  @media (min-width: ${bp.md}) {
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
  color: #1677ff;
`;

const PatientName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #1e3a5f;
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
    case "completed": return "success";
    case "cancelled": return "error";
    case "scheduled":
    default: return "processing";
  }
};

const getStatusTagColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed": return "green";
    case "cancelled": return "red";
    case "scheduled":
    default: return "blue";
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AppointmentCalendar = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  const isDoctor = role === "DOCTOR" || role === "PROVIDER";

  const {
    rangeData,
    tooltipData,
    rangeLoading,
    tooltipLoading,
    fetchRange,
    fetchByDate,
  } = useCalendar();

  const [viewMode, setViewMode] = useState("list");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  
  // Unified Control State
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const listRef = useRef(null);
  const { fetchAll, loading } = useAppointments();

  const handleRefresh = () => {
    fetchAll();
  };

  const handleNewAppointment = () => {
    if (listRef.current?.openCreate) {
      listRef.current.openCreate();
    }
  };

  useEffect(() => {
    if (viewMode === "calendar") {
      const start = currentMonth.startOf("month").format("YYYY-MM-DD");
      const end   = currentMonth.endOf("month").format("YYYY-MM-DD");
      fetchRange(start, end);
    }
  }, [currentMonth, viewMode, fetchRange]);

  // ── Nav handlers ─────────────────────────────────────────────────────────
  const goPrev  = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const goNext  = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToday = () => setCurrentMonth(dayjs());

  const isCurrentMonth = currentMonth.isSame(dayjs(), "month");

  const handleDateClick = (date) => {
    fetchByDate(date.format("YYYY-MM-DD"));
  };

  const rangeDict = useMemo(() => {
    const dict = {};
    if (!Array.isArray(rangeData)) return dict;
    
    const q = (searchText || "").toLowerCase();
    const sFilter = (statusFilter || "all").toLowerCase();

    rangeData.forEach((dayGroup) => {
      // Apply Search and Status filters to each day's appointments
      const filtered = (dayGroup.appointments || []).filter(appt => {
        // 1. Status Filter
        const statusMatch = sFilter === "all" || (appt.status || "").toLowerCase() === sFilter;
        
        // 2. Search Filter (Patient Name)
        const nameMatch = !q || (appt.patient || "").toLowerCase().includes(q);

        return statusMatch && nameMatch;
      });

      dict[dayGroup.date] = filtered;
    });
    return dict;
  }, [rangeData, searchText, statusFilter]);

  const dateCellRender = (value) => {
    const dateStr         = value.format("YYYY-MM-DD");
    const dayAppointments = rangeDict[dateStr] || [];
    if (dayAppointments.length === 0) return null;

    const displayList = dayAppointments.slice(0, 2);
    const moreCount   = dayAppointments.length - 2;

    return (
      <Popover
        trigger="click"
        onOpenChange={(visible) => { if (visible) handleDateClick(value); }}
        title={
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f" }}>
            {value.format("ddd, D MMM YYYY")}
          </span>
        }
        overlayStyle={{ borderRadius: 12, maxWidth: "90vw" }}
        styles={{
          body: { borderRadius: 12, padding: "10px 12px" }
        }}
        content={
          <Spin spinning={tooltipLoading}>
            {tooltipData && tooltipData.length > 0 ? (
              <TooltipContent>
                {tooltipData.map((appt, idx) => (
                  <TooltipApptBlock
                    key={idx}
                    $last={idx === tooltipData.length - 1}
                  >
                    <TooltipRow>
                      <TimeLabel>{appt.time}</TimeLabel>
                      <Tag
                        color={getStatusTagColor(appt.status)}
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
                      {appt.patient?.full_name || "Unknown Patient"}
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
              <div style={{ padding: "12px 4px", color: "#94a3b8", fontSize: 13 }}>
                No details available.
              </div>
            )}
          </Spin>
        }
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {displayList.map((appt, idx) => (
            <li key={idx}>
              <EventBadgeWrapper>
                <Badge
                  status={getStatusColor(appt.status)}
                  text={`${appt.patient} · ${appt.time.split(" ")[0]}`}
                />
              </EventBadgeWrapper>
            </li>
          ))}
          {moreCount > 0 && (
            <MoreCount>+{moreCount} more</MoreCount>
          )}
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
                  style={{ fontSize: 16, color: "#1677ff" }}
                />
              ) : (
                <CalendarOutlined style={{ fontSize: 16, color: "#1677ff" }} />
              )}
            </TitleIcon>
            <PageTitle>Appointment Management</PageTitle>
          </HeaderLeft>

          {/* Desktop Only: Inline Controls */}
          <Space size="middle" className="desktop-only" style={{ display: "none" }}>
            <SearchWrapper>
              <SearchInput
                placeholder="Search..."
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </SearchWrapper>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FilterOutlined style={{ color: "#1677ff" }} />
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNewAppointment}
                style={{ borderRadius: "8px", height: "38px", fontWeight: 600 }}
              >
                New Appointment
              </Button>
            )}
          </Space>
          
          <style>{`
            @media (min-width: ${bp.lg}) {
              .desktop-only { display: flex !important; }
            }
          `}</style>
        </HeaderRow>

        {/* Mobile View: Row 2 (Actions) */}
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

          {role !== "PATIENT" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewAppointment}
              style={{ borderRadius: "8px", height: "36px", fontWeight: 600 }}
            >
              New Appt
            </Button>
          )}
        </MobileRow>

        {/* Mobile View: Row 3 (Search) */}
        <MobileRow>
          <SearchWrapper>
            <SearchInput
              placeholder="Search by Doctor or Patient..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </SearchWrapper>
        </MobileRow>

        {/* Mobile View: Row 4 (Filter + Refresh) */}
        <MobileRow style={{ backgroundColor: "#fbfcfe" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
            <FilterOutlined style={{ color: "#1677ff" }} />
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
              <LegendItem><Badge status="processing" /><span>Scheduled</span></LegendItem>
              <LegendItem><Badge status="success"    /><span>Completed</span></LegendItem>
              <LegendItem><Badge status="error"      /><span>Cancelled</span></LegendItem>
            </LegendRow>

            <MonthNav>
              <NavArrowBtn onClick={goPrev} title="Previous month">
                <LeftOutlined style={{ fontSize: 11 }} />
              </NavArrowBtn>

              <MonthLabel>
                {currentMonth.format("MMMM YYYY")}
              </MonthLabel>

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