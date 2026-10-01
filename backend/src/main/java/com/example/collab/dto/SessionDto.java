package com.example.collab.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SessionDto {
    private Long id;
    private String sessionCode;
    private String sessionName;
    private Long projectId;
    private String projectName;
    private Long createdById;
    private String createdByUsername;
    private String status;
    private LocalDateTime createdAt;
    private List<UserDto> participants;

    public SessionDto() {}

    public SessionDto(Long id, String sessionCode, String sessionName, Long projectId, String projectName,
                      Long createdById, String createdByUsername, String status, LocalDateTime createdAt, List<UserDto> participants) {
        this.id = id;
        this.sessionCode = sessionCode;
        this.sessionName = sessionName;
        this.projectId = projectId;
        this.projectName = projectName;
        this.createdById = createdById;
        this.createdByUsername = createdByUsername;
        this.status = status;
        this.createdAt = createdAt;
        this.participants = participants;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSessionCode() {
        return sessionCode;
    }

    public void setSessionCode(String sessionCode) {
        this.sessionCode = sessionCode;
    }

    public String getSessionName() {
        return sessionName;
    }

    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<UserDto> getParticipants() {
        return participants;
    }

    public void setParticipants(List<UserDto> participants) {
        this.participants = participants;
    }
}
