ALTER TABLE asset
    ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;

ALTER TABLE asset
    ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;