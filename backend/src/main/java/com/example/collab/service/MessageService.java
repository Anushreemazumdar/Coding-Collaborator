package com.example.collab.service;

import com.example.collab.dto.ChatMessage;
import com.example.collab.entity.Message;
import com.example.collab.entity.Session;
import com.example.collab.entity.User;
import com.example.collab.repository.MessageRepository;
import com.example.collab.repository.SessionRepository;
import com.example.collab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Autowired
    public MessageService(MessageRepository messageRepository, SessionRepository sessionRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessage chatMessage) {
        Session session = sessionRepository.findById(chatMessage.getSessionId())
                .orElse(null);
        User user = chatMessage.getUserId() != null ? userRepository.findById(chatMessage.getUserId()).orElse(null) : null;

        if (session != null && user != null) {
            Message message = new Message(session, user, chatMessage.getUsername(), chatMessage.getContent());
            Message saved = messageRepository.save(message);
            chatMessage.setId(saved.getId());
            chatMessage.setTimestamp(saved.getTimestamp());
        }
        return chatMessage;
    }

    public List<ChatMessage> getMessagesBySession(Long sessionId) {
        return messageRepository.findBySessionIdOrderByTimestampAsc(sessionId).stream()
                .map(m -> {
                    ChatMessage dto = new ChatMessage(
                            m.getSession().getId(),
                            m.getUser().getId(),
                            m.getUsername(),
                            m.getContent(),
                            ChatMessage.MessageType.CHAT
                    );
                    dto.setId(m.getId());
                    dto.setTimestamp(m.getTimestamp());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
