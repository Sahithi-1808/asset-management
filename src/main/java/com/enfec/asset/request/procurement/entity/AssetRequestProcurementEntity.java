package com.enfec.asset.request.procurement.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "asset_request_procurement",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_asset_request_procurement_request",
                        columnNames = "request_id"
                )
        }
)
public class AssetRequestProcurementEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "request_id", nullable = false, unique = true)
    private UUID requestId;

    @Column(name = "vendor_name", length = 200)
    private String vendorName;

    @Column(name = "vendor_contact", length = 200)
    private String vendorContact;

    @Column(name = "quotation_number", length = 100)
    private String quotationNumber;

    @Column(name = "quotation_amount", precision = 15, scale = 2)
    private BigDecimal quotationAmount;

    @Column(length = 10)
    private String currency;

    @Column(name = "purchase_order_number", length = 100)
    private String purchaseOrderNumber;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    /*
     * ---------------------------------------------------------
     * FINANCE DETAILS
     * ---------------------------------------------------------
     */

    @Column(name = "budget_amount", precision = 15, scale = 2)
    private BigDecimal budgetAmount;

    @Column(name = "approved_budget", precision = 15, scale = 2)
    private BigDecimal approvedBudget;

    @Column(name = "finance_decision", length = 30)
    private String financeDecision;

    @Column(name = "finance_comment", length = 1000)
    private String financeComment;

    @Column(name = "finance_username", length = 100)
    private String financeUsername;

    @Column(name = "finance_approved_at")
    private Instant financeApprovedAt;

    /*
     * ---------------------------------------------------------
     * PROCUREMENT DETAILS
     * ---------------------------------------------------------
     */

    @Column(nullable = false, length = 40)
    private String status;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AssetRequestProcurementEntity() {
    }

    public AssetRequestProcurementEntity(
            UUID requestId,
            String createdBy
    ) {
        this.id = UUID.randomUUID();
        this.requestId = requestId;
        this.createdBy = createdBy;
        this.status = "PENDING";
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

    public UUID getRequestId() {
        return requestId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public String getVendorContact() {
        return vendorContact;
    }

    public String getQuotationNumber() {
        return quotationNumber;
    }

    public BigDecimal getQuotationAmount() {
        return quotationAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getPurchaseOrderNumber() {
        return purchaseOrderNumber;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    /*
     * ---------------------------------------------------------
     * FINANCE GETTERS
     * ---------------------------------------------------------
     */

    public BigDecimal getBudgetAmount() {
        return budgetAmount;
    }

    public BigDecimal getApprovedBudget() {
        return approvedBudget;
    }

    public String getFinanceDecision() {
        return financeDecision;
    }

    public String getFinanceComment() {
        return financeComment;
    }

    public String getFinanceUsername() {
        return financeUsername;
    }

    public Instant getFinanceApprovedAt() {
        return financeApprovedAt;
    }

    /*
     * ---------------------------------------------------------
     * PROCUREMENT GETTERS
     * ---------------------------------------------------------
     */

    public String getStatus() {
        return status;
    }

    public String getRemarks() {
        return remarks;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    /*
     * ---------------------------------------------------------
     * EXISTING SETTERS
     * ---------------------------------------------------------
     */

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public void setVendorContact(String vendorContact) {
        this.vendorContact = vendorContact;
    }

    public void setQuotationNumber(String quotationNumber) {
        this.quotationNumber = quotationNumber;
    }

    public void setQuotationAmount(BigDecimal quotationAmount) {
        this.quotationAmount = quotationAmount;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setPurchaseOrderNumber(String purchaseOrderNumber) {
        this.purchaseOrderNumber = purchaseOrderNumber;
    }

    public void setExpectedDeliveryDate(
            LocalDate expectedDeliveryDate
    ) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    /*
     * ---------------------------------------------------------
     * FINANCE SETTERS
     * ---------------------------------------------------------
     */

    public void setBudgetAmount(BigDecimal budgetAmount) {
        this.budgetAmount = budgetAmount;
    }

    public void setApprovedBudget(BigDecimal approvedBudget) {
        this.approvedBudget = approvedBudget;
    }

    public void setFinanceDecision(String financeDecision) {
        this.financeDecision = financeDecision;
    }

    public void setFinanceComment(String financeComment) {
        this.financeComment = financeComment;
    }

    public void setFinanceUsername(String financeUsername) {
        this.financeUsername = financeUsername;
    }

    public void setFinanceApprovedAt(Instant financeApprovedAt) {
        this.financeApprovedAt = financeApprovedAt;
    }

    /*
     * ---------------------------------------------------------
     * PROCUREMENT SETTERS
     * ---------------------------------------------------------
     */

    public void setStatus(String status) {
        this.status = status;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}