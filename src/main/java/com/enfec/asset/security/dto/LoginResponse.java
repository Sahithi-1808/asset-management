package com.enfec.asset.security.dto;

public record LoginResponse(
        String message,
        String username,
        String role,
        String token
) {
}
