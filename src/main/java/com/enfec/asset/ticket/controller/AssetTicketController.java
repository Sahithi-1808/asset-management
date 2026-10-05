package com.enfec.asset.ticket.controller;

import com.enfec.asset.ticket.dto.CreateTicketRequest;
import com.enfec.asset.ticket.dto.TicketResponse;
import com.enfec.asset.ticket.dto.UpdateTicketRequest;
import com.enfec.asset.ticket.service.AssetTicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
public class AssetTicketController {

    private final AssetTicketService ticketService;

    public AssetTicketController(
            AssetTicketService ticketService
    ) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> create(
            @Valid
            @RequestBody
            CreateTicketRequest request
    ) {

        return ResponseEntity
                .status(201)
                .body(
                        ticketService.create(request)
                );
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>>
    getMyTickets(
            @RequestParam String username
    ) {

        return ResponseEntity.ok(
                ticketService.getMyTickets(username)
        );
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>>
    getAllTickets() {

        return ResponseEntity.ok(
                ticketService.getAllTickets()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse>
    getById(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                ticketService.getById(id)
        );
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponse>
    update(
            @PathVariable UUID id,

            @Valid
            @RequestBody
            UpdateTicketRequest request
    ) {

        return ResponseEntity.ok(
                ticketService.update(
                        id,
                        request
                )
        );
    }
}