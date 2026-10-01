package com.enfec.asset.request.controller;

import com.enfec.asset.request.dto.*;
import com.enfec.asset.request.service.AssetRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/asset-requests")
public class AssetRequestController {

    private final AssetRequestService service;

    public AssetRequestController(AssetRequestService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AssetRequestResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateAssetRequestRequest request) {

        return ResponseEntity.status(201).body(
                service.create(
                        authentication.getName(),
                        getRole(authentication),
                        request
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<AssetRequestResponse>> list(
            Authentication authentication) {

        return ResponseEntity.ok(
                service.list(
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    @GetMapping("/dashboard")
    public ResponseEntity<RequestDashboardResponse> dashboard(
            Authentication authentication) {

        return ResponseEntity.ok(
                service.dashboard(
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetRequestResponse> get(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                service.get(
                        id,
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<AssetRequestResponse> approve(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) RequestAction action) {

        return ResponseEntity.ok(
                service.approve(
                        id,
                        authentication.getName(),
                        getRole(authentication),
                        action
                )
        );
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<AssetRequestResponse> reject(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) RequestAction action) {

        return ResponseEntity.ok(
                service.reject(
                        id,
                        authentication.getName(),
                        getRole(authentication),
                        action
                )
        );
    }

    @PostMapping("/{id}/finance/approve")
    public ResponseEntity<AssetRequestResponse> financeApprove(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) RequestAction action) {

        return ResponseEntity.ok(
                service.financeApprove(
                        id,
                        authentication.getName(),
                        getRole(authentication),
                        action
                )
        );
    }

    @PostMapping("/{id}/finance/reject")
    public ResponseEntity<AssetRequestResponse> financeReject(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) RequestAction action) {

        return ResponseEntity.ok(
                service.financeReject(
                        id,
                        authentication.getName(),
                        getRole(authentication),
                        action
                )
        );
    }

    /*
     * ============================================================
     * FINAL HIGHER AUTHORITY APPROVAL
     * ============================================================
     *
     * This is the approval that happens AFTER Procurement creates
     * the Purchase Order and Finance approves the budget.
     *
     * Flow:
     *
     * PURCHASE_ORDER_CREATED
     *          ↓
     * FINANCE_PENDING
     *          ↓
     * FINANCE APPROVED
     *          ↓
     * HIGHER_AUTHORITY_PENDING
     *          ↓
     * FINAL HIGHER AUTHORITY APPROVAL
     *          ↓
     * HIGHER_AUTHORITY_APPROVED
     */

    @PostMapping("/{id}/higher-authority/final-approve")
    public ResponseEntity<AssetRequestResponse> higherAuthorityFinalApprove(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) RequestAction action) {

        return ResponseEntity.ok(
                service.higherAuthorityFinalApprove(
                        id,
                        authentication.getName(),
                        getRole(authentication),
                        action
                )
        );
    }

    @PostMapping("/{id}/higher-authority/final-reject")
    public ResponseEntity<AssetRequestResponse> higherAuthorityFinalReject(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) RequestAction action) {

        return ResponseEntity.ok(
                service.higherAuthorityFinalReject(
                        id,
                        authentication.getName(),
                        getRole(authentication),
                        action
                )
        );
    }

    @PostMapping("/{id}/fulfill")
    public ResponseEntity<AssetRequestResponse> fulfill(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) FulfillRequest request) {

        return ResponseEntity.ok(
                service.fulfill(
                        id,
                        authentication.getName(),
                        getRole(authentication),
                        request
                )
        );
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<AssetRequestResponse> close(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody(required = false) CloseRequest request) {

        return ResponseEntity.ok(
                service.close(
                        id,
                        authentication.getName(),
                        getRole(authentication),
                        request
                )
        );
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<AssetRequestHistoryResponse>> history(
            @PathVariable UUID id,
            Authentication authentication) {

        return ResponseEntity.ok(
                service.history(
                        id,
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    private String getRole(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user does not have a role."
                        )
                );
    }
}