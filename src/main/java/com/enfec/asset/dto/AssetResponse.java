package com.enfec.asset.dto;

import com.enfec.asset.enums.AssetStatus;

import java.time.Instant;
import java.util.UUID;

public record AssetResponse(
        UUID id,
        String assetTag,
        String name,
        String category,
        String manufacturer,
        String model,
        AssetStatus status,
        String assignedTo,
        Instant createdAt,
        Instant updatedAt
) {
}