package com.example.collab.service;

import com.example.collab.dto.FileDto;
import com.example.collab.entity.FileEntity;
import com.example.collab.entity.Project;
import com.example.collab.repository.FileRepository;
import com.example.collab.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final ProjectRepository projectRepository;

    @Autowired
    public FileService(FileRepository fileRepository, ProjectRepository projectRepository) {
        this.fileRepository = fileRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional
    public FileDto createFile(Long projectId, String name, String content) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project with ID " + projectId + " not found"));

        String cleanName = (name != null && !name.trim().isEmpty()) ? name.trim() : "Untitled.txt";
        String extension = extractExtension(cleanName);

        // Check if file already exists in this project
        if (fileRepository.existsByProjectIdAndName(projectId, cleanName)) {
            cleanName = generateUniqueFileName(projectId, cleanName);
        }

        String initialContent = content != null ? content : getDefaultContent(extension);
        FileEntity fileEntity = new FileEntity(project, cleanName, extension, initialContent);
        FileEntity saved = fileRepository.save(fileEntity);

        return toDto(saved);
    }

    public List<FileDto> getFilesByProject(Long projectId) {
        return fileRepository.findByProjectIdOrderByNameAsc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<FileDto> getFileById(Long id) {
        return fileRepository.findById(id).map(this::toDto);
    }

    @Transactional
    public Optional<FileDto> updateFileContent(Long id, String content) {
        return fileRepository.findById(id).map(file -> {
            file.setContent(content);
            FileEntity updated = fileRepository.save(file);
            return toDto(updated);
        });
    }

    @Transactional
    public Optional<FileDto> renameFile(Long id, String newName) {
        return fileRepository.findById(id).map(file -> {
            file.setName(newName);
            file.setExtension(extractExtension(newName));
            FileEntity updated = fileRepository.save(file);
            return toDto(updated);
        });
    }

    @Transactional
    public boolean deleteFile(Long id) {
        if (fileRepository.existsById(id)) {
            fileRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1).toLowerCase();
        }
        return "txt";
    }

    private String generateUniqueFileName(Long projectId, String name) {
        int dotIndex = name.lastIndexOf('.');
        String base = dotIndex > 0 ? name.substring(0, dotIndex) : name;
        String ext = dotIndex > 0 ? name.substring(dotIndex) : "";
        int counter = 1;
        while (fileRepository.existsByProjectIdAndName(projectId, base + "_" + counter + ext)) {
            counter++;
        }
        return base + "_" + counter + ext;
    }

    private String getDefaultContent(String extension) {
        switch (extension.toLowerCase()) {
            case "java":
                return "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}\n";
            case "js":
            case "jsx":
                return "console.log('Hello, Collaborative Coding!');\n";
            case "py":
                return "def main():\n    print(\"Hello, Collaborative World!\")\n\nif __name__ == \"__main__\":\n    main()\n";
            case "cpp":
            case "c":
                return "#include <iostream>\n\nint main() {\n    std::cout << \"Hello World!\" << std::endl;\n    return 0;\n}\n";
            case "html":
                return "<!DOCTYPE html>\n<html>\n<head>\n  <title>Collaborative Page</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n";
            case "json":
                return "{\n  \"message\": \"Hello World\"\n}\n";
            case "md":
                return "# Project Title\n\nReal-time collaborative documentation.\n";
            default:
                return "";
        }
    }

    public FileDto toDto(FileEntity file) {
        return new FileDto(
                file.getId(),
                file.getProject().getId(),
                file.getName(),
                file.getExtension(),
                file.getContent(),
                file.getCreatedAt(),
                file.getUpdatedAt()
        );
    }
}
