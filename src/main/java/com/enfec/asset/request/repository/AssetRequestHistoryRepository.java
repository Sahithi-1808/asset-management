package com.enfec.asset.request.repository;

import com.enfec.asset.request.entity.AssetRequestHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetRequestHistoryRepository extends JpaRepository<AssetRequestHistoryEntity, UUID> {
    List<AssetRequestHistoryEntity> findByRequestIdOrderByCreatedAtAsc(UUID requestId);
}
