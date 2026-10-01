package com.enfec.asset.controller;

import com.enfec.asset.dto.AssetResponse;
import com.enfec.asset.dto.AssetStatusHistoryResponse;
import com.enfec.asset.dto.CreateAssetRequest;
import com.enfec.asset.dto.UpdateAssetStatusRequest;
import com.enfec.asset.service.AssetService;
import com.enfec.asset.dto.AssetQuantityResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @PostMapping
    public ResponseEntity<AssetResponse> createAsset(
            @Valid @RequestBody CreateAssetRequest request
    ) {

        return ResponseEntity.status(201)
                .body(assetService.createAsset(request));
    }

    @GetMapping
    public ResponseEntity<List<AssetResponse>> getAllAssets() {

        return ResponseEntity.ok(
                assetService.getAllAssets()
        );
    }

    @GetMapping("/quantities")
    public ResponseEntity<List<AssetQuantityResponse>> getAssetQuantities() {
        return ResponseEntity.ok(
                assetService.getAssetQuantities()
        );
    }

    @GetMapping("/assigned/{username}")
    public ResponseEntity<List<AssetResponse>> getAssetsAssignedTo(
            @PathVariable String username
    ) {

        return ResponseEntity.ok(
                assetService.getAssetsAssignedTo(username)
        );
    }

    @GetMapping("/{id}/status-history")
    public ResponseEntity<List<AssetStatusHistoryResponse>> getStatusHistory(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                assetService.getStatusHistory(id)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponse> getAssetById(
            @PathVariable UUID id
    ) {

        return ResponseEntity.ok(
                assetService.getAssetById(id)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AssetResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAssetStatusRequest request
    ) {

        return ResponseEntity.ok(
                assetService.updateStatus(id, request)
        );
    }
}