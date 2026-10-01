CREATE TABLE employee_account (
                                  id UUID PRIMARY KEY,
                                  username VARCHAR(100) NOT NULL UNIQUE,
                                  password_hash VARCHAR(255) NOT NULL,
                                  full_name VARCHAR(200) NOT NULL,
                                  email VARCHAR(200) NOT NULL UNIQUE,
                                  role VARCHAR(30) NOT NULL DEFAULT 'EMPLOYEE',
                                  created_at TIMESTAMPTZ NOT NULL,

                                  CONSTRAINT ck_employee_account_role
                                      CHECK (role = 'EMPLOYEE')
);

CREATE INDEX idx_employee_account_username
    ON employee_account(username);