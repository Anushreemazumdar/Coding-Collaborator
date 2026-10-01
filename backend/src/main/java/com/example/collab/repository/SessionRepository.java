package com.example.collab.repository;

import com.example.collab.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findBySessionCode(String sessionCode);
    List<Session> findByProjectId(Long projectId);
    List<Session> findAllByOrderByCreatedAtDesc();
}
