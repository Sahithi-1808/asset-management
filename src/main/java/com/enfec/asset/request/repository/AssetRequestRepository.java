package com.enfec.asset.request.repository;

import com.enfec.asset.request.entity.AssetRequestEntity;
import com.enfec.asset.request.enums.AssetRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface AssetRequestRepository extends JpaRepository<AssetRequestEntity, UUID> {
    long countByStatus(AssetRequestStatus status);
    List<AssetRequestEntity> findAllByOrderByCreatedAtDesc();
    List<AssetRequestEntity> findByApproverUsernameIgnoreCaseOrderByCreatedAtDesc(String username);
    List<AssetRequestEntity> findByRequesterUsernameIgnoreCaseOrderByCreatedAtDesc(String username);
    List<AssetRequestEntity> findByEmployeeUsernameIgnoreCaseOrderByCreatedAtDesc(String username);
    List<AssetRequestEntity> findByEmployeeUsernameInOrderByCreatedAtDesc(Collection<String> usernames);
    List<AssetRequestEntity> findByStatusOrderByCreatedAtDesc(AssetRequestStatus status);
}
