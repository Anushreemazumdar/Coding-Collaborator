package com.example.collab.service;

import com.example.collab.dto.AuthRequest;
import com.example.collab.dto.AuthResponse;
import com.example.collab.dto.UserDto;
import com.example.collab.entity.User;
import com.example.collab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return AuthResponse.error("Username is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return AuthResponse.error("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            return AuthResponse.error("Password must be at least 4 characters long");
        }

        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            return AuthResponse.error("Username '" + username + "' is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            return AuthResponse.error("Email '" + email + "' is already registered");
        }

        String hashedPassword = hashPassword(request.getPassword());
        User user = new User(username, email, hashedPassword);
        User savedUser = userRepository.save(user);

        return AuthResponse.success(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), "Registration successful");
    }

    public AuthResponse login(AuthRequest request) {
        String identifier = request.getUsername() != null ? request.getUsername().trim() : 
                           (request.getEmail() != null ? request.getEmail().trim() : "");
        
        if (identifier.isEmpty() || request.getPassword() == null) {
            return AuthResponse.error("Username/email and password are required");
        }

        Optional<User> userOpt = userRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier.toLowerCase());
        }

        if (userOpt.isEmpty()) {
            return AuthResponse.error("Invalid username or password");
        }

        User user = userOpt.get();
        String hashedInput = hashPassword(request.getPassword());

        if (!user.getPassword().equals(hashedInput)) {
            return AuthResponse.error("Invalid username or password");
        }

        return AuthResponse.success(user.getId(), user.getUsername(), user.getEmail(), "Login successful");
    }

    public Optional<UserDto> getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(u -> new UserDto(u.getId(), u.getUsername(), u.getEmail()));
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
