package com.enfec.asset.request.entity;

import com.enfec.asset.request.enums.AssetRequestStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "asset_request")
public class AssetRequestEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "request_number", nullable = false, unique = true, length = 40)
    private String requestNumber;

    @Column(name = "requester_username", nullable = false, length = 100)
    private String requesterUsername;

    @Column(name = "employee_username", nullable = false, length = 100)
    private String employeeUsername;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 30)
    private String priority;

    @Column(name = "business_justification", nullable = false, length = 1000)
    private String businessJustification;

    @Column(name = "required_from")
    private LocalDate requiredFrom;

    @Column(name = "required_to")
    private LocalDate requiredTo;

    @Column(length = 200)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssetRequestStatus status;

    @Column(name = "approver_username", nullable = false, length = 100)
    private String approverUsername;

    @Column(name = "approval_comment", length = 1000)
    private String approvalComment;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "requires_finance_approval", nullable = false)
    private boolean requiresFinanceApproval;

    @Column(name = "finance_username", length = 100)
    private String financeUsername;

    @Column(name = "finance_comment", length = 1000)
    private String financeComment;

    @Column(name = "finance_approved_at")
    private Instant financeApprovedAt;

    @Column(name = "assigned_username", length = 100)
    private String assignedUsername;

    @Column(name = "fulfilled_at")
    private Instant fulfilledAt;

    @Column(name = "closed_by", length = 100)
    private String closedBy;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "closure_note", length = 1000)
    private String closureNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AssetRequestEntity() {}

    public AssetRequestEntity(
            String requestNumber,
            String requesterUsername,
            String employeeUsername,
            UUID assetId,
            Integer quantity,
            String priority,
            String businessJustification,
            LocalDate requiredFrom,
            LocalDate requiredTo,
            String location,
            String approverUsername,
            boolean requiresFinanceApproval
    ) {
        this.id = UUID.randomUUID();
        this.requestNumber = requestNumber;
        this.requesterUsername = requesterUsername;
        this.employeeUsername = employeeUsername;
        this.assetId = assetId;
        this.quantity = quantity;
        this.priority = priority;
        this.businessJustification = businessJustification;
        this.requiredFrom = requiredFrom;
        this.requiredTo = requiredTo;
        this.location = location;
        this.status = AssetRequestStatus.PENDING_APPROVAL;
        this.approverUsername = approverUsername;
        this.requiresFinanceApproval = requiresFinanceApproval;
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

    public UUID getId() { return id; }
    public String getRequestNumber() { return requestNumber; }
    public String getRequesterUsername() { return requesterUsername; }
    public String getEmployeeUsername() { return employeeUsername; }
    public UUID getAssetId() { return assetId; }
    public Integer getQuantity() { return quantity; }
    public String getPriority() { return priority; }
    public String getBusinessJustification() { return businessJustification; }
    public LocalDate getRequiredFrom() { return requiredFrom; }
    public LocalDate getRequiredTo() { return requiredTo; }
    public String getLocation() { return location; }
    public AssetRequestStatus getStatus() { return status; }
    public String getApproverUsername() { return approverUsername; }
    public String getApprovalComment() { return approvalComment; }
    public Instant getApprovedAt() { return approvedAt; }
    public boolean isRequiresFinanceApproval() { return requiresFinanceApproval; }
    public String getFinanceUsername() { return financeUsername; }
    public String getFinanceComment() { return financeComment; }
    public Instant getFinanceApprovedAt() { return financeApprovedAt; }
    public String getAssignedUsername() { return assignedUsername; }
    public Instant getFulfilledAt() { return fulfilledAt; }
    public String getClosedBy() { return closedBy; }
    public Instant getClosedAt() { return closedAt; }
    public String getClosureNote() { return closureNote; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setStatus(AssetRequestStatus status) { this.status = status; }
    public void setApprovalComment(String approvalComment) { this.approvalComment = approvalComment; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
    public void setFinanceUsername(String financeUsername) { this.financeUsername = financeUsername; }
    public void setFinanceComment(String financeComment) { this.financeComment = financeComment; }
    public void setFinanceApprovedAt(Instant financeApprovedAt) { this.financeApprovedAt = financeApprovedAt; }
    public void setAssignedUsername(String assignedUsername) { this.assignedUsername = assignedUsername; }
    public void setFulfilledAt(Instant fulfilledAt) { this.fulfilledAt = fulfilledAt; }
    public void setClosedBy(String closedBy) { this.closedBy = closedBy; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public void setClosureNote(String closureNote) { this.closureNote = closureNote; }
}
