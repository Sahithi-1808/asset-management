package com.enfec.asset.security;

import com.enfec.asset.employee.EmployeeAccountEntity;
import com.enfec.asset.employee.repository.EmployeeAccountRepository;
import com.enfec.asset.security.dto.LoginRequest;
import com.enfec.asset.security.dto.LoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final EmployeeAccountRepository employeeAccountRepository;
    private final JwtService jwtService;

    private final String adminUsername;
    private final String adminPassword;

    public AuthService(
            PasswordEncoder passwordEncoder,
            EmployeeAccountRepository employeeAccountRepository,
            JwtService jwtService,
            @Value("${ASSET_ADMIN_USERNAME:admin}") String adminUsername,
            @Value("${ASSET_ADMIN_PASSWORD:admin123}") String adminPassword
    ) {
        this.passwordEncoder = passwordEncoder;
        this.employeeAccountRepository = employeeAccountRepository;
        this.jwtService = jwtService;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    public LoginResponse login(LoginRequest request) {

        /*
         * Admin login
         */
        if (adminUsername.equals(request.username())
                && adminPassword.equals(request.password())) {

            String role = "SYSTEM_ADMIN";

            String token = jwtService.generateToken(
                    adminUsername,
                    role
            );

            return new LoginResponse(
                    "Login successful",
                    adminUsername,
                    role,
                    token
            );
        }

        /*
         * Employee login
         */
        EmployeeAccountEntity employee =
                employeeAccountRepository
                        .findByUsername(request.username())
                        .orElse(null);

        if (employee == null
                || !passwordEncoder.matches(
                request.password(),
                employee.getPasswordHash()
        )) {
            throw new InvalidCredentialsException();
        }

        String username = employee.getUsername();
        String role = employee.getRole();

        String token = jwtService.generateToken(
                username,
                role
        );

        return new LoginResponse(
                "Login successful",
                username,
                role,
                token
        );
    }
}