CREATE TABLE asset_audit_log (
                                 id UUID PRIMARY KEY,
                                 asset_id UUID NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
                                 asset_tag VARCHAR(100) NOT NULL,
                                 action VARCHAR(50) NOT NULL,
                                 performed_by VARCHAR(100) NOT NULL,
                                 old_value TEXT,
                                 new_value TEXT,
                                 details TEXT,
                                 created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_asset_audit_log_action
    ON asset_audit_log(action);

CREATE INDEX idx_asset_audit_log_asset_id
    ON asset_audit_log(asset_id);

CREATE INDEX idx_asset_audit_log_created_at
    ON asset_audit_log(created_at);

CREATE INDEX idx_asset_audit_log_performed_by
    ON asset_audit_log(performed_by);