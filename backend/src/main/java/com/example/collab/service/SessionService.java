package com.example.collab.service;

import com.example.collab.dto.SessionDto;
import com.example.collab.dto.UserDto;
import com.example.collab.entity.Project;
import com.example.collab.entity.Session;
import com.example.collab.entity.User;
import com.example.collab.repository.ProjectRepository;
import com.example.collab.repository.SessionRepository;
import com.example.collab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Autowired
    public SessionService(SessionRepository sessionRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SessionDto createSession(String sessionCode, String sessionName, Long projectId, Long createdById) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project with ID " + projectId + " not found"));
        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + createdById + " not found"));

        String code = (sessionCode != null && !sessionCode.trim().isEmpty())
                ? sessionCode.trim().toUpperCase()
                : "SESSION-" + (100 + sessionRepository.count() + 1);

        // Ensure uniqueness if manually provided
        if (sessionRepository.findBySessionCode(code).isPresent()) {
            code = code + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }

        String name = (sessionName != null && !sessionName.trim().isEmpty())
                ? sessionName.trim()
                : project.getName() + " Collaboration Session";

        Session session = new Session(code, name, project, creator);
        Session saved = sessionRepository.save(session);

        return toDto(saved);
    }

    public List<SessionDto> getAllSessions() {
        return sessionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<SessionDto> getSessionById(Long id) {
        return sessionRepository.findById(id).map(this::toDto);
    }

    public Optional<SessionDto> getSessionByCode(String sessionCode) {
        return sessionRepository.findBySessionCode(sessionCode.trim().toUpperCase()).map(this::toDto);
    }

    @Transactional
    public Optional<SessionDto> joinSession(Long sessionId, Long userId) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (sessionOpt.isPresent() && userOpt.isPresent()) {
            Session session = sessionOpt.get();
            session.getParticipants().add(userOpt.get());
            Session updated = sessionRepository.save(session);
            return Optional.of(toDto(updated));
        }
        return Optional.empty();
    }

    @Transactional
    public Optional<SessionDto> leaveSession(Long sessionId, Long userId) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (sessionOpt.isPresent() && userOpt.isPresent()) {
            Session session = sessionOpt.get();
            session.getParticipants().remove(userOpt.get());
            Session updated = sessionRepository.save(session);
            return Optional.of(toDto(updated));
        }
        return Optional.empty();
    }

    public SessionDto toDto(Session session) {
        List<UserDto> participantDtos = session.getParticipants().stream()
                .map(u -> new UserDto(u.getId(), u.getUsername(), u.getEmail()))
                .collect(Collectors.toList());

        return new SessionDto(
                session.getId(),
                session.getSessionCode(),
                session.getSessionName(),
                session.getProject().getId(),
                session.getProject().getName(),
                session.getCreatedBy().getId(),
                session.getCreatedBy().getUsername(),
                session.getStatus(),
                session.getCreatedAt(),
                participantDtos
        );
    }
}
