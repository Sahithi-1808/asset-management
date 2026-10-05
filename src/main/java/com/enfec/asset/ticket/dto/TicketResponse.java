package com.enfec.asset.ticket.dto;

import com.enfec.asset.ticket.enums.TicketIssueType;
import com.enfec.asset.ticket.enums.TicketPriority;
import com.enfec.asset.ticket.enums.TicketStatus;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(

        UUID id,

        UUID assetId,

        String employeeUsername,

        TicketIssueType issueType,

        String description,

        TicketPriority priority,

        TicketStatus status,

        String adminNote,

        Instant createdAt,

        Instant updatedAt
) {
}