import React, { useEffect, useState } from "react";
import { Badge, Popover, Typography, Button, Empty, Tag, Tooltip } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useNotification from "../../hooks/useNotification";
import { useTheme } from "../../context/ThemeContext";
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
    background: ${props => props.theme.primaryLight};
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
  background: ${(props) => (props.$unread ? props.theme.primaryLight : "transparent")};
  border-left: 3px solid ${(props) => (props.$unread ? props.theme.primary : "transparent")};
  &:hover {
    background: ${props => props.theme.primaryLight};
  }
`;

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
    deleteNotification,
  } = useNotification();
  const { theme } = useTheme();

  const typeColors = {
    appointment: theme.primary,
    payment: theme.status.success,
    prescription: theme.secondary,
    system: theme.status.warning,
  };
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
    <div style={{ width: "100%", maxWidth: 340, minWidth: 280 }}>
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

      <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: "4px" }}>
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
            style={{ padding: "24px 0" }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {notifications.map((notif) => (
              <NotifItem
                key={notif.id}
                $unread={!notif.is_read}
                onClick={() => handleClickNotif(notif)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Tag 
                    color={typeColors[notif.type] || "default"} 
                    style={{ 
                      textTransform: "capitalize", 
                      fontSize: 10, 
                      borderRadius: "12px",
                      padding: "0 10px",
                      fontWeight: 600,
                      border: 'none'
                    }}
                  >
                    {notif.type}
                  </Tag>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(notif.created_at).fromNow()}
                    </Text>
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        style={{ padding: 0, height: 20, width: 20, minWidth: 20 }}
                      />
                    </Tooltip>
                  </div>
                </div>
                <Text strong style={{ fontSize: 13, display: "block" }}>{notif.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{notif.message}</Text>
              </NotifItem>
            ))}
          </div>
        )}
      </div>
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
          <BellOutlined style={{ fontSize: 20, color: theme.secondary }} />
        </Badge>
      </BellButton>
    </Popover>
  );
};

export default NotificationBell;
