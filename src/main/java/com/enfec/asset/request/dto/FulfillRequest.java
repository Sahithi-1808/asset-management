package com.enfec.asset.request.dto;

public record FulfillRequest(
        String assignedUsername,
        java.util.UUID assetId
) {}