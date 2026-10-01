package com.enfec.asset.request.dto;

import java.util.List;
import java.util.Map;

public record RequestDashboardResponse(
        String role,
        Map<String, Long> counts,
        List<AssetRequestResponse> requests
) {}
