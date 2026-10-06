package com.enfec.asset.entity;

import com.enfec.asset.enums.AssetStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "asset")
public class AssetEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "asset_tag", nullable = false, unique = true, length = 100)
    private String assetTag;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(length = 200)
    private String manufacturer;

    @Column(length = 200)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetStatus status;

    @Column(name = "assigned_to", length = 200)
    private String assignedTo;

    @Column(name = "serial_number", length = 255)
    private String serialNumber;

    @Column(name = "condition", length = 50)
    private String condition;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "warranty_start_date")
    private LocalDate warrantyStartDate;

    @Column(name = "warranty_expiry_date")
    private LocalDate warrantyExpiryDate;

    @Column(name = "asset_expiry_date")
    private LocalDate assetExpiryDate;

    @Column(name = "vendor", length = 255)
    private String vendor;

    @Column(name = "purchase_price", precision = 15, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "invoice_number", length = 255)
    private String invoiceNumber;

    @Column(name = "purchase_order_number", length = 255)
    private String purchaseOrderNumber;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AssetEntity() {
    }

    public AssetEntity(
            String assetTag,
            String name,
            String category,
            String manufacturer,
            String model,
            AssetStatus status,
            String assignedTo
    ) {
        this.id = UUID.randomUUID();
        this.assetTag = assetTag;
        this.name = name;
        this.category = category;
        this.manufacturer = manufacturer;
        this.model = model;
        this.status = status;
        this.assignedTo = assignedTo;
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

    public String getAssetTag() {
        return assetTag;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public String getModel() {
        return model;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getCondition() {
        return condition;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public LocalDate getWarrantyStartDate() {
        return warrantyStartDate;
    }

    public LocalDate getWarrantyExpiryDate() {
        return warrantyExpiryDate;
    }

    public LocalDate getAssetExpiryDate() {
        return assetExpiryDate;
    }

    public String getVendor() {
        return vendor;
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public String getPurchaseOrderNumber() {
        return purchaseOrderNumber;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public String getLocation() {
        return location;
    }

    public LocalDate getLastMaintenanceDate() {
        return lastMaintenanceDate;
    }

    public LocalDate getNextMaintenanceDate() {
        return nextMaintenanceDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setStatus(AssetStatus status) {
        this.status = status;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public void setWarrantyStartDate(LocalDate warrantyStartDate) {
        this.warrantyStartDate = warrantyStartDate;
    }

    public void setWarrantyExpiryDate(LocalDate warrantyExpiryDate) {
        this.warrantyExpiryDate = warrantyExpiryDate;
    }

    public void setAssetExpiryDate(LocalDate assetExpiryDate) {
        this.assetExpiryDate = assetExpiryDate;
    }

    public void setVendor(String vendor) {
        this.vendor = vendor;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public void setPurchaseOrderNumber(String purchaseOrderNumber) {
        this.purchaseOrderNumber = purchaseOrderNumber;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setLastMaintenanceDate(LocalDate lastMaintenanceDate) {
        this.lastMaintenanceDate = lastMaintenanceDate;
    }

    public void setNextMaintenanceDate(LocalDate nextMaintenanceDate) {
        this.nextMaintenanceDate = nextMaintenanceDate;
    }
}
