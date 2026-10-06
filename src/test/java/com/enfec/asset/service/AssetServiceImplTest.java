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
                null,
                "DL5450-001",
                "NEW",
                null,
                null,
                null,
                null,
                "Dell India",
                null,
                "INV-001",
                "PO-001",
                null,
                "Hyderabad Office",
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
    void createAsset_shouldRejectAssignedAssetWithoutEmployee() {

        CreateAssetRequest request = new CreateAssetRequest(
                "LAPTOP-009",
                "MacBook Pro",
                "LAPTOP",
                "Apple",
                "MacBook Pro 14-inch",
                AssetStatus.ASSIGNED,
                null,
                "APPLE-SN-009",
                "NEW",
                null,
                null,
                null,
                null,
                "Apple India",
                new java.math.BigDecimal("150000"),
                "INV-009",
                "PO-009",
                null,
                "Hyderabad Office",
                null,
                null
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> assetService.createAsset(request)
        );

        verify(assetRepository, never())
                .save(any(AssetEntity.class));
    }

    @Test
    void createAsset_shouldPersistAssetDetails() {

        CreateAssetRequest request = new CreateAssetRequest(
                "MOUSE-002",
                "Logitech MX Master 3S",
                "MOUSE",
                "Logitech",
                "MX Master 3S",
                null,
                null,
                "LOGI-MX3S-002",
                "NEW",
                java.time.LocalDate.of(2026, 10, 5),
                java.time.LocalDate.of(2026, 10, 5),
                java.time.LocalDate.of(2028, 10, 5),
                java.time.LocalDate.of(2030, 10, 5),
                "Logitech India",
                new java.math.BigDecimal("8500"),
                "INV-MOUSE-002",
                "PO-MOUSE-002",
                null,
                "Hyderabad Office",
                null,
                null
        );

        when(assetRepository.save(any(AssetEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        AssetResponse response =
                assetService.createAsset(request);

        assertEquals("LOGI-MX3S-002", response.serialNumber());
        assertEquals("NEW", response.condition());
        assertEquals(
                java.time.LocalDate.of(2026, 10, 5),
                response.purchaseDate()
        );
        assertEquals(
                java.time.LocalDate.of(2026, 10, 5),
                response.warrantyStartDate()
        );
        assertEquals(
                java.time.LocalDate.of(2028, 10, 5),
                response.warrantyExpiryDate()
        );
        assertEquals(
                java.time.LocalDate.of(2030, 10, 5),
                response.assetExpiryDate()
        );
        assertEquals("Logitech India", response.vendor());
        assertEquals(
                new java.math.BigDecimal("8500"),
                response.purchasePrice()
        );
        assertEquals("INV-MOUSE-002", response.invoiceNumber());
        assertEquals("PO-MOUSE-002", response.purchaseOrderNumber());
        assertEquals("Hyderabad Office", response.location());

        verify(assetRepository).save(any(AssetEntity.class));
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

