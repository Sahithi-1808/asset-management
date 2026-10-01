ALTER TABLE employee_account
DROP CONSTRAINT ck_employee_account_role;

ALTER TABLE employee_account
    ADD CONSTRAINT ck_employee_account_role CHECK (
        role IN (
                 'SYSTEM_ADMIN',
                 'HR',
                 'MANAGER',
                 'FINANCE',
                 'HIGHER_AUTHORITY',
                 'EMPLOYEE',
                 'PROCUREMENT'
            )
        );