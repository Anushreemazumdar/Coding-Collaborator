package com.example.collab.dto;

import java.util.List;

public class PresenceMessage {
    private Long sessionId;
    private Long userId;
    private String username;
    private ActionType action;
    private List<UserDto> activeUsers;

    public enum ActionType {
        JOIN,
        LEAVE,
        SYNC
    }

    public PresenceMessage() {}

    public PresenceMessage(Long sessionId, Long userId, String username, ActionType action, List<UserDto> activeUsers) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.activeUsers = activeUsers;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public ActionType getAction() {
        return action;
    }

    public void setAction(ActionType action) {
        this.action = action;
    }

    public List<UserDto> getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(List<UserDto> activeUsers) {
        this.activeUsers = activeUsers;
    }
}
