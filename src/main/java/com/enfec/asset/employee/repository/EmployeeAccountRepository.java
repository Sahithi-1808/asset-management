package com.enfec.asset.employee.repository;

import com.enfec.asset.employee.EmployeeAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeAccountRepository extends JpaRepository<EmployeeAccountEntity, UUID> {
    Optional<EmployeeAccountEntity> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<EmployeeAccountEntity> findByManagerUsernameIgnoreCase(String managerUsername);
    List<EmployeeAccountEntity> findByRoleIgnoreCase(String role);
}
