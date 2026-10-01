package com.enfec.asset.dto;

public record AssetQuantityResponse(
        String name,
        String category,
        String manufacturer,
        String model,
        long quantity
) {
}