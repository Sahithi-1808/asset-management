package com.enfec.asset.ticket.dto;

import com.enfec.asset.ticket.enums.TicketIssueType;
import com.enfec.asset.ticket.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateTicketRequest(

        @NotNull
        UUID assetId,

        @NotBlank
        String employeeUsername,

        @NotNull
        TicketIssueType issueType,

        @NotBlank
        String description,

        TicketPriority priority
) {
}