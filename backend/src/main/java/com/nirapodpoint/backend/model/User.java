package com.nirapodpoint.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String password; // hashed
    private String nidFront; // base64
    private String nidBack;  // base64
    private String photo;    // base64 real-time photo
    private boolean isVerified = false;
    private boolean isAdmin = false;
    private LocalDateTime createdAt = LocalDateTime.now();
} 