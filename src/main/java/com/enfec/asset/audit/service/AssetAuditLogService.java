package com.enfec.asset.audit.service;

import com.enfec.asset.audit.entity.AssetAuditLogEntity;

import java.util.List;
import java.util.UUID;

public interface AssetAuditLogService {

    void log(
            UUID assetId,
            String assetTag,
            String action,
            String performedBy,
            String oldValue,
            String newValue,
            String details
    );

    List<AssetAuditLogEntity> getAll();

    List<AssetAuditLogEntity> getByAssetId(UUID assetId);

    List<AssetAuditLogEntity> getByPerformedBy(String performedBy);
}
