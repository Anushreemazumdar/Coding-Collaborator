package com.example.collab.controller;

import com.example.collab.dto.SessionDto;
import com.example.collab.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    private final SessionService sessionService;

    @Autowired
    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> payload) {
        try {
            String sessionCode = (String) payload.get("sessionCode");
            String sessionName = (String) payload.get("sessionName");
            Long projectId = Long.valueOf(payload.get("projectId").toString());
            Long createdById = Long.valueOf(payload.get("createdById").toString());

            SessionDto session = sessionService.createSession(sessionCode, sessionName, projectId, createdById);
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create session: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<SessionDto>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSessionById(@PathVariable Long id) {
        return sessionService.getSessionById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Session not found with id " + id)));
    }

    @GetMapping("/code/{sessionCode}")
    public ResponseEntity<?> getSessionByCode(@PathVariable String sessionCode) {
        return sessionService.getSessionByCode(sessionCode)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Session not found with code " + sessionCode)));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinSession(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            return sessionService.joinSession(id, userId)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Session or user not found")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveSession(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            return sessionService.leaveSession(id, userId)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Session or user not found")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID: " + e.getMessage()));
        }
    }
}
