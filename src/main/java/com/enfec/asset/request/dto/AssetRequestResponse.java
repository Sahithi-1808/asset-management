package com.enfec.asset.request.dto;

import com.enfec.asset.request.enums.AssetRequestStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AssetRequestResponse(
        UUID id,
        String requestNumber,
        String requesterUsername,
        String employeeUsername,
        UUID assetId,
        String assetName,
        String assetTag,
        Integer quantity,
        String priority,
        String businessJustification,
        LocalDate requiredFrom,
        LocalDate requiredTo,
        String location,
        AssetRequestStatus status,
        String approverUsername,
        String approvalComment,
        Instant approvedAt,
        boolean requiresFinanceApproval,
        String financeUsername,
        String financeComment,
        Instant financeApprovedAt,

        /*
         * Indicates whether Procurement has already
         * created a Purchase Order for this request.
         *
         * false = existing Finance approval flow
         * true  = new post-PO Finance budget review flow
         */
        boolean purchaseOrderCreated,

        String assignedUsername,
        Instant fulfilledAt,
        String closedBy,
        Instant closedAt,
        String closureNote,
        Instant createdAt,
        Instant updatedAt
) {}