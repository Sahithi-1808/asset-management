package com.enfec.asset.request.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateAssetRequestRequest(
        String employeeUsername,

        @NotNull(message = "Asset is required")
        UUID assetId,

        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @NotBlank(message = "Priority is required")
        String priority,

        @NotBlank(message = "Business justification is required")
        String businessJustification,

        LocalDate requiredFrom,
        LocalDate requiredTo,
        String location,

        @NotBlank(message = "Higher authority approver is required")
        String approverUsername,

        boolean requiresFinanceApproval
) {}
