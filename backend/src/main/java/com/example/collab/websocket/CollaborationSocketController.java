package com.example.collab.websocket;

import com.example.collab.dto.ChatMessage;
import com.example.collab.dto.CodeChangeMessage;
import com.example.collab.dto.PresenceMessage;
import com.example.collab.dto.UserDto;
import com.example.collab.service.FileService;
import com.example.collab.service.MessageService;
import com.example.collab.service.PresenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class CollaborationSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final FileService fileService;
    private final PresenceService presenceService;

    @Autowired
    public CollaborationSocketController(
            SimpMessagingTemplate messagingTemplate,
            MessageService messageService,
            FileService fileService,
            PresenceService presenceService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.fileService = fileService;
        this.presenceService = presenceService;
    }

    /**
     * Real-Time Code Sync:
     * Receives code update from User A and broadcasts it immediately to all subscribers of the session.
     */
    @MessageMapping("/session/{sessionId}/code")
    public void handleCodeChange(@DestinationVariable Long sessionId, @Payload CodeChangeMessage message) {
        message.setSessionId(sessionId);

        // Optionally update in-memory or save draft
        // Broadcast to both /topic/session/{sessionId}/code and /topic/session/{sessionId} for flexibility
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/code", message);
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, message);
    }

    /**
     * Real-Time Chat:
     * Receives chat message from User, saves it to database, and broadcasts to session participants.
     */
    @MessageMapping("/session/{sessionId}/chat")
    public void handleChatMessage(@DestinationVariable Long sessionId, @Payload ChatMessage message) {
        message.setSessionId(sessionId);
        
        // Persist message to database
        ChatMessage saved = messageService.saveMessage(message);

        // Broadcast to session chat topic
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/chat", saved);
    }

    /**
     * Real-Time Presence: User Joined
     */
    @MessageMapping("/session/{sessionId}/join")
    public void handleUserJoin(@DestinationVariable Long sessionId, @Payload PresenceMessage message) {
        message.setSessionId(sessionId);
        message.setAction(PresenceMessage.ActionType.JOIN);

        List<UserDto> activeUsers = presenceService.userJoined(
                sessionId,
                message.getUserId(),
                message.getUsername(),
                ""
        );
        message.setActiveUsers(activeUsers);

        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/presence", message);
    }

    /**
     * Real-Time Presence: User Left
     */
    @MessageMapping("/session/{sessionId}/leave")
    public void handleUserLeave(@DestinationVariable Long sessionId, @Payload PresenceMessage message) {
        message.setSessionId(sessionId);
        message.setAction(PresenceMessage.ActionType.LEAVE);

        List<UserDto> activeUsers = presenceService.userLeft(sessionId, message.getUserId());
        message.setActiveUsers(activeUsers);

        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/presence", message);
    }
}
