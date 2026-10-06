package com.enfec.asset.dto;

import com.enfec.asset.enums.AssetStatus;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateAssetRequest(
        @NotBlank
        String assetTag,

        @NotBlank
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

        LocalDate nextMaintenanceDate
) {
}