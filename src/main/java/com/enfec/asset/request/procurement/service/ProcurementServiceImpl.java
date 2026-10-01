package com.enfec.asset.request.procurement.service;

import com.enfec.asset.request.procurement.dto.ProcurementRequest;
import com.enfec.asset.request.procurement.dto.ProcurementResponse;
import com.enfec.asset.request.procurement.entity.AssetRequestProcurementEntity;
import com.enfec.asset.request.procurement.repository.AssetRequestProcurementRepository;
import com.enfec.asset.request.entity.AssetRequestEntity;
import com.enfec.asset.request.entity.AssetRequestHistoryEntity;
import com.enfec.asset.request.enums.AssetRequestStatus;
import com.enfec.asset.request.repository.AssetRequestHistoryRepository;
import com.enfec.asset.request.repository.AssetRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProcurementServiceImpl implements ProcurementService {

    private final AssetRequestProcurementRepository procurementRepository;
    private final AssetRequestRepository requestRepository;
    private final AssetRequestHistoryRepository historyRepository;

    public ProcurementServiceImpl(
            AssetRequestProcurementRepository procurementRepository,
            AssetRequestRepository requestRepository,
            AssetRequestHistoryRepository historyRepository
    ) {
        this.procurementRepository = procurementRepository;
        this.requestRepository = requestRepository;
        this.historyRepository = historyRepository;
    }

    @Override
    public ProcurementResponse create(
            UUID requestId,
            String actorUsername,
            String actorRole,
            ProcurementRequest input
    ) {
        requireRole(actorRole, "PROCUREMENT", "SYSTEM_ADMIN");

        if (procurementRepository.findByRequestId(requestId).isPresent()) {
            throw new IllegalArgumentException(
                    "Procurement record already exists for this asset request."
            );
        }

        AssetRequestProcurementEntity procurement =
                new AssetRequestProcurementEntity(
                        requestId,
                        actorUsername
                );

        applyInput(procurement, input);

        AssetRequestProcurementEntity saved =
                procurementRepository.save(procurement);

        System.out.println("========== PROCUREMENT CREATE ==========");
        System.out.println("Request ID: " + requestId);
        System.out.println("PO NUMBER RECEIVED: "
                + (input == null ? null : input.purchaseOrderNumber()));
        System.out.println("PO NUMBER SAVED: "
                + saved.getPurchaseOrderNumber());
        System.out.println("Procurement ID: " + saved.getId());
        System.out.println("========================================");

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProcurementResponse get(
            UUID requestId,
            String actorUsername,
            String actorRole
    ) {
        requireRole(actorRole, "PROCUREMENT", "SYSTEM_ADMIN");

        AssetRequestProcurementEntity procurement =
                getEntity(requestId);

        System.out.println("========== PROCUREMENT GET ==========");
        System.out.println("Request ID: " + requestId);
        System.out.println("PO NUMBER FROM DATABASE: "
                + procurement.getPurchaseOrderNumber());
        System.out.println("Procurement ID: " + procurement.getId());
        System.out.println("Status: " + procurement.getStatus());
        System.out.println("=====================================");

        return toResponse(procurement);
    }

    @Override
    public ProcurementResponse update(
            UUID requestId,
            String actorUsername,
            String actorRole,
            ProcurementRequest input
    ) {
        requireRole(actorRole, "PROCUREMENT", "SYSTEM_ADMIN");

        AssetRequestProcurementEntity procurement =
                getEntity(requestId);

        /*
         * ---------------------------------------------------------
         * DEBUG LOG - BEFORE APPLYING INPUT
         * ---------------------------------------------------------
         */
        System.out.println("========== PROCUREMENT UPDATE ==========");
        System.out.println("Request ID: " + requestId);
        System.out.println("Procurement ID: " + procurement.getId());
        System.out.println("Existing PO NUMBER: "
                + procurement.getPurchaseOrderNumber());

        System.out.println("PO NUMBER RECEIVED: "
                + (input == null
                ? null
                : input.purchaseOrderNumber()));

        System.out.println("Vendor received: "
                + (input == null
                ? null
                : input.vendorName()));

        System.out.println("Quotation received: "
                + (input == null
                ? null
                : input.quotationNumber()));

        /*
         * ---------------------------------------------------------
         * APPLY REQUEST DATA
         * ---------------------------------------------------------
         */
        applyInput(procurement, input);

        /*
         * ---------------------------------------------------------
         * DEBUG LOG - AFTER APPLYING INPUT
         * ---------------------------------------------------------
         */
        System.out.println("PO NUMBER AFTER applyInput: "
                + procurement.getPurchaseOrderNumber());

        /*
         * ---------------------------------------------------------
         * SAVE ENTITY
         * ---------------------------------------------------------
         */
        AssetRequestProcurementEntity saved =
                procurementRepository.save(procurement);

        /*
         * ---------------------------------------------------------
         * DEBUG LOG - AFTER SAVE
         * ---------------------------------------------------------
         */
        System.out.println("PO NUMBER AFTER repository.save(): "
                + saved.getPurchaseOrderNumber());

        System.out.println("Status AFTER SAVE: "
                + saved.getStatus());

        System.out.println("Updated At: "
                + saved.getUpdatedAt());

        System.out.println("========================================");

        return toResponse(saved);
    }

    @Override
    public ProcurementResponse start(
            UUID requestId,
            String actorUsername,
            String actorRole
    ) {
        requireRole(actorRole, "PROCUREMENT", "SYSTEM_ADMIN");

        AssetRequestProcurementEntity procurement =
                getEntity(requestId);

        requireStatus(procurement, "PENDING");

        AssetRequestEntity request =
                getAssetRequest(requestId);

        requireRequestStatus(
                request,
                AssetRequestStatus.PROCUREMENT_PENDING
        );

        procurement.setStatus("QUOTATION_RECEIVED");

        ProcurementResponse response =
                toResponse(
                        procurementRepository.save(procurement)
                );

        changeRequestStatus(
                request,
                AssetRequestStatus.PROCUREMENT_IN_PROGRESS,
                actorUsername,
                "PROCUREMENT_STARTED"
        );

        return response;
    }

    @Override
    public ProcurementResponse createPurchaseOrder(
            UUID requestId,
            String actorUsername,
            String actorRole
    ) {
        requireRole(actorRole, "PROCUREMENT", "SYSTEM_ADMIN");

        AssetRequestProcurementEntity procurement =
                getEntity(requestId);

        requireStatus(
                procurement,
                "QUOTATION_RECEIVED"
        );

        System.out.println("========== CREATE PURCHASE ORDER ==========");
        System.out.println("Request ID: " + requestId);
        System.out.println("Procurement ID: " + procurement.getId());
        System.out.println("PO NUMBER FROM DATABASE: "
                + procurement.getPurchaseOrderNumber());
        System.out.println("Procurement Status: "
                + procurement.getStatus());
        System.out.println("===========================================");

        if (isBlank(procurement.getPurchaseOrderNumber())) {
            throw new IllegalArgumentException(
                    "Purchase order number is required before creating the purchase order."
            );
        }

        AssetRequestEntity request =
                getAssetRequest(requestId);

        requireRequestStatus(
                request,
                AssetRequestStatus.PROCUREMENT_IN_PROGRESS
        );

        /*
         * Procurement record becomes PO_CREATED.
         */
        procurement.setStatus("PO_CREATED");

        ProcurementResponse response =
                toResponse(
                        procurementRepository.save(procurement)
                );

        /*
         * NEW FLOW:
         *
         * Purchase Order Created
         *          ↓
         * Finance reviews the budget.
         */
        changeRequestStatus(
                request,
                AssetRequestStatus.FINANCE_PENDING,
                actorUsername,
                "PURCHASE_ORDER_CREATED_FINANCE_PENDING"
        );

        return response;
    }

    // =========================================================
    // FINANCE APPROVE
    // =========================================================

    @Override
    public ProcurementResponse financeApprove(
            UUID requestId,
            String actorUsername,
            String actorRole,
            ProcurementRequest input
    ) {
        requireRole(actorRole, "FINANCE", "SYSTEM_ADMIN");

        AssetRequestProcurementEntity procurement =
                getEntity(requestId);

        AssetRequestEntity request =
                getAssetRequest(requestId);

        requireRequestStatus(
                request,
                AssetRequestStatus.FINANCE_PENDING
        );

        if (input == null) {
            throw new IllegalArgumentException(
                    "Finance approval details are required."
            );
        }

        if (input.budgetAmount() == null) {
            throw new IllegalArgumentException(
                    "Budget amount is required for Finance approval."
            );
        }

        if (input.approvedBudget() == null) {
            throw new IllegalArgumentException(
                    "Approved budget is required for Finance approval."
            );
        }

        if (input.budgetAmount().signum() < 0) {
            throw new IllegalArgumentException(
                    "Budget amount cannot be negative."
            );
        }

        if (input.approvedBudget().signum() < 0) {
            throw new IllegalArgumentException(
                    "Approved budget cannot be negative."
            );
        }

        procurement.setBudgetAmount(
                input.budgetAmount()
        );

        procurement.setApprovedBudget(
                input.approvedBudget()
        );

        procurement.setFinanceDecision(
                "APPROVED"
        );

        procurement.setFinanceComment(
                input.financeComment() == null
                        ? null
                        : input.financeComment().trim()
        );

        procurement.setFinanceUsername(
                actorUsername
        );

        procurement.setFinanceApprovedAt(
                Instant.now()
        );

        AssetRequestProcurementEntity saved =
                procurementRepository.save(procurement);

        /*
         * Finance approved.
         *
         * Next stage:
         * Higher Authority final approval.
         */
        changeRequestStatus(
                request,
                AssetRequestStatus.HIGHER_AUTHORITY_PENDING,
                actorUsername,
                "FINANCE_APPROVED"
        );

        return toResponse(saved);
    }

    // =========================================================
    // FINANCE REJECT
    // =========================================================

    @Override
    public ProcurementResponse financeReject(
            UUID requestId,
            String actorUsername,
            String actorRole,
            ProcurementRequest input
    ) {
        requireRole(actorRole, "FINANCE", "SYSTEM_ADMIN");

        AssetRequestProcurementEntity procurement =
                getEntity(requestId);

        AssetRequestEntity request =
                getAssetRequest(requestId);

        requireRequestStatus(
                request,
                AssetRequestStatus.FINANCE_PENDING
        );

        /*
         * Budget is optional when Finance rejects.
         */
        if (input != null) {

            if (input.budgetAmount() != null) {

                if (input.budgetAmount().signum() < 0) {
                    throw new IllegalArgumentException(
                            "Budget amount cannot be negative."
                    );
                }

                procurement.setBudgetAmount(
                        input.budgetAmount()
                );
            }

            if (input.approvedBudget() != null) {

                if (input.approvedBudget().signum() < 0) {
                    throw new IllegalArgumentException(
                            "Approved budget cannot be negative."
                    );
                }

                procurement.setApprovedBudget(
                        input.approvedBudget()
                );
            }

            if (input.financeComment() != null) {
                procurement.setFinanceComment(
                        input.financeComment().trim()
                );
            }
        }

        procurement.setFinanceDecision(
                "REJECTED"
        );

        procurement.setFinanceUsername(
                actorUsername
        );

        procurement.setFinanceApprovedAt(
                Instant.now()
        );

        AssetRequestProcurementEntity saved =
                procurementRepository.save(procurement);

        changeRequestStatus(
                request,
                AssetRequestStatus.FINANCE_REJECTED,
                actorUsername,
                "FINANCE_REJECTED"
        );

        return toResponse(saved);
    }

    // =========================================================
    // PLACE ORDER
    // =========================================================

    @Override
    public ProcurementResponse order(
            UUID requestId,
            String actorUsername,
            String actorRole
    ) {
        requireRole(actorRole, "PROCUREMENT", "SYSTEM_ADMIN");

        AssetRequestProcurementEntity procurement =
                getEntity(requestId);

        requireStatus(
                procurement,
                "PO_CREATED"
        );

        AssetRequestEntity request =
                getAssetRequest(requestId);

        /*
         * Procurement can place the order only after:
         *
         * Finance APPROVED
         *        +
         * Higher Authority APPROVED
         */
        requireRequestStatus(
                request,
                AssetRequestStatus.HIGHER_AUTHORITY_APPROVED
        );

        procurement.setStatus("ORDERED");

        ProcurementResponse response =
                toResponse(
                        procurementRepository.save(procurement)
                );

        changeRequestStatus(
                request,
                AssetRequestStatus.ORDERED,
                actorUsername,
                "PROCUREMENT_ORDERED"
        );

        return response;
    }

    // =========================================================
    // RECEIVE
    // =========================================================

    @Override
    public ProcurementResponse receive(
            UUID requestId,
            String actorUsername,
            String actorRole
    ) {
        requireRole(actorRole, "PROCUREMENT", "SYSTEM_ADMIN");

        AssetRequestProcurementEntity procurement =
                getEntity(requestId);

        requireStatus(
                procurement,
                "ORDERED"
        );

        AssetRequestEntity request =
                getAssetRequest(requestId);

        requireRequestStatus(
                request,
                AssetRequestStatus.ORDERED
        );

        procurement.setStatus("RECEIVED");

        ProcurementResponse response =
                toResponse(
                        procurementRepository.save(procurement)
                );

        changeRequestStatus(
                request,
                AssetRequestStatus.RECEIVED,
                actorUsername,
                "ASSET_RECEIVED"
        );

        changeRequestStatus(
                request,
                AssetRequestStatus.FULFILLMENT_PENDING,
                actorUsername,
                "FULFILLMENT_PENDING"
        );

        return response;
    }

    // =========================================================
    // ENTITY HELPERS
    // =========================================================

    private AssetRequestProcurementEntity getEntity(
            UUID requestId
    ) {
        return procurementRepository.findByRequestId(requestId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Procurement record was not found for asset request: "
                                        + requestId
                        )
                );
    }

    private void applyInput(
            AssetRequestProcurementEntity procurement,
            ProcurementRequest input
    ) {
        if (input == null) {
            return;
        }

        if (input.vendorName() != null) {
            procurement.setVendorName(
                    input.vendorName().trim()
            );
        }

        if (input.vendorContact() != null) {
            procurement.setVendorContact(
                    input.vendorContact().trim()
            );
        }

        if (input.quotationNumber() != null) {
            procurement.setQuotationNumber(
                    input.quotationNumber().trim()
            );
        }

        if (input.quotationAmount() != null) {

            if (input.quotationAmount().signum() < 0) {
                throw new IllegalArgumentException(
                        "Quotation amount cannot be negative."
                );
            }

            procurement.setQuotationAmount(
                    input.quotationAmount()
            );
        }

        if (input.currency() != null) {
            procurement.setCurrency(
                    input.currency()
                            .trim()
                            .toUpperCase()
            );
        }

        /*
         * IMPORTANT:
         * Persist Purchase Order Number.
         */
        if (input.purchaseOrderNumber() != null) {

            String poNumber =
                    input.purchaseOrderNumber().trim();

            procurement.setPurchaseOrderNumber(
                    poNumber.isBlank()
                            ? null
                            : poNumber
            );
        }

        if (input.expectedDeliveryDate() != null) {
            procurement.setExpectedDeliveryDate(
                    input.expectedDeliveryDate()
            );
        }

        if (input.status() != null
                && !input.status().isBlank()) {

            String requestedStatus =
                    input.status()
                            .trim()
                            .toUpperCase();

            requireAllowedStatus(
                    requestedStatus
            );

            procurement.setStatus(
                    requestedStatus
            );
        }

        if (input.remarks() != null) {
            procurement.setRemarks(
                    input.remarks().trim()
            );
        }
    }

    private void requireStatus(
            AssetRequestProcurementEntity procurement,
            String... allowed
    ) {
        if (Arrays.stream(allowed)
                .noneMatch(
                        status ->
                                status.equalsIgnoreCase(
                                        procurement.getStatus()
                                )
                )) {

            throw new IllegalArgumentException(
                    "Procurement record is currently "
                            + procurement.getStatus()
                            + " and cannot perform this action."
            );
        }
    }

    private void requireAllowedStatus(
            String status
    ) {
        List<String> allowed =
                List.of(
                        "PENDING",
                        "QUOTATION_RECEIVED",
                        "PO_CREATED",
                        "ORDERED",
                        "RECEIVED",
                        "CANCELLED"
                );

        if (!allowed.contains(status)) {
            throw new IllegalArgumentException(
                    "Invalid procurement status: "
                            + status
            );
        }
    }

    private void requireRole(
            String role,
            String... allowedRoles
    ) {
        if (role == null
                || Arrays.stream(allowedRoles)
                .noneMatch(
                        r -> r.equalsIgnoreCase(role)
                )) {

            throw new IllegalArgumentException(
                    "You are not authorized to perform this procurement action."
            );
        }
    }

    private boolean isBlank(
            String value
    ) {
        return value == null
                || value.isBlank();
    }

    private AssetRequestEntity getAssetRequest(
            UUID requestId
    ) {
        return requestRepository.findById(requestId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Asset request was not found: "
                                        + requestId
                        )
                );
    }

    private void requireRequestStatus(
            AssetRequestEntity request,
            AssetRequestStatus expected
    ) {
        if (request.getStatus() != expected) {
            throw new IllegalArgumentException(
                    "Asset request is currently "
                            + request.getStatus()
                            + " and cannot perform this procurement action."
            );
        }
    }

    private void changeRequestStatus(
            AssetRequestEntity request,
            AssetRequestStatus newStatus,
            String actorUsername,
            String action
    ) {
        AssetRequestStatus oldStatus =
                request.getStatus();

        request.setStatus(newStatus);

        requestRepository.save(request);

        historyRepository.save(
                new AssetRequestHistoryEntity(
                        request.getId(),
                        action,
                        oldStatus,
                        newStatus,
                        actorUsername,
                        null
                )
        );
    }

    // =========================================================
    // RESPONSE MAPPING
    // =========================================================

    private ProcurementResponse toResponse(
            AssetRequestProcurementEntity procurement
    ) {
        return new ProcurementResponse(
                procurement.getId(),
                procurement.getRequestId(),

                // Procurement details
                procurement.getVendorName(),
                procurement.getVendorContact(),
                procurement.getQuotationNumber(),
                procurement.getQuotationAmount(),
                procurement.getCurrency(),
                procurement.getPurchaseOrderNumber(),
                procurement.getExpectedDeliveryDate(),

                // Finance details
                procurement.getBudgetAmount(),
                procurement.getApprovedBudget(),
                procurement.getFinanceDecision(),
                procurement.getFinanceComment(),
                procurement.getFinanceUsername(),
                procurement.getFinanceApprovedAt(),

                // Procurement status
                procurement.getStatus(),
                procurement.getRemarks(),

                // Record information
                procurement.getCreatedBy(),
                procurement.getCreatedAt(),
                procurement.getUpdatedAt()
        );
    }
}