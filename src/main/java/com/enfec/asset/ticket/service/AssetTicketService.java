package com.enfec.asset.ticket.service;

import com.enfec.asset.ticket.dto.CreateTicketRequest;
import com.enfec.asset.ticket.dto.TicketResponse;
import com.enfec.asset.ticket.dto.UpdateTicketRequest;

import java.util.List;
import java.util.UUID;

public interface AssetTicketService {

    TicketResponse create(
            CreateTicketRequest request
    );

    List<TicketResponse> getMyTickets(
            String username
    );

    List<TicketResponse> getAllTickets();

    TicketResponse getById(
            UUID id
    );

    TicketResponse update(
            UUID id,
            UpdateTicketRequest request
    );
}