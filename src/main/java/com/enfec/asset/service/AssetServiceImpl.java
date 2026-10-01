package com.enfec.asset.service;

import com.enfec.asset.dto.AssetResponse;
import com.enfec.asset.dto.AssetStatusHistoryResponse;
import com.enfec.asset.dto.CreateAssetRequest;
import com.enfec.asset.dto.UpdateAssetStatusRequest;
import com.enfec.asset.entity.AssetEntity;
import com.enfec.asset.dto.AssetQuantityResponse;
import com.enfec.asset.entity.AssetStatusHistoryEntity;
import com.enfec.asset.enums.AssetStatus;
import com.enfec.asset.exception.AssetNotFoundException;
import com.enfec.asset.repository.AssetRepository;
import com.enfec.asset.repository.AssetStatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final AssetStatusHistoryRepository statusHistoryRepository;

    public AssetServiceImpl(
            AssetRepository assetRepository,
            AssetStatusHistoryRepository statusHistoryRepository
    ) {
        this.assetRepository = assetRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @Override
    public AssetResponse createAsset(CreateAssetRequest request) {

        AssetStatus initialStatus =
                request.status() != null
                        ? request.status()
                        : AssetStatus.IN_STOCK;

        String assignedTo = request.assignedTo();

        if (initialStatus == AssetStatus.ASSIGNED) {
            if (assignedTo == null || assignedTo.isBlank()) {
                throw new IllegalArgumentException(
                        "assignedTo is required when asset status is ASSIGNED"
                );
            }

            assignedTo = assignedTo.trim();
        }

        if (initialStatus != AssetStatus.ASSIGNED) {
            assignedTo = null;
        }

        AssetEntity asset = new AssetEntity(
                request.assetTag(),
                request.name(),
                request.category(),
                request.manufacturer(),
                request.model(),
                initialStatus,
                assignedTo
        );

        AssetEntity savedAsset = assetRepository.save(asset);

        return toResponse(savedAsset);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponse> getAllAssets() {

        return assetRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetQuantityResponse> getAssetQuantities() {

        return assetRepository.findAssetQuantities()
                .stream()
                .map(row -> new AssetQuantityResponse(
                        (String) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        ((Number) row[4]).longValue()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AssetResponse getAssetById(UUID id) {

        AssetEntity asset = assetRepository.findById(id)
                .orElseThrow(() ->
                        new AssetNotFoundException(id)
                );

        return toResponse(asset);
    }

    @Override
    public AssetResponse updateStatus(
            UUID id,
            UpdateAssetStatusRequest request
    ) {

        AssetEntity asset = assetRepository.findById(id)
                .orElseThrow(() ->
                        new AssetNotFoundException(id)
                );

        AssetStatus oldStatus = asset.getStatus();
        AssetStatus newStatus = request.status();

        String oldAssignedTo = asset.getAssignedTo();
        String newAssignedTo = request.assignedTo();

        if (newStatus == AssetStatus.ASSIGNED) {

            if (newAssignedTo == null || newAssignedTo.isBlank()) {
                throw new IllegalArgumentException(
                        "assignedTo is required when asset status is ASSIGNED"
                );
            }

            newAssignedTo = newAssignedTo.trim();
        }

        if (newStatus != AssetStatus.ASSIGNED) {
            newAssignedTo = null;
        }

        if (oldStatus != newStatus) {

            asset.setStatus(newStatus);

            AssetStatusHistoryEntity history =
                    new AssetStatusHistoryEntity(
                            asset.getId(),
                            oldStatus,
                            newStatus
                    );

            statusHistoryRepository.save(history);
        }

        if (!Objects.equals(
                oldAssignedTo,
                newAssignedTo
        )) {
            asset.setAssignedTo(newAssignedTo);
        }

        AssetEntity savedAsset = assetRepository.save(asset);

        return toResponse(savedAsset);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponse> getAssetsAssignedTo(String username) {

        return assetRepository
                .findByAssignedToIgnoreCase(username)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetStatusHistoryResponse> getStatusHistory(
            UUID assetId
    ) {

        assetRepository.findById(assetId)
                .orElseThrow(() ->
                        new AssetNotFoundException(assetId)
                );

        return statusHistoryRepository
                .findByAssetIdOrderByChangedAtDesc(assetId)
                .stream()
                .map(history ->
                        new AssetStatusHistoryResponse(
                                history.getId(),
                                history.getAssetId(),
                                history.getOldStatus(),
                                history.getNewStatus(),
                                history.getChangedAt()
                        )
                )
                .toList();
    }

    private AssetResponse toResponse(AssetEntity asset) {

        return new AssetResponse(
                asset.getId(),
                asset.getAssetTag(),
                asset.getName(),
                asset.getCategory(),
                asset.getManufacturer(),
                asset.getModel(),
                asset.getStatus(),
                asset.getAssignedTo(),
                asset.getCreatedAt(),
                asset.getUpdatedAt()
        );
    }
}