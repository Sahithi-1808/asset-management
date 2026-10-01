package com.enfec.asset.request.procurement.service;

import com.enfec.asset.request.procurement.dto.ProcurementRequest;
import com.enfec.asset.request.procurement.dto.ProcurementResponse;

import java.util.UUID;

public interface ProcurementService {

    ProcurementResponse create(
            UUID requestId,
            String actorUsername,
            String actorRole,
            ProcurementRequest request
    );

    ProcurementResponse get(
            UUID requestId,
            String actorUsername,
            String actorRole
    );

    ProcurementResponse update(
            UUID requestId,
            String actorUsername,
            String actorRole,
            ProcurementRequest request
    );

    ProcurementResponse start(
            UUID requestId,
            String actorUsername,
            String actorRole
    );

    ProcurementResponse createPurchaseOrder(
            UUID requestId,
            String actorUsername,
            String actorRole
    );

    // Finance approval after Purchase Order creation
    ProcurementResponse financeApprove(
            UUID requestId,
            String actorUsername,
            String actorRole,
            ProcurementRequest request
    );

    // Finance rejection after Purchase Order creation
    ProcurementResponse financeReject(
            UUID requestId,
            String actorUsername,
            String actorRole,
            ProcurementRequest request
    );

    ProcurementResponse order(
            UUID requestId,
            String actorUsername,
            String actorRole
    );

    ProcurementResponse receive(
            UUID requestId,
            String actorUsername,
            String actorRole
    );
}