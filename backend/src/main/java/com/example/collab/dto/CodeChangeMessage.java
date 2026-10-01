package com.example.collab.dto;

public class CodeChangeMessage {
    private Long sessionId;
    private Long fileId;
    private Long userId;
    private String username;
    private String content;
    private Long version;
    private Integer cursorLine;
    private Integer cursorColumn;

    public CodeChangeMessage() {}

    public CodeChangeMessage(Long sessionId, Long fileId, Long userId, String username, String content) {
        this.sessionId = sessionId;
        this.fileId = fileId;
        this.userId = userId;
        this.username = username;
        this.content = content;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Integer getCursorLine() {
        return cursorLine;
    }

    public void setCursorLine(Integer cursorLine) {
        this.cursorLine = cursorLine;
    }

    public Integer getCursorColumn() {
        return cursorColumn;
    }

    public void setCursorColumn(Integer cursorColumn) {
        this.cursorColumn = cursorColumn;
    }
}
