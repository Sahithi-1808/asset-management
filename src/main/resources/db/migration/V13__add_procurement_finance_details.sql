ALTER TABLE asset_request_procurement
    ADD COLUMN budget_amount NUMERIC(15,2);

ALTER TABLE asset_request_procurement
    ADD COLUMN approved_budget NUMERIC(15,2);

ALTER TABLE asset_request_procurement
    ADD COLUMN finance_decision VARCHAR(30);

ALTER TABLE asset_request_procurement
    ADD COLUMN finance_comment VARCHAR(1000);

ALTER TABLE asset_request_procurement
    ADD COLUMN finance_username VARCHAR(100);

ALTER TABLE asset_request_procurement
    ADD COLUMN finance_approved_at TIMESTAMPTZ;