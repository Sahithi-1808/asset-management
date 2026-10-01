CREATE TABLE asset_request (
    id UUID PRIMARY KEY,
    request_number VARCHAR(40) NOT NULL UNIQUE,
    requester_username VARCHAR(100) NOT NULL,
    employee_username VARCHAR(100) NOT NULL,
    asset_id UUID NOT NULL REFERENCES asset(id),
    quantity INTEGER NOT NULL,
    priority VARCHAR(30) NOT NULL,
    business_justification VARCHAR(1000) NOT NULL,
    required_from DATE,
    required_to DATE,
    location VARCHAR(200),
    status VARCHAR(30) NOT NULL,
    approver_username VARCHAR(100) NOT NULL,
    approval_comment VARCHAR(1000),
    approved_at TIMESTAMPTZ,
    requires_finance_approval BOOLEAN NOT NULL DEFAULT FALSE,
    finance_username VARCHAR(100),
    finance_comment VARCHAR(1000),
    finance_approved_at TIMESTAMPTZ,
    assigned_username VARCHAR(100),
    fulfilled_at TIMESTAMPTZ,
    closed_by VARCHAR(100),
    closed_at TIMESTAMPTZ,
    closure_note VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_asset_request_quantity CHECK (quantity > 0),
    CONSTRAINT ck_asset_request_status CHECK (
        status IN (
            'PENDING_APPROVAL', 'APPROVED', 'REJECTED',
            'FINANCE_PENDING', 'FINANCE_APPROVED',
            'FULFILLMENT_PENDING', 'ASSIGNED', 'FULFILLED', 'CLOSED'
        )
    )
);

CREATE INDEX idx_asset_request_status ON asset_request(status);
CREATE INDEX idx_asset_request_approver ON asset_request(approver_username);
CREATE INDEX idx_asset_request_employee ON asset_request(employee_username);
CREATE INDEX idx_asset_request_requester ON asset_request(requester_username);

CREATE TABLE asset_request_history (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES asset_request(id) ON DELETE CASCADE,
    action VARCHAR(60) NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30),
    actor_username VARCHAR(100) NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_asset_request_history_request
    ON asset_request_history(request_id, created_at);
