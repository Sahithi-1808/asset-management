package com.enfec.asset.service;

import com.enfec.asset.dto.AssetQuantityResponse;
import com.enfec.asset.dto.AssetResponse;
import com.enfec.asset.dto.AssetStatusHistoryResponse;
import com.enfec.asset.dto.CreateAssetRequest;
import com.enfec.asset.dto.UpdateAssetStatusRequest;

import java.util.List;
import java.util.UUID;

public interface AssetService {

    AssetResponse createAsset(CreateAssetRequest request);

    List<AssetResponse> getAllAssets();

    AssetResponse getAssetById(UUID id);

    AssetResponse updateStatus(
            UUID id,
            UpdateAssetStatusRequest request
    );

    List<AssetResponse> getAssetsAssignedTo(String username);

    List<AssetStatusHistoryResponse> getStatusHistory(UUID assetId);

    List<AssetQuantityResponse> getAssetQuantities();
}