package com.enfec.asset.request.service;

import com.enfec.asset.employee.EmployeeAccountEntity;
import com.enfec.asset.employee.repository.EmployeeAccountRepository;
import com.enfec.asset.entity.AssetEntity;
import com.enfec.asset.enums.AssetStatus;
import com.enfec.asset.repository.AssetRepository;
import com.enfec.asset.request.dto.*;
import com.enfec.asset.request.entity.AssetRequestEntity;
import com.enfec.asset.request.entity.AssetRequestHistoryEntity;
import com.enfec.asset.request.enums.AssetRequestStatus;
import com.enfec.asset.request.repository.AssetRequestHistoryRepository;
import com.enfec.asset.request.repository.AssetRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.enfec.asset.request.procurement.entity.AssetRequestProcurementEntity;
import com.enfec.asset.request.procurement.repository.AssetRequestProcurementRepository;

import java.time.Instant;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetRequestServiceImpl implements AssetRequestService {

    private final AssetRequestRepository requestRepository;
    private final AssetRequestHistoryRepository historyRepository;
    private final AssetRepository assetRepository;
    private final EmployeeAccountRepository employeeRepository;
    private final AssetRequestProcurementRepository procurementRepository;

    public AssetRequestServiceImpl(
            AssetRequestRepository requestRepository,
            AssetRequestHistoryRepository historyRepository,
            AssetRepository assetRepository,
            EmployeeAccountRepository employeeRepository,
            AssetRequestProcurementRepository procurementRepository
    ) {
        this.requestRepository = requestRepository;
        this.historyRepository = historyRepository;
        this.assetRepository = assetRepository;
        this.employeeRepository = employeeRepository;
        this.procurementRepository = procurementRepository;
    }

    @Override
    public AssetRequestResponse create(
            String actorUsername,
            String actorRole,
            CreateAssetRequest input
    ) {
        requireActor(actorUsername, actorRole);

        AssetEntity asset = assetRepository.findById(input.assetId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Selected asset was not found."
                        )
                );

        String employeeUsername =
                input.employeeUsername() == null
                        || input.employeeUsername().isBlank()
                        ? actorUsername
                        : input.employeeUsername().trim();

        if ("MANAGER".equalsIgnoreCase(actorRole)) {
            boolean teamMember =
                    employeeRepository
                            .findByManagerUsernameIgnoreCase(actorUsername)
                            .stream()
                            .anyMatch(e ->
                                    e.getUsername()
                                            .equalsIgnoreCase(employeeUsername)
                            );

            if (!teamMember) {
                throw new IllegalArgumentException(
                        "Managers can create requests only for employees in their team."
                );
            }
        }

        EmployeeAccountEntity approver =
                employeeRepository
                        .findByUsername(
                                input.approverUsername().trim()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Selected higher authority approver was not found."
                                )
                        );

        if (!("HR".equalsIgnoreCase(approver.getRole())
                || "MANAGER".equalsIgnoreCase(approver.getRole())
                || "HIGHER_AUTHORITY".equalsIgnoreCase(approver.getRole()))) {

            throw new IllegalArgumentException(
                    "Selected approver is not a valid higher authority."
            );
        }

        if (input.requiredFrom() != null
                && input.requiredTo() != null
                && input.requiredTo().isBefore(input.requiredFrom())) {

            throw new IllegalArgumentException(
                    "Required-to date cannot be before required-from date."
            );
        }

        String requestNumber = String.format(
                "AR-%d-%04d",
                Year.now().getValue(),
                requestRepository.count() + 1
        );

        AssetRequestEntity request =
                new AssetRequestEntity(
                        requestNumber,
                        actorUsername,
                        employeeUsername,
                        asset.getId(),
                        input.quantity(),
                        input.priority().trim().toUpperCase(),
                        input.businessJustification().trim(),
                        input.requiredFrom(),
                        input.requiredTo(),
                        input.location() == null
                                ? null
                                : input.location().trim(),
                        input.approverUsername().trim(),
                        input.requiresFinanceApproval()
                );

        AssetRequestEntity saved =
                requestRepository.save(request);

        addHistory(
                saved,
                "REQUEST_CREATED",
                null,
                saved.getStatus(),
                actorUsername,
                null
        );

        return toResponse(saved, asset);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetRequestResponse> list(
            String actorUsername,
            String actorRole
    ) {
        return visibleRequests(actorUsername, actorRole)
                .stream()
                .map(r ->
                        toResponse(
                                r,
                                assetRepository
                                        .findById(r.getAssetId())
                                        .orElse(null)
                        )
                )
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AssetRequestResponse get(
            UUID id,
            String actorUsername,
            String actorRole
    ) {
        AssetRequestEntity request = getEntity(id);

        assertVisible(
                request,
                actorUsername,
                actorRole
        );

        return toResponse(
                request,
                assetRepository
                        .findById(request.getAssetId())
                        .orElse(null)
        );
    }

    /*
     * =========================================================
     * EXISTING INITIAL HIGHER AUTHORITY APPROVAL
     * =========================================================
     *
     * This is the original approval stage.
     *
     * PENDING_APPROVAL
     *        ↓
     * FINANCE_PENDING / PROCUREMENT_PENDING
     *
     * Kept unchanged.
     */
    @Override
    public AssetRequestResponse approve(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    ) {
        AssetRequestEntity request = getEntity(id);

        if (!isAdmin(actorRole)
                && (request.getApproverUsername() == null
                || actorUsername == null
                || !request.getApproverUsername()
                .equalsIgnoreCase(actorUsername))) {

            throw new IllegalArgumentException(
                    "Only the selected higher authority approver can approve this request."
            );
        }

        requireStatus(
                request,
                AssetRequestStatus.PENDING_APPROVAL
        );

        /*
         * Existing Finance approval is only for the
         * original pre-Procurement Finance stage.
         *
         * If a Purchase Order already exists, this request
         * belongs to the NEW post-PO Finance approval stage.
         */
        if (purchaseOrderCreated(request.getId())) {
            throw new IllegalArgumentException(
                    "This request has a Purchase Order and requires the post-PO Finance budget approval."
            );
        }

        AssetRequestStatus next =
                request.isRequiresFinanceApproval()
                        ? AssetRequestStatus.FINANCE_PENDING
                        : AssetRequestStatus.PROCUREMENT_PENDING;

        AssetRequestStatus old =
                request.getStatus();

        request.setApprovalComment(
                comment(action)
        );

        request.setApprovedAt(
                Instant.now()
        );

        request.setStatus(next);

        requestRepository.save(request);

        addHistory(
                request,
                "HIGHER_AUTHORITY_APPROVED",
                old,
                next,
                actorUsername,
                comment(action)
        );

        return toResponse(
                request,
                assetRepository
                        .findById(request.getAssetId())
                        .orElse(null)
        );
    }

    /*
     * =========================================================
     * EXISTING INITIAL HIGHER AUTHORITY REJECTION
     * =========================================================
     */
    @Override
    public AssetRequestResponse reject(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    ) {
        AssetRequestEntity request = getEntity(id);

        if (!isAdmin(actorRole)
                && (request.getApproverUsername() == null
                || actorUsername == null
                || !request.getApproverUsername()
                .equalsIgnoreCase(actorUsername))) {

            throw new IllegalArgumentException(
                    "Only the selected higher authority approver can reject this request."
            );
        }

        requireStatus(
                request,
                AssetRequestStatus.PENDING_APPROVAL
        );

        return moveToRejected(
                request,
                actorUsername,
                "HIGHER_AUTHORITY_REJECTED",
                comment(action)
        );
    }

    /*
     * =========================================================
     * EXISTING INITIAL FINANCE APPROVAL
     * =========================================================
     *
     * This remains unchanged.
     */
    @Override
    public AssetRequestResponse financeApprove(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    ) {
        requireRole(
                actorRole,
                "FINANCE",
                "SYSTEM_ADMIN"
        );

        AssetRequestEntity request =
                getEntity(id);

        requireStatus(
                request,
                AssetRequestStatus.FINANCE_PENDING
        );

        /*
         * Existing Finance rejection is only for the
         * original pre-Procurement Finance stage.
         */
        if (purchaseOrderCreated(request.getId())) {
            throw new IllegalArgumentException(
                    "This request has a Purchase Order and requires the post-PO Finance budget rejection."
            );
        }

        AssetRequestStatus old =
                request.getStatus();

        request.setFinanceUsername(
                actorUsername
        );

        request.setFinanceComment(
                comment(action)
        );

        request.setFinanceApprovedAt(
                Instant.now()
        );

        request.setStatus(
                AssetRequestStatus.PROCUREMENT_PENDING
        );

        requestRepository.save(request);

        addHistory(
                request,
                "FINANCE_APPROVED",
                old,
                request.getStatus(),
                actorUsername,
                comment(action)
        );

        return toResponse(
                request,
                assetRepository
                        .findById(request.getAssetId())
                        .orElse(null)
        );
    }

    /*
     * =========================================================
     * EXISTING INITIAL FINANCE REJECTION
     * =========================================================
     */
    @Override
    public AssetRequestResponse financeReject(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    ) {
        requireRole(
                actorRole,
                "FINANCE",
                "SYSTEM_ADMIN"
        );

        AssetRequestEntity request =
                getEntity(id);

        requireStatus(
                request,
                AssetRequestStatus.FINANCE_PENDING
        );

        request.setFinanceUsername(
                actorUsername
        );

        request.setFinanceComment(
                comment(action)
        );

        return moveToRejected(
                request,
                actorUsername,
                "FINANCE_REJECTED",
                comment(action)
        );
    }

    /*
     * =========================================================
     * NEW FINAL HIGHER AUTHORITY APPROVAL
     * =========================================================
     *
     * This is the SECOND Higher Authority stage.
     *
     * HIGHER_AUTHORITY_PENDING
     *            ↓
     * HIGHER_AUTHORITY_APPROVED
     *
     * This happens AFTER:
     *
     * Purchase Order Created
     *            ↓
     * Finance second approval
     */
    @Override
    public AssetRequestResponse higherAuthorityFinalApprove(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    ) {
        AssetRequestEntity request =
                getEntity(id);

        /*
         * Only the selected Higher Authority can perform
         * the final approval.
         */
        if (!isAdmin(actorRole)
                && (request.getApproverUsername() == null
                || actorUsername == null
                || !request.getApproverUsername()
                .equalsIgnoreCase(actorUsername))) {

            throw new IllegalArgumentException(
                    "Only the selected higher authority approver can give the final approval."
            );
        }

        requireStatus(
                request,
                AssetRequestStatus.HIGHER_AUTHORITY_PENDING
        );

        AssetRequestStatus old =
                request.getStatus();

        request.setStatus(
                AssetRequestStatus.HIGHER_AUTHORITY_APPROVED
        );

        requestRepository.save(request);

        addHistory(
                request,
                "HIGHER_AUTHORITY_FINAL_APPROVED",
                old,
                request.getStatus(),
                actorUsername,
                comment(action)
        );

        return toResponse(
                request,
                assetRepository
                        .findById(request.getAssetId())
                        .orElse(null)
        );
    }

    /*
     * =========================================================
     * NEW FINAL HIGHER AUTHORITY REJECTION
     * =========================================================
     *
     * HIGHER_AUTHORITY_PENDING
     *            ↓
     * HIGHER_AUTHORITY_REJECTED
     */
    @Override
    public AssetRequestResponse higherAuthorityFinalReject(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    ) {
        AssetRequestEntity request =
                getEntity(id);

        /*
         * Only the selected Higher Authority can perform
         * the final rejection.
         */
        if (!isAdmin(actorRole)
                && (request.getApproverUsername() == null
                || actorUsername == null
                || !request.getApproverUsername()
                .equalsIgnoreCase(actorUsername))) {

            throw new IllegalArgumentException(
                    "Only the selected higher authority approver can give the final rejection."
            );
        }

        requireStatus(
                request,
                AssetRequestStatus.HIGHER_AUTHORITY_PENDING
        );

        AssetRequestStatus old =
                request.getStatus();

        request.setStatus(
                AssetRequestStatus.HIGHER_AUTHORITY_REJECTED
        );

        requestRepository.save(request);

        addHistory(
                request,
                "HIGHER_AUTHORITY_FINAL_REJECTED",
                old,
                request.getStatus(),
                actorUsername,
                comment(action)
        );

        return toResponse(
                request,
                assetRepository
                        .findById(request.getAssetId())
                        .orElse(null)
        );
    }

    /*
     * =========================================================
     * FULFILL
     * =========================================================
     */
    @Override
    public AssetRequestResponse fulfill(
            UUID id,
            String actorUsername,
            String actorRole,
            FulfillRequest input
    ) {
        requireRole(
                actorRole,
                "HR",
                "SYSTEM_ADMIN",
                "FINANCE",
                "MANAGER"
        );

        AssetRequestEntity request =
                getEntity(id);

        requireStatus(
                request,
                AssetRequestStatus.FULFILLMENT_PENDING,
                AssetRequestStatus.ASSIGNED
        );

        UUID selectedAssetId =
                input != null && input.assetId() != null
                        ? input.assetId()
                        : request.getAssetId();

        AssetEntity asset =
                assetRepository.findById(selectedAssetId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Selected asset was not found."
                                )
                        );

        if (asset.getStatus() != AssetStatus.IN_STOCK
                && request.getStatus()
                != AssetRequestStatus.ASSIGNED) {

            throw new IllegalArgumentException(
                    "The selected asset is not currently available for fulfillment."
            );
        }

        String assignedUsername =
                input != null
                        && input.assignedUsername() != null
                        && !input.assignedUsername().isBlank()
                        ? input.assignedUsername().trim()
                        : request.getEmployeeUsername();

        if (request.getQuantity() > 1) {
            throw new IllegalArgumentException(
                    "Fulfillment currently supports one inventory asset per request. Create separate requests for additional assets."
            );
        }

        AssetRequestStatus old =
                request.getStatus();

        asset.setStatus(
                AssetStatus.ASSIGNED
        );

        asset.setAssignedTo(
                assignedUsername
        );

        assetRepository.save(asset);

        request.setAssignedUsername(
                assignedUsername
        );

        request.setStatus(
                AssetRequestStatus.ASSIGNED
        );

        requestRepository.save(request);

        addHistory(
                request,
                "ASSET_ASSIGNED",
                old,
                request.getStatus(),
                actorUsername,
                null
        );

        request.setStatus(
                AssetRequestStatus.FULFILLED
        );

        request.setFulfilledAt(
                Instant.now()
        );

        requestRepository.save(request);

        addHistory(
                request,
                "REQUEST_FULFILLED",
                AssetRequestStatus.ASSIGNED,
                request.getStatus(),
                actorUsername,
                null
        );

        return toResponse(
                request,
                asset
        );
    }

    /*
     * =========================================================
     * CLOSE
     * =========================================================
     */
    @Override
    public AssetRequestResponse close(
            UUID id,
            String actorUsername,
            String actorRole,
            CloseRequest input
    ) {
        requireRole(
                actorRole,
                "HR",
                "SYSTEM_ADMIN",
                "MANAGER"
        );

        AssetRequestEntity request =
                getEntity(id);

        requireStatus(
                request,
                AssetRequestStatus.FULFILLED
        );

        AssetRequestStatus old =
                request.getStatus();

        request.setStatus(
                AssetRequestStatus.CLOSED
        );

        request.setClosedBy(
                actorUsername
        );

        request.setClosedAt(
                Instant.now()
        );

        request.setClosureNote(
                input == null
                        ? null
                        : input.closureNote()
        );

        requestRepository.save(request);

        addHistory(
                request,
                "REQUEST_CLOSED",
                old,
                request.getStatus(),
                actorUsername,
                request.getClosureNote()
        );

        return toResponse(
                request,
                assetRepository
                        .findById(request.getAssetId())
                        .orElse(null)
        );
    }

    /*
     * =========================================================
     * HISTORY
     * =========================================================
     */
    @Override
    @Transactional(readOnly = true)
    public List<AssetRequestHistoryResponse> history(
            UUID id,
            String actorUsername,
            String actorRole
    ) {
        AssetRequestEntity request =
                getEntity(id);

        assertVisible(
                request,
                actorUsername,
                actorRole
        );

        return historyRepository
                .findByRequestIdOrderByCreatedAtAsc(id)
                .stream()
                .map(h ->
                        new AssetRequestHistoryResponse(
                                h.getId(),
                                h.getAction(),
                                h.getFromStatus(),
                                h.getToStatus(),
                                h.getActorUsername(),
                                h.getComment(),
                                h.getCreatedAt()
                        )
                )
                .toList();
    }

    /*
     * =========================================================
     * DASHBOARD
     * =========================================================
     */
    @Override
    @Transactional(readOnly = true)
    public RequestDashboardResponse dashboard(
            String actorUsername,
            String actorRole
    ) {
        List<AssetRequestEntity> requests =
                visibleRequests(
                        actorUsername,
                        actorRole
                );

        Map<String, Long> counts =
                new LinkedHashMap<>();

        for (AssetRequestStatus status :
                AssetRequestStatus.values()) {

            counts.put(
                    status.name(),
                    requests.stream()
                            .filter(r ->
                                    r.getStatus() == status
                            )
                            .count()
            );
        }

        return new RequestDashboardResponse(
                actorRole,
                counts,
                requests.stream()
                        .map(r ->
                                toResponse(
                                        r,
                                        assetRepository
                                                .findById(
                                                        r.getAssetId()
                                                )
                                                .orElse(null)
                                )
                        )
                        .limit(20)
                        .toList()
        );
    }

    /*
     * =========================================================
     * VISIBILITY
     * =========================================================
     */
    private List<AssetRequestEntity> visibleRequests(
            String username,
            String role
    ) {
        if (isAdmin(role)
                || "HR".equalsIgnoreCase(role)) {

            return requestRepository
                    .findAllByOrderByCreatedAtDesc();
        }

        /*
         * Finance sees the current Finance-pending stage.
         *
         * This works for both:
         * 1. Existing initial Finance approval
         * 2. New Finance approval after PO creation
         */
        if ("FINANCE".equalsIgnoreCase(role)) {

            return requestRepository
                    .findByStatusOrderByCreatedAtDesc(
                            AssetRequestStatus.FINANCE_PENDING
                    );
        }

        /*
         * Procurement can continue to see all procurement
         * related stages, including the new approval stages
         * between PO creation and order placement.
         */
        if ("PROCUREMENT".equalsIgnoreCase(role)) {

            return Arrays.stream(
                            AssetRequestStatus.values()
                    )
                    .filter(this::isProcurementStatus)
                    .flatMap(status ->
                            requestRepository
                                    .findByStatusOrderByCreatedAtDesc(
                                            status
                                    )
                                    .stream()
                    )
                    .sorted(
                            Comparator.comparing(
                                    AssetRequestEntity::getCreatedAt,
                                    Comparator.nullsLast(
                                            Comparator.reverseOrder()
                                    )
                            )
                    )
                    .toList();
        }

        /*
         * Higher Authority sees requests assigned to them.
         *
         * This includes both:
         * PENDING_APPROVAL
         * and
         * HIGHER_AUTHORITY_PENDING
         */
        if ("HIGHER_AUTHORITY".equalsIgnoreCase(role)) {

            return requestRepository
                    .findByApproverUsernameIgnoreCaseOrderByCreatedAtDesc(
                            username
                    );
        }

        if ("MANAGER".equalsIgnoreCase(role)) {

            List<EmployeeAccountEntity> employees =
                    employeeRepository
                            .findByManagerUsernameIgnoreCase(
                                    username
                            );

            List<String> usernames =
                    employees.stream()
                            .map(EmployeeAccountEntity::getUsername)
                            .toList();

            if (usernames.isEmpty()) {
                return List.of();
            }

            return requestRepository
                    .findByEmployeeUsernameInOrderByCreatedAtDesc(
                            usernames
                    );
        }

        return requestRepository
                .findByEmployeeUsernameIgnoreCaseOrderByCreatedAtDesc(
                        username
                );
    }

    /*
     * =========================================================
     * VISIBILITY CHECK
     * =========================================================
     */
    private void assertVisible(
            AssetRequestEntity request,
            String username,
            String role
    ) {
        if (isAdmin(role)
                || "HR".equalsIgnoreCase(role)
                || "FINANCE".equalsIgnoreCase(role)) {
            return;
        }

        if ("PROCUREMENT".equalsIgnoreCase(role)
                && isProcurementStatus(request.getStatus())) {
            return;
        }

        if ("HIGHER_AUTHORITY".equalsIgnoreCase(role)
                && request.getApproverUsername() != null
                && request.getApproverUsername()
                .equalsIgnoreCase(username)) {
            return;
        }

        if (request.getEmployeeUsername() != null
                && request.getEmployeeUsername()
                .equalsIgnoreCase(username)) {
            return;
        }

        if (request.getRequesterUsername() != null
                && request.getRequesterUsername()
                .equalsIgnoreCase(username)) {
            return;
        }

        if ("MANAGER".equalsIgnoreCase(role)) {

            boolean teamMember =
                    employeeRepository
                            .findByManagerUsernameIgnoreCase(
                                    username
                            )
                            .stream()
                            .anyMatch(e ->
                                    e.getUsername()
                                            .equalsIgnoreCase(
                                                    request.getEmployeeUsername()
                                            )
                            );

            if (teamMember) {
                return;
            }
        }

        throw new IllegalArgumentException(
                "You are not authorized to view this request."
        );
    }

    /*
     * =========================================================
     * RESPONSE
     * =========================================================
     */
    private AssetRequestResponse toResponse(
            AssetRequestEntity r,
            AssetEntity asset
    ) {
        return new AssetRequestResponse(
                r.getId(),
                r.getRequestNumber(),
                r.getRequesterUsername(),
                r.getEmployeeUsername(),
                r.getAssetId(),
                asset == null
                        ? null
                        : asset.getName(),
                asset == null
                        ? null
                        : asset.getAssetTag(),
                r.getQuantity(),
                r.getPriority(),
                r.getBusinessJustification(),
                r.getRequiredFrom(),
                r.getRequiredTo(),
                r.getLocation(),
                r.getStatus(),
                r.getApproverUsername(),
                r.getApprovalComment(),
                r.getApprovedAt(),
                r.isRequiresFinanceApproval(),
                r.getFinanceUsername(),
                r.getFinanceComment(),
                r.getFinanceApprovedAt(),
                purchaseOrderCreated(r.getId()),
                r.getAssignedUsername(),
                r.getFulfilledAt(),
                r.getClosedBy(),
                r.getClosedAt(),
                r.getClosureNote(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */
    private AssetRequestEntity getEntity(UUID id) {
        return requestRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Asset request was not found: " + id
                        )
                );
    }

    private void requireStatus(
            AssetRequestEntity request,
            AssetRequestStatus... allowed
    ) {
        if (Arrays.stream(allowed)
                .noneMatch(
                        status ->
                                status == request.getStatus()
                )) {

            throw new IllegalArgumentException(
                    "Request is currently "
                            + request.getStatus()
                            + " and cannot perform this action."
            );
        }
    }

    private AssetRequestResponse moveToRejected(
            AssetRequestEntity request,
            String actor,
            String action,
            String comment
    ) {
        AssetRequestStatus old =
                request.getStatus();

        request.setStatus(
                AssetRequestStatus.REJECTED
        );

        requestRepository.save(request);

        addHistory(
                request,
                action,
                old,
                request.getStatus(),
                actor,
                comment
        );

        return toResponse(
                request,
                assetRepository
                        .findById(request.getAssetId())
                        .orElse(null)
        );
    }

    private void addHistory(
            AssetRequestEntity request,
            String action,
            AssetRequestStatus from,
            AssetRequestStatus to,
            String actor,
            String comment
    ) {
        historyRepository.save(
                new AssetRequestHistoryEntity(
                        request.getId(),
                        action,
                        from,
                        to,
                        actor,
                        comment
                )
        );
    }

    private String comment(RequestAction action) {
        return action == null
                || action.comment() == null
                ? null
                : action.comment().trim();
    }

    private boolean isAdmin(String role) {
        return "SYSTEM_ADMIN".equalsIgnoreCase(role);
    }

    private boolean purchaseOrderCreated(UUID requestId) {
        return procurementRepository
                .findByRequestId(requestId)
                .map(procurement ->
                        procurement.getPurchaseOrderNumber() != null
                                && !procurement.getPurchaseOrderNumber().isBlank()
                )
                .orElse(false);
    }

    /*
     * Procurement visibility now includes the approval stages
     * between Purchase Order creation and placing the order.
     */
    private boolean isProcurementStatus(
            AssetRequestStatus status
    ) {
        return status == AssetRequestStatus.PROCUREMENT_PENDING
                || status == AssetRequestStatus.PROCUREMENT_IN_PROGRESS
                || status == AssetRequestStatus.PURCHASE_ORDER_CREATED

                // NEW POST-PO APPROVAL STAGES
                || status == AssetRequestStatus.FINANCE_PENDING
                || status == AssetRequestStatus.FINANCE_APPROVED
                || status == AssetRequestStatus.FINANCE_REJECTED
                || status == AssetRequestStatus.HIGHER_AUTHORITY_PENDING
                || status == AssetRequestStatus.HIGHER_AUTHORITY_APPROVED
                || status == AssetRequestStatus.HIGHER_AUTHORITY_REJECTED

                || status == AssetRequestStatus.ORDERED
                || status == AssetRequestStatus.RECEIVED
                || status == AssetRequestStatus.FULFILLMENT_PENDING;
    }

    private void requireRole(
            String role,
            String... allowed
    ) {
        if (role == null
                || Arrays.stream(allowed)
                .noneMatch(
                        r -> r.equalsIgnoreCase(role)
                )) {

            throw new IllegalArgumentException(
                    "You are not authorized to perform this request action."
            );
        }
    }

    private void requireActor(
            String username,
            String role
    ) {
        if (username == null
                || username.isBlank()
                || role == null
                || role.isBlank()) {

            throw new IllegalArgumentException(
                    "User identity is required."
            );
        }
    }
}