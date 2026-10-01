CREATE TABLE asset_ticket (
                              id UUID PRIMARY KEY,
                              asset_id UUID NOT NULL REFERENCES asset(id) ON DELETE CASCADE,
                              employee_username VARCHAR(100) NOT NULL,
                              issue_type VARCHAR(40) NOT NULL,
                              description TEXT NOT NULL,
                              priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
                              status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
                              admin_note TEXT,
                              created_at TIMESTAMPTZ NOT NULL,

                              CONSTRAINT ck_asset_ticket_issue_type CHECK (
                                  issue_type IN (
                                                 'NOT_WORKING',
                                                 'HARDWARE_DAMAGE',
                                                 'SOFTWARE_ISSUE',
                                                 'PERFORMANCE_ISSUE',
                                                 'CONNECTIVITY_ISSUE',
                                                 'ACCESSORY_ISSUE',
                                                 'OTHER'
                                      )
                                  ),

                              CONSTRAINT ck_asset_ticket_priority CHECK (
                                  priority IN (
                                               'LOW',
                                               'MEDIUM',
                                               'HIGH',
                                               'URGENT'
                                      )
                                  ),

                              CONSTRAINT ck_asset_ticket_status CHECK (
                                  status IN (
                                             'OPEN',
                                             'ACKNOWLEDGED',
                                             'IN_PROGRESS',
                                             'RESOLVED',
                                             'CLOSED',
                                             'CANCELLED'
                                      )
                                  )
);

CREATE INDEX idx_asset_ticket_asset_id
    ON asset_ticket(asset_id);

CREATE INDEX idx_asset_ticket_created_at
    ON asset_ticket(created_at);

CREATE INDEX idx_asset_ticket_employee_username
    ON asset_ticket(employee_username);

CREATE INDEX idx_asset_ticket_status
    ON asset_ticket(status);