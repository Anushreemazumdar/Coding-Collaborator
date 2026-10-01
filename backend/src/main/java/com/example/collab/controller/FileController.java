package com.example.collab.controller;

import com.example.collab.dto.FileDto;
import com.example.collab.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final FileService fileService;

    @Autowired
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping
    public ResponseEntity<?> createFile(@RequestBody Map<String, Object> payload) {
        try {
            Long projectId = Long.valueOf(payload.get("projectId").toString());
            String name = (String) payload.get("name");
            String content = (String) payload.get("content");

            FileDto file = fileService.createFile(projectId, name, content);
            return ResponseEntity.status(HttpStatus.CREATED).body(file);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create file: " + e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<FileDto>> getFilesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(fileService.getFilesByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFileById(@PathVariable Long id) {
        return fileService.getFileById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "File not found with id " + id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFileContent(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String content = (String) payload.get("content");
        if (content == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Content field is required"));
        }

        return fileService.updateFileContent(id, content)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "File not found with id " + id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        boolean deleted = fileService.deleteFile(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "File deleted successfully", "id", id));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "File not found with id " + id));
    }
}
