package com.enfec.asset.repository;

import com.enfec.asset.entity.AssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AssetRepository
        extends JpaRepository<AssetEntity, UUID> {

    boolean existsByAssetTag(String assetTag);

    List<AssetEntity> findByAssignedToIgnoreCase(String assignedTo);

    @Query("""
            SELECT
                a.name,
                a.category,
                a.manufacturer,
                a.model,
                COUNT(a)
            FROM AssetEntity a
            GROUP BY
                a.name,
                a.category,
                a.manufacturer,
                a.model
            ORDER BY a.name
            """)
    List<Object[]> findAssetQuantities();
}