package com.enfec.asset.audit.controller;

import com.enfec.asset.audit.entity.AssetAuditLogEntity;
import com.enfec.asset.audit.service.AssetAuditLogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AssetAuditLogController {

    private final AssetAuditLogService service;

    public AssetAuditLogController(
            AssetAuditLogService service
    ) {
        this.service = service;
    }

    @GetMapping
    public List<AssetAuditLogEntity> getAll() {
        return service.getAll();
    }

    @GetMapping("/asset/{assetId}")
    public List<AssetAuditLogEntity> getByAssetId(
            @PathVariable UUID assetId
    ) {
        return service.getByAssetId(assetId);
    }

    @GetMapping("/user")
    public List<AssetAuditLogEntity> getByPerformedBy(
            @RequestParam String username
    ) {
        return service.getByPerformedBy(username);
    }
}
