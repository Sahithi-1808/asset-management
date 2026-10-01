package com.enfec.asset.employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "employee_account")
public class EmployeeAccountEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(nullable = false, length = 30)
    private String role;

    @Column(name = "manager_username", length = 100)
    private String managerUsername;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected EmployeeAccountEntity() {
    }

    public EmployeeAccountEntity(
            String username,
            String passwordHash,
            String fullName,
            String email,
            String role,
            String managerUsername
    ) {
        this.id = UUID.randomUUID();
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.managerUsername = managerUsername;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getManagerUsername() {
        return managerUsername;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}