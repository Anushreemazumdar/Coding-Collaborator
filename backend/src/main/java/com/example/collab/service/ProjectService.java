package com.example.collab.service;

import com.example.collab.dto.ProjectDto;
import com.example.collab.entity.FileEntity;
import com.example.collab.entity.Project;
import com.example.collab.entity.User;
import com.example.collab.repository.FileRepository;
import com.example.collab.repository.ProjectRepository;
import com.example.collab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final FileRepository fileRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, FileRepository fileRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
    }

    @Transactional
    public ProjectDto createProject(String name, String description, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + ownerId + " not found"));

        Project project = new Project(name, description, owner);
        Project saved = projectRepository.save(project);

        // Create a default initial file e.g. Main.java
        FileEntity defaultFile = new FileEntity(
                saved,
                "Main.java",
                "java",
                "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, Collaborative World!\");\n    }\n}\n"
        );
        fileRepository.save(defaultFile);

        return toDto(saved, 1);
    }

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> toDto(p, fileRepository.findByProjectIdOrderByNameAsc(p.getId()).size()))
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getProjectsByOwner(Long ownerId) {
        return projectRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(p -> toDto(p, fileRepository.findByProjectIdOrderByNameAsc(p.getId()).size()))
                .collect(Collectors.toList());
    }

    public Optional<ProjectDto> getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(p -> toDto(p, fileRepository.findByProjectIdOrderByNameAsc(p.getId()).size()));
    }

    @Transactional
    public boolean deleteProject(Long id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private ProjectDto toDto(Project project, int fileCount) {
        return new ProjectDto(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getId(),
                project.getOwner().getUsername(),
                project.getCreatedAt(),
                fileCount
        );
    }
}
