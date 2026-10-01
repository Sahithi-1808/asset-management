package com.enfec.asset.request.entity;

import com.enfec.asset.request.enums.AssetRequestStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "asset_request_history")
public class AssetRequestHistoryEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(nullable = false, length = 60)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private AssetRequestStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", length = 30)
    private AssetRequestStatus toStatus;

    @Column(name = "actor_username", nullable = false, length = 100)
    private String actorUsername;

    @Column(length = 1000)
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AssetRequestHistoryEntity() {}

    public AssetRequestHistoryEntity(
            UUID requestId,
            String action,
            AssetRequestStatus fromStatus,
            AssetRequestStatus toStatus,
            String actorUsername,
            String comment
    ) {
        this.id = UUID.randomUUID();
        this.requestId = requestId;
        this.action = action;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorUsername = actorUsername;
        this.comment = comment;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getRequestId() { return requestId; }
    public String getAction() { return action; }
    public AssetRequestStatus getFromStatus() { return fromStatus; }
    public AssetRequestStatus getToStatus() { return toStatus; }
    public String getActorUsername() { return actorUsername; }
    public String getComment() { return comment; }
    public Instant getCreatedAt() { return createdAt; }
}
