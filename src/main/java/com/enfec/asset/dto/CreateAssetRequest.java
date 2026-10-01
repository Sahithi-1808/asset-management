package com.enfec.asset.dto;

import com.enfec.asset.enums.AssetStatus;
import jakarta.validation.constraints.NotBlank;

public record CreateAssetRequest(
        @NotBlank
        String assetTag,

        @NotBlank
        String name,

        String category,

        String manufacturer,

        String model,

        AssetStatus status,

        String assignedTo
) {
}