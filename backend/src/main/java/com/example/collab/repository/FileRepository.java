package com.example.collab.repository;

import com.example.collab.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByProjectIdOrderByNameAsc(Long projectId);
    Optional<FileEntity> findByProjectIdAndName(Long projectId, String name);
    boolean existsByProjectIdAndName(Long projectId, String name);
}
