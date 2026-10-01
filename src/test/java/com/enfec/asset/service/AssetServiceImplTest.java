package com.enfec.asset.service;

import com.enfec.asset.dto.AssetResponse;
import com.enfec.asset.dto.CreateAssetRequest;
import com.enfec.asset.dto.UpdateAssetStatusRequest;
import com.enfec.asset.entity.AssetEntity;
import com.enfec.asset.enums.AssetStatus;
import com.enfec.asset.exception.AssetNotFoundException;
import com.enfec.asset.repository.AssetRepository;
import com.enfec.asset.repository.AssetStatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceImplTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private AssetStatusHistoryRepository statusHistoryRepository;

    private AssetServiceImpl assetService;

    @BeforeEach
    void setUp() {
        assetService = new AssetServiceImpl(
                assetRepository,
                statusHistoryRepository
        );
    }

    @Test
    void createAsset_shouldDefaultToInStock() {

        CreateAssetRequest request = new CreateAssetRequest(
                "LAPTOP-001",
                "Dell Latitude 5450",
                "LAPTOP",
                "Dell",
                "Latitude 5450",
                null,
                null
        );

        AssetEntity saved = new AssetEntity(
                "LAPTOP-001",
                "Dell Latitude 5450",
                "LAPTOP",
                "Dell",
                "Latitude 5450",
                AssetStatus.IN_STOCK,
                null
        );

        when(assetRepository.save(any(AssetEntity.class)))
                .thenReturn(saved);

        AssetResponse response =
                assetService.createAsset(request);

        assertEquals(
                AssetStatus.IN_STOCK,
                response.status()
        );

        verify(assetRepository).save(any(AssetEntity.class));
    }

    @Test
    void updateStatus_shouldPersistSupportedStatus() {

        UUID id = UUID.randomUUID();

        AssetEntity asset = new AssetEntity(
                "LAPTOP-002",
                "HP EliteBook 840",
                "LAPTOP",
                "HP",
                "EliteBook 840",
                AssetStatus.IN_STOCK,
                null
        );

        when(assetRepository.findById(id))
                .thenReturn(Optional.of(asset));

        when(assetRepository.save(any(AssetEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        UpdateAssetStatusRequest request =
                new UpdateAssetStatusRequest(
                        AssetStatus.IN_REPAIR,
                        null
                );

        AssetResponse response =
                assetService.updateStatus(id, request);

        assertEquals(
                AssetStatus.IN_REPAIR,
                response.status()
        );

        verify(assetRepository).save(asset);
        verify(statusHistoryRepository).save(any());
    }

    @Test
    void updateStatus_shouldPersistEmployeeAssignment() {

        UUID id = UUID.randomUUID();

        AssetEntity asset = new AssetEntity(
                "LAPTOP-003",
                "Lenovo ThinkPad E14",
                "LAPTOP",
                "Lenovo",
                "ThinkPad E14",
                AssetStatus.IN_STOCK,
                null
        );

        when(assetRepository.findById(id))
                .thenReturn(Optional.of(asset));

        when(assetRepository.save(any(AssetEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        UpdateAssetStatusRequest request =
                new UpdateAssetStatusRequest(
                        AssetStatus.ASSIGNED,
                        "sam"
                );

        AssetResponse response =
                assetService.updateStatus(id, request);

        assertEquals(
                AssetStatus.ASSIGNED,
                response.status()
        );

        assertEquals(
                "sam",
                response.assignedTo()
        );

        verify(assetRepository).save(asset);
        verify(statusHistoryRepository).save(any());
    }

    @Test
    void getAssetById_shouldThrowWhenAssetDoesNotExist() {

        UUID id = UUID.randomUUID();

        when(assetRepository.findById(id))
                .thenReturn(Optional.empty());

        assertThrows(
                AssetNotFoundException.class,
                () -> assetService.getAssetById(id)
        );

        verify(assetRepository).findById(id);
    }
}