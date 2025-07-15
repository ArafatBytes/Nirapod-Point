package com.nirapodpoint.backend.controller;

import com.nirapodpoint.backend.model.User;
import com.nirapodpoint.backend.repository.UserRepository;
import com.nirapodpoint.backend.service.MailService;
import com.nirapodpoint.backend.service.UserService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MailService mailService;
    @Autowired
    private UserService userService;

    // Admin: Get all users, filter by verification status
    @GetMapping
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal User admin,
                                         @RequestParam(value = "verified", required = false, defaultValue = "all") String verified) {
        if (admin == null || !admin.isAdmin()) {
            return ResponseEntity.status(403).body("Forbidden: Admins only");
        }
        List<User> users = userRepository.findAll();
        if (verified.equals("true")) {
            users = users.stream().filter(User::isVerified).collect(Collectors.toList());
        } else if (verified.equals("false")) {
            users = users.stream().filter(u -> !u.isVerified()).collect(Collectors.toList());
        }
        return ResponseEntity.ok(users);
    }

    // Admin: Approve/disapprove user
    @PatchMapping("/{id}/verify")
    public ResponseEntity<?> verifyUser(@AuthenticationPrincipal User admin,
                                        @PathVariable String id,
                                        @RequestParam boolean approve) {
        if (admin == null || !admin.isAdmin()) {
            return ResponseEntity.status(403).body("Forbidden: Admins only");
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        boolean wasUnverified = !user.isVerified();
        boolean wasVerified = user.isVerified();
        user.setVerified(approve);
        userRepository.save(user);
        // Only send email if approving and user was previously unverified
        if (approve && wasUnverified) {
            try {
                mailService.sendVerificationApprovedEmail(user.getEmail(), user.getName());
            } catch (MessagingException e) {
                // Log error, but don't fail the request
                e.printStackTrace();
            }
        }
        // Send disapproval email if disapproving and user was previously verified
        if (!approve && wasVerified) {
            try {
                mailService.sendVerificationDisapprovedEmail(user.getEmail(), user.getName());
            } catch (MessagingException e) {
                e.printStackTrace();
            }
        }
        return ResponseEntity.ok(user);
    }

    // User: Update own info
    @PatchMapping("/me")
    public ResponseEntity<?> updateOwnInfo(@AuthenticationPrincipal User user,
                                           @RequestBody User update) {
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        // Only allow updating name, email, phone for now
        if (update.getName() != null) user.setName(update.getName());
        if (update.getEmail() != null) user.setEmail(update.getEmail());
        if (update.getPhone() != null) user.setPhone(update.getPhone());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    // User: Change password (must be logged in)
    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User user, @RequestBody ChangePasswordRequest req) {
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        try {
            userService.changePassword(user, req.getCurrentPassword(), req.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
} 