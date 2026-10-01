package com.example.collab.controller;

import com.example.collab.dto.ChatMessage;
import com.example.collab.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    @Autowired
    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getSessionMessages(@PathVariable Long sessionId) {
        return ResponseEntity.ok(messageService.getMessagesBySession(sessionId));
    }
}
