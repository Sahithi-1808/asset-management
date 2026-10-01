CREATE TABLE asset_status_history (
                                      id UUID PRIMARY KEY,
                                      asset_id UUID NOT NULL,
                                      old_status VARCHAR(20),
                                      new_status VARCHAR(20) NOT NULL,
                                      changed_at TIMESTAMPTZ NOT NULL,

                                      CONSTRAINT fk_asset_status_history_asset
                                          FOREIGN KEY (asset_id)
                                              REFERENCES asset(id)
                                              ON DELETE CASCADE,

                                      CONSTRAINT ck_asset_status_history_old_status
                                          CHECK (
                                              old_status IS NULL
                                                  OR old_status IN (
                                                                    'IN_STOCK',
                                                                    'ASSIGNED',
                                                                    'IN_REPAIR',
                                                                    'RETIRED'
                                                  )
                                              ),

                                      CONSTRAINT ck_asset_status_history_new_status
                                          CHECK (
                                              new_status IN (
                                                             'IN_STOCK',
                                                             'ASSIGNED',
                                                             'IN_REPAIR',
                                                             'RETIRED'
                                                  )
                                              )
);

CREATE INDEX idx_asset_status_history_asset_id
    ON asset_status_history(asset_id);

CREATE INDEX idx_asset_status_history_changed_at
    ON asset_status_history(changed_at);