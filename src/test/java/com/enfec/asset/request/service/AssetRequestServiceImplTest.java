package com.enfec.asset.request.service;

import com.enfec.asset.employee.EmployeeAccountEntity;
import com.enfec.asset.employee.repository.EmployeeAccountRepository;
import com.enfec.asset.entity.AssetEntity;
import com.enfec.asset.enums.AssetStatus;
import com.enfec.asset.request.dto.FulfillRequest;
import com.enfec.asset.request.dto.CloseRequest;
import com.enfec.asset.request.dto.RequestAction;
import com.enfec.asset.request.enums.AssetRequestStatus;
import com.enfec.asset.repository.AssetRepository;
import com.enfec.asset.request.dto.AssetRequestResponse;
import com.enfec.asset.request.dto.CreateAssetRequest;
import com.enfec.asset.request.entity.AssetRequestEntity;
import com.enfec.asset.request.entity.AssetRequestHistoryEntity;
import com.enfec.asset.request.repository.AssetRequestHistoryRepository;
import com.enfec.asset.request.repository.AssetRequestRepository;
import com.enfec.asset.request.procurement.repository.AssetRequestProcurementRepository;
import com.enfec.asset.request.dto.RequestAction;
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
class AssetRequestServiceImplTest {

    @Mock
    private AssetRequestRepository requestRepository;

    @Mock
    private AssetRequestHistoryRepository historyRepository;

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private EmployeeAccountRepository employeeRepository;

    @Mock
    private AssetRequestProcurementRepository procurementRepository;

    private AssetRequestServiceImpl requestService;

    @BeforeEach
    void setUp() {
        requestService = new AssetRequestServiceImpl(
                requestRepository,
                historyRepository,
                assetRepository,
                employeeRepository,
                procurementRepository
        );
    }

    @Test
    void create_shouldCreateAssetRequestSuccessfully() {

        UUID assetId = UUID.randomUUID();

        AssetEntity asset = mock(AssetEntity.class);

        lenient().when(asset.getId())
                .thenReturn(assetId);

        lenient().when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        EmployeeAccountEntity approver =
                mock(EmployeeAccountEntity.class);

        when(approver.getRole())
                .thenReturn("HIGHER_AUTHORITY");

        when(employeeRepository.findByUsername("manager1"))
                .thenReturn(Optional.of(approver));

        when(requestRepository.count())
                .thenReturn(0L);

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        CreateAssetRequest input =
                new CreateAssetRequest(
                        "sam",
                        assetId,
                        1,
                        "HIGH",
                        "Laptop required for work",
                        null,
                        null,
                        "Hyderabad Office",
                        "manager1",
                        true
                );

        AssetRequestResponse response =
                requestService.create(
                        "sam",
                        "EMPLOYEE",
                        input
                );

        assertNotNull(response);
        assertEquals(
                "sam",
                response.employeeUsername()
        );
        assertEquals(
                assetId,
                response.assetId()
        );
        assertEquals(
                1,
                response.quantity()
        );

        verify(assetRepository).findById(assetId);
        verify(employeeRepository).findByUsername("manager1");
        verify(requestRepository).save(any(AssetRequestEntity.class));
        verify(historyRepository).save(
                any(AssetRequestHistoryEntity.class)
        );
    }

    @Test
    void create_shouldRejectWhenApproverDoesNotExist() {

        UUID assetId = UUID.randomUUID();

        AssetEntity asset = mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(employeeRepository.findByUsername("manager1"))
                .thenReturn(Optional.empty());

        CreateAssetRequest input =
                new CreateAssetRequest(
                        "sam",
                        assetId,
                        1,
                        "HIGH",
                        "Laptop required for work",
                        null,
                        null,
                        "Hyderabad Office",
                        "manager1",
                        true
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.create(
                                "sam",
                                "EMPLOYEE",
                                input
                        )
                );

        assertEquals(
                "Selected higher authority approver was not found.",
                exception.getMessage()
        );

        verify(assetRepository).findById(assetId);

        verify(employeeRepository)
                .findByUsername("manager1");

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void create_shouldRejectWhenApproverHasInvalidRole() {

        UUID assetId = UUID.randomUUID();

        AssetEntity asset = mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        EmployeeAccountEntity approver =
                mock(EmployeeAccountEntity.class);

        when(approver.getRole())
                .thenReturn("EMPLOYEE");

        when(employeeRepository.findByUsername("manager1"))
                .thenReturn(Optional.of(approver));

        CreateAssetRequest input =
                new CreateAssetRequest(
                        "sam",
                        assetId,
                        1,
                        "HIGH",
                        "Laptop required for work",
                        null,
                        null,
                        "Hyderabad Office",
                        "manager1",
                        true
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.create(
                                "sam",
                                "EMPLOYEE",
                                input
                        )
                );

        assertEquals(
                "Selected approver is not a valid higher authority.",
                exception.getMessage()
        );

        verify(assetRepository).findById(assetId);

        verify(employeeRepository)
                .findByUsername("manager1");

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void create_shouldRejectWhenManagerCreatesRequestForNonTeamMember() {

        UUID assetId = UUID.randomUUID();

        AssetEntity asset = mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(employeeRepository
                .findByManagerUsernameIgnoreCase("manager1"))
                .thenReturn(java.util.List.of());

        CreateAssetRequest input =
                new CreateAssetRequest(
                        "sam",
                        assetId,
                        1,
                        "HIGH",
                        "Laptop required for work",
                        null,
                        null,
                        "Hyderabad Office",
                        "manager2",
                        true
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.create(
                                "manager1",
                                "MANAGER",
                                input
                        )
                );

        assertEquals(
                "Managers can create requests only for employees in their team.",
                exception.getMessage()
        );

        verify(assetRepository).findById(assetId);

        verify(employeeRepository)
                .findByManagerUsernameIgnoreCase("manager1");

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void create_shouldAllowManagerToCreateRequestForTeamMember() {

        UUID assetId = UUID.randomUUID();

        AssetEntity asset = mock(AssetEntity.class);

        when(asset.getId())
                .thenReturn(assetId);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        EmployeeAccountEntity teamMember =
                mock(EmployeeAccountEntity.class);

        when(teamMember.getUsername())
                .thenReturn("sam");

        when(employeeRepository
                .findByManagerUsernameIgnoreCase("manager1"))
                .thenReturn(java.util.List.of(teamMember));

        EmployeeAccountEntity approver =
                mock(EmployeeAccountEntity.class);

        when(approver.getRole())
                .thenReturn("HIGHER_AUTHORITY");

        when(employeeRepository.findByUsername("manager2"))
                .thenReturn(Optional.of(approver));

        when(requestRepository.count())
                .thenReturn(0L);

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        CreateAssetRequest input =
                new CreateAssetRequest(
                        "sam",
                        assetId,
                        1,
                        "HIGH",
                        "Laptop required for work",
                        null,
                        null,
                        "Hyderabad Office",
                        "manager2",
                        true
                );

        AssetRequestResponse response =
                requestService.create(
                        "manager1",
                        "MANAGER",
                        input
                );

        assertNotNull(response);

        assertEquals(
                "sam",
                response.employeeUsername()
        );

        assertEquals(
                assetId,
                response.assetId()
        );

        assertEquals(
                1,
                response.quantity()
        );

        verify(employeeRepository)
                .findByManagerUsernameIgnoreCase("manager1");

        verify(employeeRepository)
                .findByUsername("manager2");

        verify(requestRepository)
                .save(any(AssetRequestEntity.class));

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void approve_shouldMoveRequestToFinancePending() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getApproverUsername())
                .thenReturn("manager1");

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.PENDING_APPROVAL);

        when(request.isRequiresFinanceApproval())
                .thenReturn(true);

        when(request.getAssetId())
                .thenReturn(assetId);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset =
                mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        RequestAction action =
                mock(RequestAction.class);

        AssetRequestResponse response =
                requestService.approve(
                        requestId,
                        "manager1",
                        "HIGHER_AUTHORITY",
                        action
                );

        assertNotNull(response);

        verify(request).setStatus(
                AssetRequestStatus.FINANCE_PENDING
        );

        verify(requestRepository)
                .save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));

        verify(assetRepository)
                .findById(assetId);
    }

    @Test
    void approve_shouldRejectWhenActorIsNotSelectedApprover() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getApproverUsername())
                .thenReturn("manager1");

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        RequestAction action =
                mock(RequestAction.class);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.approve(
                                requestId,
                                "manager2",
                                "HIGHER_AUTHORITY",
                                action
                        )
                );

        assertEquals(
                "Only the selected higher authority approver can approve this request.",
                exception.getMessage()
        );

        verify(requestRepository)
                .findById(requestId);

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void create_shouldRejectWhenRequiredToIsBeforeRequiredFrom() {

        UUID assetId = UUID.randomUUID();

        AssetEntity asset = mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        EmployeeAccountEntity approver =
                mock(EmployeeAccountEntity.class);

        when(approver.getRole())
                .thenReturn("HIGHER_AUTHORITY");

        when(employeeRepository.findByUsername("manager1"))
                .thenReturn(Optional.of(approver));

        CreateAssetRequest input =
                new CreateAssetRequest(
                        "sam",
                        assetId,
                        1,
                        "HIGH",
                        "Laptop required for work",
                        java.time.LocalDate.of(2026, 10, 10),
                        java.time.LocalDate.of(2026, 10, 5),
                        "Hyderabad Office",
                        "manager1",
                        true
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.create(
                                "sam",
                                "EMPLOYEE",
                                input
                        )
                );

        assertEquals(
                "Required-to date cannot be before required-from date.",
                exception.getMessage()
        );

        verify(assetRepository).findById(assetId);

        verify(employeeRepository)
                .findByUsername("manager1");

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void approve_shouldMoveRequestToProcurementPendingWhenFinanceNotRequired() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getApproverUsername())
                .thenReturn("manager1");

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.PENDING_APPROVAL);

        when(request.isRequiresFinanceApproval())
                .thenReturn(false);

        when(request.getAssetId())
                .thenReturn(assetId);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset =
                mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        RequestAction action =
                mock(RequestAction.class);

        AssetRequestResponse response =
                requestService.approve(
                        requestId,
                        "manager1",
                        "HIGHER_AUTHORITY",
                        action
                );

        assertNotNull(response);

        verify(request).setStatus(
                AssetRequestStatus.PROCUREMENT_PENDING
        );

        verify(requestRepository)
                .save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));

        verify(assetRepository)
                .findById(assetId);
    }

    @Test
    void reject_shouldMoveRequestToRejected() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getApproverUsername())
                .thenReturn("manager1");

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.PENDING_APPROVAL);

        RequestAction action =
                mock(RequestAction.class);

        AssetRequestResponse response =
                requestService.reject(
                        requestId,
                        "manager1",
                        "HIGHER_AUTHORITY",
                        action
                );

        assertNotNull(response);

        verify(request)
                .setStatus(AssetRequestStatus.REJECTED);

        verify(requestRepository)
                .save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void reject_shouldRejectWhenActorIsNotSelectedApprover() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getApproverUsername())
                .thenReturn("manager1");

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        RequestAction action =
                mock(RequestAction.class);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.reject(
                                requestId,
                                "manager2",
                                "HIGHER_AUTHORITY",
                                action
                        )
                );

        assertEquals(
                "Only the selected higher authority approver can reject this request.",
                exception.getMessage()
        );

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void financeApprove_shouldMoveRequestToProcurementPending() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FINANCE_PENDING);

        when(request.getAssetId())
                .thenReturn(assetId);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset =
                mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        RequestAction action =
                mock(RequestAction.class);

        AssetRequestResponse response =
                requestService.financeApprove(
                        requestId,
                        "finance1",
                        "FINANCE",
                        action
                );

        assertNotNull(response);

        verify(request)
                .setStatus(AssetRequestStatus.PROCUREMENT_PENDING);

        verify(request)
                .setFinanceUsername("finance1");

        verify(requestRepository)
                .save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));

        verify(assetRepository)
                .findById(assetId);
    }

    @Test
    void financeReject_shouldMoveRequestToRejected() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FINANCE_PENDING);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        RequestAction action =
                mock(RequestAction.class);

        AssetRequestResponse response =
                requestService.financeReject(
                        requestId,
                        "finance1",
                        "FINANCE",
                        action
                );

        assertNotNull(response);

        verify(request)
                .setFinanceUsername("finance1");

        verify(request)
                .setStatus(AssetRequestStatus.REJECTED);

        verify(requestRepository)
                .save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void financeApprove_shouldRejectUnauthorizedRole() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        RequestAction action =
                mock(RequestAction.class);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.financeApprove(
                                requestId,
                                "sam",
                                "EMPLOYEE",
                                action
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void approve_shouldRejectWhenRequestIsNotPendingApproval() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getApproverUsername())
                .thenReturn("manager1");

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FINANCE_PENDING);

        RequestAction action =
                mock(RequestAction.class);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.approve(
                                requestId,
                                "manager1",
                                "HIGHER_AUTHORITY",
                                action
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void reject_shouldRejectWhenRequestIsNotPendingApproval() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getApproverUsername())
                .thenReturn("manager1");

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FINANCE_PENDING);

        RequestAction action =
                mock(RequestAction.class);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.reject(
                                requestId,
                                "manager1",
                                "HIGHER_AUTHORITY",
                                action
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void financeApprove_shouldRejectWhenRequestIsNotFinancePending() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.PENDING_APPROVAL);

        RequestAction action =
                mock(RequestAction.class);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.financeApprove(
                                requestId,
                                "finance1",
                                "FINANCE",
                                action
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void financeReject_shouldRejectUnauthorizedRole() {

        UUID requestId = UUID.randomUUID();

        RequestAction action =
                mock(RequestAction.class);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.financeReject(
                                requestId,
                                "sam",
                                "EMPLOYEE",
                                action
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void financeReject_shouldRejectWhenRequestIsNotFinancePending() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.PROCUREMENT_PENDING);

        RequestAction action =
                mock(RequestAction.class);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.financeReject(
                                requestId,
                                "finance1",
                                "FINANCE",
                                action
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void fulfill_shouldAssignAvailableAssetAndMarkRequestFulfilled() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FULFILLMENT_PENDING);

        when(request.getAssetId())
                .thenReturn(assetId);

        when(request.getEmployeeUsername())
                .thenReturn("sam");

        when(request.getQuantity())
                .thenReturn(1);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset =
                mock(AssetEntity.class);

        when(asset.getStatus())
                .thenReturn(AssetStatus.IN_STOCK);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        RequestAction action =
                mock(RequestAction.class);

        FulfillRequest input =
                new FulfillRequest(
                        "sam",
                        assetId
                );

        AssetRequestResponse response =
                requestService.fulfill(
                        requestId,
                        "hr1",
                        "HR",
                        input
                );

        assertNotNull(response);

        verify(asset)
                .setStatus(AssetStatus.ASSIGNED);

        verify(asset)
                .setAssignedTo("sam");

        verify(assetRepository)
                .save(asset);

        verify(request)
                .setAssignedUsername("sam");

        verify(request)
                .setStatus(AssetRequestStatus.ASSIGNED);

        verify(request)
                .setStatus(AssetRequestStatus.FULFILLED);

        verify(requestRepository, atLeast(2))
                .save(request);

        verify(historyRepository, times(2))
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void fulfill_shouldRejectWhenSelectedAssetDoesNotExist() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FULFILLMENT_PENDING);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.empty());

        FulfillRequest input =
                new FulfillRequest(
                        "sam",
                        assetId
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.fulfill(
                                requestId,
                                "hr1",
                                "HR",
                                input
                        )
                );

        assertEquals(
                "Selected asset was not found.",
                exception.getMessage()
        );

        verify(assetRepository)
                .findById(assetId);

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(assetRepository, never())
                .save(any(AssetEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void fulfill_shouldRejectWhenSelectedAssetIsNotInStock() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FULFILLMENT_PENDING);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset =
                mock(AssetEntity.class);

        when(asset.getStatus())
                .thenReturn(AssetStatus.ASSIGNED);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        FulfillRequest input =
                new FulfillRequest(
                        "sam",
                        assetId
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.fulfill(
                                requestId,
                                "hr1",
                                "HR",
                                input
                        )
                );

        assertEquals(
                "The selected asset is not currently available for fulfillment.",
                exception.getMessage()
        );

        verify(assetRepository)
                .findById(assetId);

        verify(assetRepository, never())
                .save(any(AssetEntity.class));

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void fulfill_shouldRejectWhenQuantityIsGreaterThanOne() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FULFILLMENT_PENDING);

        when(request.getQuantity())
                .thenReturn(2);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset =
                mock(AssetEntity.class);

        when(asset.getStatus())
                .thenReturn(AssetStatus.IN_STOCK);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        FulfillRequest input =
                new FulfillRequest(
                        "sam",
                        assetId
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.fulfill(
                                requestId,
                                "hr1",
                                "HR",
                                input
                        )
                );

        assertEquals(
                "Fulfillment currently supports one inventory asset per request. Create separate requests for additional assets.",
                exception.getMessage()
        );

        verify(assetRepository)
                .findById(assetId);

        verify(assetRepository, never())
                .save(any(AssetEntity.class));

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void close_shouldMarkRequestAsClosed() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FULFILLED);

        when(request.getAssetId())
                .thenReturn(assetId);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset =
                mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        CloseRequest input =
                new CloseRequest("Request completed successfully");

        AssetRequestResponse response =
                requestService.close(
                        requestId,
                        "hr1",
                        "HR",
                        input
                );

        assertNotNull(response);

        verify(request)
                .setStatus(AssetRequestStatus.CLOSED);

        verify(request)
                .setClosedBy("hr1");

        verify(request)
                .setClosureNote(
                        "Request completed successfully"
                );

        verify(requestRepository)
                .save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));

        verify(assetRepository)
                .findById(assetId);
    }

    @Test
    void close_shouldRejectWhenRequestIsNotFulfilled() {

        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.ASSIGNED);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        CloseRequest input =
                new CloseRequest("Attempted to close early");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.close(
                                requestId,
                                "hr1",
                                "HR",
                                input
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void close_shouldRejectUnauthorizedRole() {

        UUID requestId = UUID.randomUUID();

        CloseRequest input =
                new CloseRequest("Attempted close");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.close(
                                requestId,
                                "employee1",
                                "EMPLOYEE",
                                input
                        )
                );

        assertEquals(
                "You are not authorized to perform this request action.",
                exception.getMessage()
        );

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void close_shouldRejectWhenRequestDoesNotExist() {

        UUID requestId = UUID.randomUUID();

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.empty());

        CloseRequest input =
                new CloseRequest("Attempted close");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.close(
                                requestId,
                                "hr1",
                                "HR",
                                input
                        )
                );

        assertEquals(
                "Asset request was not found: " + requestId,
                exception.getMessage()
        );

        verify(requestRepository)
                .findById(requestId);

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void close_shouldAllowNullClosureInput() {

        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request =
                mock(AssetRequestEntity.class);

        when(request.getStatus())
                .thenReturn(AssetRequestStatus.FULFILLED);

        when(request.getAssetId())
                .thenReturn(assetId);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset =
                mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0));

        AssetRequestResponse response =
                requestService.close(
                        requestId,
                        "hr1",
                        "HR",
                        null
                );

        assertNotNull(response);

        verify(request)
                .setStatus(AssetRequestStatus.CLOSED);

        verify(request)
                .setClosedBy("hr1");

        verify(request)
                .setClosureNote(null);

        verify(requestRepository)
                .save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void fulfill_shouldRejectUnauthorizedRole() {

        UUID requestId = UUID.randomUUID();

        FulfillRequest input =
                new FulfillRequest(
                        "sam",
                        UUID.randomUUID()
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.fulfill(
                                requestId,
                                "employee1",
                                "EMPLOYEE",
                                input
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(assetRepository, never())
                .save(any(AssetEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void higherAuthorityFinalApprove_shouldApproveRequest() {
        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request = mock(AssetRequestEntity.class);

        when(request.getStatus()).thenReturn(AssetRequestStatus.HIGHER_AUTHORITY_PENDING);
        when(request.getApproverUsername()).thenReturn("ha1");
        when(request.getAssetId()).thenReturn(assetId);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset = mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RequestAction action = new RequestAction("Final approval");

        AssetRequestResponse response =
                requestService.higherAuthorityFinalApprove(
                        requestId,
                        "ha1",
                        "HIGHER_AUTHORITY",
                        action
                );

        assertNotNull(response);

        verify(request).setStatus(
                AssetRequestStatus.HIGHER_AUTHORITY_APPROVED
        );

        verify(requestRepository).save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));

        verify(assetRepository).findById(assetId);
    }

    @Test
    void higherAuthorityFinalApprove_shouldRejectWrongApprover() {
        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request = mock(AssetRequestEntity.class);

        when(request.getApproverUsername()).thenReturn("ha1");

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        RequestAction action = new RequestAction("Final approval");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.higherAuthorityFinalApprove(
                                requestId,
                                "different-user",
                                "HIGHER_AUTHORITY",
                                action
                        )
                );

        assertEquals(
                "Only the selected higher authority approver can give the final approval.",
                exception.getMessage()
        );

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void higherAuthorityFinalApprove_shouldRejectWhenStatusIsInvalid() {
        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request = mock(AssetRequestEntity.class);

        when(request.getApproverUsername()).thenReturn("ha1");
        when(request.getStatus()).thenReturn(
                AssetRequestStatus.FINANCE_PENDING
        );

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        RequestAction action = new RequestAction("Final approval");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.higherAuthorityFinalApprove(
                                requestId,
                                "ha1",
                                "HIGHER_AUTHORITY",
                                action
                        )
                );

        assertNotNull(exception.getMessage());

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void higherAuthorityFinalReject_shouldRejectRequest() {
        UUID requestId = UUID.randomUUID();
        UUID assetId = UUID.randomUUID();

        AssetRequestEntity request = mock(AssetRequestEntity.class);

        when(request.getStatus()).thenReturn(
                AssetRequestStatus.HIGHER_AUTHORITY_PENDING
        );

        when(request.getApproverUsername()).thenReturn("ha1");
        when(request.getAssetId()).thenReturn(assetId);

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        AssetEntity asset = mock(AssetEntity.class);

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.of(asset));

        when(requestRepository.save(any(AssetRequestEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RequestAction action = new RequestAction("Budget not approved");

        AssetRequestResponse response =
                requestService.higherAuthorityFinalReject(
                        requestId,
                        "ha1",
                        "HIGHER_AUTHORITY",
                        action
                );

        assertNotNull(response);

        verify(request).setStatus(
                AssetRequestStatus.HIGHER_AUTHORITY_REJECTED
        );

        verify(requestRepository).save(request);

        verify(historyRepository)
                .save(any(AssetRequestHistoryEntity.class));

        verify(assetRepository).findById(assetId);
    }

    @Test
    void higherAuthorityFinalReject_shouldRejectWrongApprover() {
        UUID requestId = UUID.randomUUID();

        AssetRequestEntity request = mock(AssetRequestEntity.class);

        when(request.getApproverUsername()).thenReturn("ha1");

        when(requestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        RequestAction action = new RequestAction("Reject request");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.higherAuthorityFinalReject(
                                requestId,
                                "different-user",
                                "HIGHER_AUTHORITY",
                                action
                        )
                );

        assertEquals(
                "Only the selected higher authority approver can give the final rejection.",
                exception.getMessage()
        );

        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));

        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }

    @Test
    void create_shouldRejectWhenAssetDoesNotExist() {

        UUID assetId = UUID.randomUUID();

        when(assetRepository.findById(assetId))
                .thenReturn(Optional.empty());

        CreateAssetRequest input =
                new CreateAssetRequest(
                        "sam",
                        assetId,
                        1,
                        "HIGH",
                        "Laptop required",
                        null,
                        null,
                        "Hyderabad Office",
                        "manager1",
                        true
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> requestService.create(
                                "sam",
                                "EMPLOYEE",
                                input
                        )
                );

        assertEquals(
                "Selected asset was not found.",
                exception.getMessage()
        );

        verify(assetRepository).findById(assetId);
        verify(requestRepository, never())
                .save(any(AssetRequestEntity.class));
        verify(historyRepository, never())
                .save(any(AssetRequestHistoryEntity.class));
    }
}