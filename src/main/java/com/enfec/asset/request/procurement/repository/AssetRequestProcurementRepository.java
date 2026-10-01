package com.enfec.asset.request.procurement.repository;

import com.enfec.asset.request.procurement.entity.AssetRequestProcurementEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AssetRequestProcurementRepository
        extends JpaRepository<AssetRequestProcurementEntity, UUID> {

    Optional<AssetRequestProcurementEntity> findByRequestId(UUID requestId);
}