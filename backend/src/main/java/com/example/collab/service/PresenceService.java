package com.example.collab.service;

import com.example.collab.dto.UserDto;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    // Map: sessionId -> Set of active UserDto
    private final Map<Long, Map<Long, UserDto>> sessionActiveUsers = new ConcurrentHashMap<>();

    public synchronized List<UserDto> userJoined(Long sessionId, Long userId, String username, String email) {
        sessionActiveUsers.computeIfAbsent(sessionId, k -> new ConcurrentHashMap<>());
        sessionActiveUsers.get(sessionId).put(userId, new UserDto(userId, username, email));
        return getActiveUsers(sessionId);
    }

    public synchronized List<UserDto> userLeft(Long sessionId, Long userId) {
        if (sessionActiveUsers.containsKey(sessionId)) {
            sessionActiveUsers.get(sessionId).remove(userId);
            if (sessionActiveUsers.get(sessionId).isEmpty()) {
                sessionActiveUsers.remove(sessionId);
                return Collections.emptyList();
            }
            return getActiveUsers(sessionId);
        }
        return Collections.emptyList();
    }

    public List<UserDto> getActiveUsers(Long sessionId) {
        Map<Long, UserDto> users = sessionActiveUsers.get(sessionId);
        if (users != null) {
            return new ArrayList<>(users.values());
        }
        return Collections.emptyList();
    }
}
