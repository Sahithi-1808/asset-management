CREATE TABLE asset (
    id UUID PRIMARY KEY,
    asset_tag VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    manufacturer VARCHAR(200),
    model VARCHAR(200),
    status VARCHAR(20) NOT NULL,
    assigned_to VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_asset_status CHECK (status IN ('IN_STOCK', 'ASSIGNED', 'IN_REPAIR', 'RETIRED'))
);

CREATE INDEX idx_asset_status ON asset(status);
