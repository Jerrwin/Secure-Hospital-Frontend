import React, { useEffect, useState } from "react";
import { Badge, Popover, Typography, Button, Empty, Tag } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useNotification from "../../hooks/useNotification";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import styled from "styled-components";

dayjs.extend(relativeTime);

const { Text } = Typography;

const BellButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
  &:hover {
    background: rgba(37, 99, 235, 0.1);
  }
`;

const NotifHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
`;

const NotifItem = styled.div`
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  background: ${(props) => (props.$unread ? "rgba(37, 99, 235, 0.06)" : "transparent")};
  border-left: 3px solid ${(props) => (props.$unread ? "#2563eb" : "transparent")};
  &:hover {
    background: rgba(37, 99, 235, 0.1);
  }
`;

const typeColors = {
  appointment: "blue",
  payment: "green",
  prescription: "purple",
  system: "orange",
};

const typeRoutes = {
  appointment: "/appointments",
  payment: "/billing",
  prescription: "/prescriptions",
  system: "/dashboard",
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotification();
  const [open, setOpen] = useState(false);

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleClickNotif = (notif) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    setOpen(false);
    const route = typeRoutes[notif.type] || "/dashboard";
    navigate(route);
  };

  const content = (
    <div style={{ width: "100%", maxWidth: 340, minWidth: 280, maxHeight: 420, overflowY: "auto" }}>
      <NotifHeader>
        <Text strong style={{ fontSize: 15 }}>Notifications</Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
          >
            Mark all read
          </Button>
        )}
      </NotifHeader>

      {notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No notifications"
          style={{ padding: "24px 0" }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {notifications.map((notif) => (
            <NotifItem
              key={notif.id}
              $unread={!notif.is_read}
              onClick={() => handleClickNotif(notif)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <Tag color={typeColors[notif.type] || "default"} style={{ textTransform: "capitalize", fontSize: 11 }}>
                  {notif.type}
                </Tag>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {dayjs(notif.created_at).fromNow()}
                </Text>
              </div>
              <Text strong style={{ fontSize: 13, display: "block" }}>{notif.title}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{notif.message}</Text>
            </NotifItem>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
    >
      <BellButton>
        <Badge count={unreadCount} size="small" offset={[2, -2]}>
          <BellOutlined style={{ fontSize: 20, color: "#1e3a8a" }} />
        </Badge>
      </BellButton>
    </Popover>
  );
};

export default NotificationBell;
