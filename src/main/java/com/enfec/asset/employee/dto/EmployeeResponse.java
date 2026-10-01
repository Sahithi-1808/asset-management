package com.enfec.asset.employee.dto;

import java.time.Instant;
import java.util.UUID;

public record EmployeeResponse(
        UUID id,
        String username,
        String fullName,
        String email,
        String role,
        String managerUsername,
        Instant createdAt
) {}
