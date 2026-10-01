package com.enfec.asset.request.procurement.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProcurementResponse(
        UUID id,
        UUID requestId,

        // Procurement details
        String vendorName,
        String vendorContact,
        String quotationNumber,
        BigDecimal quotationAmount,
        String currency,
        String purchaseOrderNumber,
        LocalDate expectedDeliveryDate,

        // Finance details
        BigDecimal budgetAmount,
        BigDecimal approvedBudget,
        String financeDecision,
        String financeComment,
        String financeUsername,
        Instant financeApprovedAt,

        // Procurement status
        String status,
        String remarks,

        // Record information
        String createdBy,
        Instant createdAt,
        Instant updatedAt
) {
}