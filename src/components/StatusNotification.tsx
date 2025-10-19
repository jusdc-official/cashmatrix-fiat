import React from 'react';

interface StatusCardProps {
  status: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  return <div className="status-card">{status}</div>;
};

interface NotificationProps {
  message: string;
}

export const Notification: React.FC<NotificationProps> = ({ message }) => {
  return <div className="notification">{message}</div>;
};
