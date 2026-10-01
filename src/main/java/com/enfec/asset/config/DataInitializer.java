package com.enfec.asset.config;

import com.enfec.asset.employee.EmployeeAccountEntity;
import com.enfec.asset.employee.repository.EmployeeAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDemoUsers(
            EmployeeAccountRepository repository,
            PasswordEncoder encoder
    ) {
        return args -> {
            createIfMissing(repository, encoder, "hr", "hr123", "HR User", "hr@company.com", "HR", null);
            createIfMissing(repository, encoder, "manager", "manager123", "Manager User", "manager@company.com", "MANAGER", null);
            createIfMissing(repository, encoder, "finance", "finance123", "Finance User", "finance@company.com", "FINANCE", null);
            createIfMissing(repository, encoder, "approver", "approver123", "Higher Authority", "approver@company.com", "HIGHER_AUTHORITY", null);
            createIfMissing(repository, encoder, "employee", "employee123", "Demo Employee", "employee@company.com", "EMPLOYEE", "manager");
            createIfMissing(repository, encoder, "procurement", "procurement123", "Procurement User", "procurement@company.com", "PROCUREMENT", null);
        };
    }

    private void createIfMissing(
            EmployeeAccountRepository repository,
            PasswordEncoder encoder,
            String username,
            String password,
            String fullName,
            String email,
            String role,
            String managerUsername
    ) {
        if (!repository.existsByUsername(username)) {
            repository.save(new EmployeeAccountEntity(
                    username,
                    encoder.encode(password),
                    fullName,
                    email,
                    role,
                    managerUsername
            ));
        }
    }
}
