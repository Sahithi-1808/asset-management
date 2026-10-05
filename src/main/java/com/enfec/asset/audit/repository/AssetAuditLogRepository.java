package com.enfec.asset.audit.repository;

import com.enfec.asset.audit.entity.AssetAuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetAuditLogRepository
        extends JpaRepository<AssetAuditLogEntity, UUID> {

    List<AssetAuditLogEntity>
    findAllByOrderByCreatedAtDesc();

    List<AssetAuditLogEntity>
    findByAssetIdOrderByCreatedAtDesc(UUID assetId);

    List<AssetAuditLogEntity>
    findByPerformedByIgnoreCaseOrderByCreatedAtDesc(
            String performedBy
    );
}
