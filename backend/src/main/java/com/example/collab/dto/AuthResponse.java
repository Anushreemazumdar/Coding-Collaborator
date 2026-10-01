package com.example.collab.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String username;
    private String email;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, Long userId, String username, String email) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.username = username;
        this.email = email;
    }

    public static AuthResponse success(Long userId, String username, String email, String message) {
        return new AuthResponse(true, message, userId, username, email);
    }

    public static AuthResponse error(String message) {
        return new AuthResponse(false, message, null, null, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
