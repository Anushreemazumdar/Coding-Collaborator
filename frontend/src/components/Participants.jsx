import React from 'react';
import { Users, Circle } from 'lucide-react';

export function Participants({ participants = [], currentUserId }) {
  const getAvatarColor = (id) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
      '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#84cc16'
    ];
    return colors[(id || 0) % colors.length];
  };

  return (
    <div className="participants-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Users size={15} />
          <span>Participants ({participants.length})</span>
        </div>
      </div>

      <div className="participants-list">
        {participants.length === 0 ? (
          <div className="empty-participants">No active users</div>
        ) : (
          participants.map((user) => {
            const isMe = user.id === currentUserId;
            return (
              <div key={user.id} className="participant-item">
                <div
                  className="participant-avatar"
                  style={{ backgroundColor: getAvatarColor(user.id) }}
                >
                  {user.username.charAt(0).toUpperCase()}
                  <span className="online-dot"></span>
                </div>
                <div className="participant-info">
                  <span className="participant-name">
                    {user.username} {isMe && <span className="me-tag">(You)</span>}
                  </span>
                  <span className="participant-status">Online</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
