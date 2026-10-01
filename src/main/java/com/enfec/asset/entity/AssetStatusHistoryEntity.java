package com.enfec.asset.entity;

import com.enfec.asset.enums.AssetStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "asset_status_history")
public class AssetStatusHistoryEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 20)
    private AssetStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 20)
    private AssetStatus newStatus;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    protected AssetStatusHistoryEntity() {
    }

    public AssetStatusHistoryEntity(
            UUID assetId,
            AssetStatus oldStatus,
            AssetStatus newStatus
    ) {
        this.id = UUID.randomUUID();
        this.assetId = assetId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getAssetId() {
        return assetId;
    }

    public AssetStatus getOldStatus() {
        return oldStatus;
    }

    public AssetStatus getNewStatus() {
        return newStatus;
    }

    public Instant getChangedAt() {
        return changedAt;
    }
}