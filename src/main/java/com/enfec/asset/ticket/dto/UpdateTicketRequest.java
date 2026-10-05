package com.enfec.asset.ticket.dto;

import com.enfec.asset.ticket.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTicketRequest(

        @NotNull
        TicketStatus status,

        String adminNote
) {
}