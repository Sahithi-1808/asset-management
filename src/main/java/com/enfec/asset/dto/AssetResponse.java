package com.enfec.asset.dto;

import com.enfec.asset.enums.AssetStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AssetResponse(
        UUID id,
        String assetTag,
        String name,
        String category,
        String manufacturer,
        String model,
        AssetStatus status,
        String assignedTo,

        String serialNumber,
        String condition,

        LocalDate purchaseDate,
        LocalDate warrantyStartDate,
        LocalDate warrantyExpiryDate,
        LocalDate assetExpiryDate,

        String vendor,
        BigDecimal purchasePrice,
        String invoiceNumber,
        String purchaseOrderNumber,

        LocalDate assignedDate,
        String location,

        LocalDate lastMaintenanceDate,
        LocalDate nextMaintenanceDate,

        Instant createdAt,
        Instant updatedAt
) {
}