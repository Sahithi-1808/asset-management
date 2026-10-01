CREATE TABLE asset_request_procurement (
                                           id UUID PRIMARY KEY,

                                           request_id UUID NOT NULL UNIQUE
                                               REFERENCES asset_request(id) ON DELETE CASCADE,

                                           vendor_name VARCHAR(200),
                                           vendor_contact VARCHAR(200),

                                           quotation_number VARCHAR(100),
                                           quotation_amount NUMERIC(15,2),
                                           currency VARCHAR(10),

                                           purchase_order_number VARCHAR(100),

                                           expected_delivery_date DATE,

                                           status VARCHAR(40) NOT NULL,

                                           remarks VARCHAR(1000),

                                           created_by VARCHAR(100) NOT NULL,
                                           created_at TIMESTAMPTZ NOT NULL,
                                           updated_at TIMESTAMPTZ NOT NULL,

                                           CONSTRAINT ck_asset_request_procurement_status CHECK (
                                               status IN (
                                                          'PENDING',
                                                          'QUOTATION_RECEIVED',
                                                          'PO_CREATED',
                                                          'ORDERED',
                                                          'RECEIVED',
                                                          'CANCELLED'
                                                   )
                                               )
);

CREATE INDEX idx_asset_request_procurement_request
    ON asset_request_procurement(request_id);

CREATE INDEX idx_asset_request_procurement_status
    ON asset_request_procurement(status);