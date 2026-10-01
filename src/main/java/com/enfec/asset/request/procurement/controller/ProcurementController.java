package com.enfec.asset.request.procurement.controller;

import com.enfec.asset.request.procurement.dto.ProcurementRequest;
import com.enfec.asset.request.procurement.dto.ProcurementResponse;
import com.enfec.asset.request.procurement.service.ProcurementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/asset-requests")
public class ProcurementController {

    private final ProcurementService procurementService;

    public ProcurementController(
            ProcurementService procurementService
    ) {
        this.procurementService = procurementService;
    }

    @PostMapping("/{requestId}/procurement")
    public ResponseEntity<ProcurementResponse> create(
            @PathVariable UUID requestId,
            Authentication authentication,
            @RequestBody ProcurementRequest request
    ) {
        return ResponseEntity.status(201).body(
                procurementService.create(
                        requestId,
                        authentication.getName(),
                        getRole(authentication),
                        request
                )
        );
    }

    @GetMapping("/{requestId}/procurement")
    public ResponseEntity<ProcurementResponse> get(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                procurementService.get(
                        requestId,
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    @PutMapping("/{requestId}/procurement")
    public ResponseEntity<ProcurementResponse> update(
            @PathVariable UUID requestId,
            Authentication authentication,
            @RequestBody ProcurementRequest request
    ) {
        return ResponseEntity.ok(
                procurementService.update(
                        requestId,
                        authentication.getName(),
                        getRole(authentication),
                        request
                )
        );
    }

    @PostMapping("/{requestId}/procurement/start")
    public ResponseEntity<ProcurementResponse> start(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                procurementService.start(
                        requestId,
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    @PostMapping("/{requestId}/procurement/purchase-order")
    public ResponseEntity<ProcurementResponse> createPurchaseOrder(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                procurementService.createPurchaseOrder(
                        requestId,
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    // ---------------------------------------------------------
    // Finance approval after Purchase Order creation
    // ---------------------------------------------------------

    @PostMapping("/{requestId}/procurement/finance/approve")
    public ResponseEntity<ProcurementResponse> financeApprove(
            @PathVariable UUID requestId,
            Authentication authentication,
            @RequestBody ProcurementRequest request
    ) {
        return ResponseEntity.ok(
                procurementService.financeApprove(
                        requestId,
                        authentication.getName(),
                        getRole(authentication),
                        request
                )
        );
    }

    @PostMapping("/{requestId}/procurement/finance/reject")
    public ResponseEntity<ProcurementResponse> financeReject(
            @PathVariable UUID requestId,
            Authentication authentication,
            @RequestBody ProcurementRequest request
    ) {
        return ResponseEntity.ok(
                procurementService.financeReject(
                        requestId,
                        authentication.getName(),
                        getRole(authentication),
                        request
                )
        );
    }

    // ---------------------------------------------------------
    // Existing Procurement actions
    // ---------------------------------------------------------

    @PostMapping("/{requestId}/procurement/order")
    public ResponseEntity<ProcurementResponse> order(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                procurementService.order(
                        requestId,
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    @PostMapping("/{requestId}/procurement/receive")
    public ResponseEntity<ProcurementResponse> receive(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                procurementService.receive(
                        requestId,
                        authentication.getName(),
                        getRole(authentication)
                )
        );
    }

    private String getRole(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(authority ->
                        authority.getAuthority()
                                .replaceFirst("^ROLE_", "")
                )
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user does not have a role."
                        )
                );
    }
}