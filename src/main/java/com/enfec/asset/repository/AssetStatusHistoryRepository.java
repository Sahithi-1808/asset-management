package com.enfec.asset.repository;

import com.enfec.asset.entity.AssetStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetStatusHistoryRepository
        extends JpaRepository<AssetStatusHistoryEntity, UUID> {

    List<AssetStatusHistoryEntity> findByAssetIdOrderByChangedAtDesc(
            UUID assetId
    );
}