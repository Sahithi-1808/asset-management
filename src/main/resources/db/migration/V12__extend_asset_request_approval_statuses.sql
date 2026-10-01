ALTER TABLE asset_request
DROP CONSTRAINT ck_asset_request_status;

ALTER TABLE asset_request
    ADD CONSTRAINT ck_asset_request_status CHECK (
        status IN (
                   'PENDING_APPROVAL',
                   'APPROVED',
                   'REJECTED',
                   'FINANCE_PENDING',
                   'FINANCE_APPROVED',
                   'FINANCE_REJECTED',
                   'PROCUREMENT_PENDING',
                   'PROCUREMENT_IN_PROGRESS',
                   'PURCHASE_ORDER_CREATED',
                   'HIGHER_AUTHORITY_PENDING',
                   'HIGHER_AUTHORITY_APPROVED',
                   'HIGHER_AUTHORITY_REJECTED',
                   'ORDERED',
                   'RECEIVING_PENDING',
                   'RECEIVED',
                   'FULFILLMENT_PENDING',
                   'ASSIGNED',
                   'FULFILLED',
                   'CLOSED'
            )
        );