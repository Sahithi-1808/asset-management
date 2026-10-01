ALTER TABLE employee_account
    DROP CONSTRAINT IF EXISTS ck_employee_account_role;

ALTER TABLE employee_account
    ADD COLUMN IF NOT EXISTS manager_username VARCHAR(100);

ALTER TABLE employee_account
    ADD CONSTRAINT ck_employee_account_role
    CHECK (role IN ('EMPLOYEE', 'HR', 'MANAGER', 'FINANCE', 'HIGHER_AUTHORITY'));

CREATE INDEX IF NOT EXISTS idx_employee_account_manager
    ON employee_account(manager_username);
