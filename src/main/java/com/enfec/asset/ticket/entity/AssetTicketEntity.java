package com.enfec.asset.ticket.entity;

import com.enfec.asset.ticket.enums.TicketIssueType;
import com.enfec.asset.ticket.enums.TicketPriority;
import com.enfec.asset.ticket.enums.TicketStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "asset_ticket")
public class AssetTicketEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(
            name = "asset_id",
            nullable = false,
            updatable = false
    )
    private UUID assetId;

    @Column(
            name = "employee_username",
            nullable = false,
            length = 100,
            updatable = false
    )
    private String employeeUsername;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "issue_type",
            nullable = false,
            length = 40
    )
    private TicketIssueType issueType;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private TicketStatus status;

    @Column(
            name = "admin_note",
            columnDefinition = "TEXT"
    )
    private String adminNote;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    protected AssetTicketEntity() {
    }

    public AssetTicketEntity(
            UUID assetId,
            String employeeUsername,
            TicketIssueType issueType,
            String description,
            TicketPriority priority
    ) {
        this.id = UUID.randomUUID();
        this.assetId = assetId;
        this.employeeUsername = employeeUsername;
        this.issueType = issueType;
        this.description = description;
        this.priority =
                priority != null
                        ? priority
                        : TicketPriority.MEDIUM;
        this.status = TicketStatus.OPEN;
    }

    @PrePersist
    void onCreate() {

        Instant now = Instant.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {

        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getAssetId() {
        return assetId;
    }

    public String getEmployeeUsername() {
        return employeeUsername;
    }

    public TicketIssueType getIssueType() {
        return issueType;
    }

    public String getDescription() {
        return description;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
}