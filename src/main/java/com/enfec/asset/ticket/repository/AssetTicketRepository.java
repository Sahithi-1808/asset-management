package com.enfec.asset.ticket.repository;

import com.enfec.asset.ticket.entity.AssetTicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetTicketRepository
        extends JpaRepository<AssetTicketEntity, UUID> {

    List<AssetTicketEntity>
    findByEmployeeUsernameIgnoreCaseOrderByCreatedAtDesc(
            String username
    );

    List<AssetTicketEntity>
    findAllByOrderByCreatedAtDesc();
}