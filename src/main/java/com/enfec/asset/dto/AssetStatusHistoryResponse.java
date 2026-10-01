package com.enfec.asset.dto;

import com.enfec.asset.enums.AssetStatus;

import java.time.Instant;
import java.util.UUID;

public record AssetStatusHistoryResponse(
        UUID id,
        UUID assetId,
        AssetStatus oldStatus,
        AssetStatus newStatus,
        Instant changedAt
) {
}