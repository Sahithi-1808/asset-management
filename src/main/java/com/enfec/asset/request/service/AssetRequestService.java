package com.enfec.asset.request.service;

import com.enfec.asset.request.dto.*;

import java.util.List;
import java.util.UUID;

public interface AssetRequestService {

    AssetRequestResponse create(
            String actorUsername,
            String actorRole,
            CreateAssetRequestRequest request
    );

    List<AssetRequestResponse> list(
            String actorUsername,
            String actorRole
    );

    AssetRequestResponse get(
            UUID id,
            String actorUsername,
            String actorRole
    );

    /*
     * Existing initial Higher Authority approval.
     *
     * This remains unchanged.
     */
    AssetRequestResponse approve(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    );

    /*
     * Existing initial Higher Authority rejection.
     *
     * This remains unchanged.
     */
    AssetRequestResponse reject(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    );

    /*
     * Existing initial Finance approval.
     *
     * This remains unchanged.
     */
    AssetRequestResponse financeApprove(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    );

    /*
     * Existing initial Finance rejection.
     *
     * This remains unchanged.
     */
    AssetRequestResponse financeReject(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    );

    /*
     * NEW:
     * Final Higher Authority approval after
     * the second Finance review.
     */
    AssetRequestResponse higherAuthorityFinalApprove(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    );

    /*
     * NEW:
     * Final Higher Authority rejection after
     * the second Finance review.
     */
    AssetRequestResponse higherAuthorityFinalReject(
            UUID id,
            String actorUsername,
            String actorRole,
            RequestAction action
    );

    AssetRequestResponse fulfill(
            UUID id,
            String actorUsername,
            String actorRole,
            FulfillRequest request
    );

    AssetRequestResponse close(
            UUID id,
            String actorUsername,
            String actorRole,
            CloseRequest request
    );

    List<AssetRequestHistoryResponse> history(
            UUID id,
            String actorUsername,
            String actorRole
    );

    RequestDashboardResponse dashboard(
            String actorUsername,
            String actorRole
    );
}