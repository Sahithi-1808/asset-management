package com.enfec.asset.audit.service;

import com.enfec.asset.audit.entity.AssetAuditLogEntity;
import com.enfec.asset.audit.repository.AssetAuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AssetAuditLogServiceImpl implements AssetAuditLogService {

    private final AssetAuditLogRepository repository;

    public AssetAuditLogServiceImpl(
            AssetAuditLogRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    public void log(
            UUID assetId,
            String assetTag,
            String action,
            String performedBy,
            String oldValue,
            String newValue,
            String details
    ) {
        AssetAuditLogEntity auditLog = new AssetAuditLogEntity(
                assetId,
                assetTag,
                action,
                performedBy,
                oldValue,
                newValue,
                details
        );

        repository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetAuditLogEntity> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetAuditLogEntity> getByAssetId(UUID assetId) {
        return repository.findByAssetIdOrderByCreatedAtDesc(assetId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetAuditLogEntity> getByPerformedBy(String performedBy) {
        return repository.findByPerformedByIgnoreCaseOrderByCreatedAtDesc(
                performedBy
        );
    }
}