package com.enfec.asset.employee;

import com.enfec.asset.employee.dto.CreateEmployeeRequest;
import com.enfec.asset.employee.dto.EmployeeResponse;
import com.enfec.asset.employee.repository.EmployeeAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeAccountServiceImpl implements EmployeeAccountService {

    private final EmployeeAccountRepository employeeAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeAccountServiceImpl(
            EmployeeAccountRepository employeeAccountRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeAccountRepository = employeeAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public EmployeeResponse createEmployee(
            CreateEmployeeRequest request
    ) {

        if (employeeAccountRepository.existsByUsername(
                request.username()
        )) {
            throw new IllegalArgumentException(
                    "Username already exists: " + request.username()
            );
        }

        if (employeeAccountRepository.existsByEmail(
                request.email()
        )) {
            throw new IllegalArgumentException(
                    "Email already exists: " + request.email()
            );
        }

        String passwordHash =
                passwordEncoder.encode(request.password());

        EmployeeAccountEntity employee =
                new EmployeeAccountEntity(
                        request.username(),
                        passwordHash,
                        request.fullName(),
                        request.email(),
                        request.role() == null || request.role().isBlank() ? "EMPLOYEE" : request.role().trim().toUpperCase(),
                        request.managerUsername()
                );

        EmployeeAccountEntity savedEmployee =
                employeeAccountRepository.save(employee);

        return new EmployeeResponse(
                savedEmployee.getId(),
                savedEmployee.getUsername(),
                savedEmployee.getFullName(),
                savedEmployee.getEmail(),
                savedEmployee.getRole(),
                savedEmployee.getManagerUsername(),
                savedEmployee.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployees() {
        return employeeAccountRepository.findAll().stream()
                .map(employee -> new EmployeeResponse(
                        employee.getId(), employee.getUsername(), employee.getFullName(),
                        employee.getEmail(), employee.getRole(), employee.getManagerUsername(),
                        employee.getCreatedAt()
                )).toList();
    }
}