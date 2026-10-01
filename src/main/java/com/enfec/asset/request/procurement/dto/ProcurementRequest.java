package com.enfec.asset.request.procurement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProcurementRequest(
        String vendorName,
        String vendorContact,
        String quotationNumber,
        BigDecimal quotationAmount,
        String currency,
        String purchaseOrderNumber,
        LocalDate expectedDeliveryDate,
        String status,
        String remarks,

        // Finance details
        BigDecimal budgetAmount,
        BigDecimal approvedBudget,
        String financeDecision,
        String financeComment
) {
}