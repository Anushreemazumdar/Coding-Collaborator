package com.example.collab;

import com.example.collab.dto.*;
import com.example.collab.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CollabApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private FileService fileService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private PresenceService presenceService;

    @Test
    void contextLoads() {
        assertNotNull(authService);
        assertNotNull(projectService);
        assertNotNull(sessionService);
        assertNotNull(fileService);
        assertNotNull(messageService);
        assertNotNull(presenceService);
    }

    @Test
    void testUserRegistrationAndLogin() {
        AuthRequest reg = new AuthRequest("testuser", "test@example.com", "password123");
        AuthResponse regRes = authService.register(reg);
        assertTrue(regRes.isSuccess());
        assertNotNull(regRes.getUserId());

        AuthRequest login = new AuthRequest("testuser", null, "password123");
        AuthResponse loginRes = authService.login(login);
        assertTrue(loginRes.isSuccess());
        assertEquals("testuser", loginRes.getUsername());
    }

    @Test
    void testProjectSessionAndFileWorkflow() {
        // 1. Create User
        AuthResponse user = authService.register(new AuthRequest("alice", "alice@example.com", "secret"));
        assertTrue(user.isSuccess());

        // 2. Create Project
        ProjectDto project = projectService.createProject("Java Collab", "Test Project", user.getUserId());
        assertNotNull(project.getId());
        assertEquals("Java Collab", project.getName());

        // 3. Check default Main.java file created
        List<FileDto> files = fileService.getFilesByProject(project.getId());
        assertFalse(files.isEmpty());
        FileDto mainFile = files.get(0);
        assertEquals("Main.java", mainFile.getName());

        // 4. Create Session
        SessionDto session = sessionService.createSession("SESSION-TEST-1", "Alice Session", project.getId(), user.getUserId());
        assertNotNull(session.getId());
        assertEquals("SESSION-TEST-1", session.getSessionCode());

        // 5. Update/Save file content
        String newCode = "public class Main { public static void main(String[] args) { System.out.println(42); } }";
        Optional<FileDto> updatedFile = fileService.updateFileContent(mainFile.getId(), newCode);
        assertTrue(updatedFile.isPresent());
        assertEquals(newCode, updatedFile.get().getContent());

        // 6. Test Presence
        List<UserDto> active = presenceService.userJoined(session.getId(), user.getUserId(), user.getUsername(), user.getEmail());
        assertEquals(1, active.size());
        assertEquals("alice", active.get(0).getUsername());

        // 7. Test Chat Message
        ChatMessage chat = new ChatMessage(session.getId(), user.getUserId(), user.getUsername(), "Hello world!", ChatMessage.MessageType.CHAT);
        ChatMessage savedChat = messageService.saveMessage(chat);
        assertNotNull(savedChat.getId());
        assertEquals("Hello world!", savedChat.getContent());
    }
}
