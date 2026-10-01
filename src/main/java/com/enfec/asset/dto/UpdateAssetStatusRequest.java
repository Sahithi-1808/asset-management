package com.enfec.asset.dto;

import com.enfec.asset.enums.AssetStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAssetStatusRequest(
        @NotNull AssetStatus status,
        String assignedTo
) {
}