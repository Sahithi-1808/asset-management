package com.enfec.asset.ticket.service;

import com.enfec.asset.exception.AssetNotFoundException;
import com.enfec.asset.repository.AssetRepository;
import com.enfec.asset.ticket.dto.CreateTicketRequest;
import com.enfec.asset.ticket.dto.TicketResponse;
import com.enfec.asset.ticket.dto.UpdateTicketRequest;
import com.enfec.asset.ticket.entity.AssetTicketEntity;
import com.enfec.asset.ticket.repository.AssetTicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AssetTicketServiceImpl
        implements AssetTicketService {

    private final AssetTicketRepository ticketRepository;

    private final AssetRepository assetRepository;

    public AssetTicketServiceImpl(
            AssetTicketRepository ticketRepository,
            AssetRepository assetRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.assetRepository = assetRepository;
    }

    @Override
    public TicketResponse create(
            CreateTicketRequest request
    ) {

        if (!assetRepository.existsById(
                request.assetId()
        )) {
            throw new AssetNotFoundException(
                    request.assetId()
            );
        }

        AssetTicketEntity ticket =
                new AssetTicketEntity(
                        request.assetId(),
                        request.employeeUsername().trim(),
                        request.issueType(),
                        request.description().trim(),
                        request.priority()
                );

        AssetTicketEntity saved =
                ticketRepository.save(ticket);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(
            String username
    ) {

        return ticketRepository
                .findByEmployeeUsernameIgnoreCaseOrderByCreatedAtDesc(
                        username
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {

        return ticketRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getById(
            UUID id
    ) {

        AssetTicketEntity ticket =
                ticketRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ticket not found: " + id
                                )
                        );

        return toResponse(ticket);
    }

    @Override
    public TicketResponse update(
            UUID id,
            UpdateTicketRequest request
    ) {

        AssetTicketEntity ticket =
                ticketRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ticket not found: " + id
                                )
                        );

        ticket.setStatus(
                request.status()
        );

        ticket.setAdminNote(
                request.adminNote()
        );

        return toResponse(
                ticketRepository.save(ticket)
        );
    }

    private TicketResponse toResponse(
            AssetTicketEntity ticket
    ) {

        return new TicketResponse(
                ticket.getId(),
                ticket.getAssetId(),
                ticket.getEmployeeUsername(),
                ticket.getIssueType(),
                ticket.getDescription(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getAdminNote(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}