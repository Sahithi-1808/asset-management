package com.enfec.asset.request.dto;

import com.enfec.asset.request.enums.AssetRequestStatus;

import java.time.Instant;
import java.util.UUID;

public record AssetRequestHistoryResponse(
        UUID id,
        String action,
        AssetRequestStatus fromStatus,
        AssetRequestStatus toStatus,
        String actorUsername,
        String comment,
        Instant createdAt
) {}
