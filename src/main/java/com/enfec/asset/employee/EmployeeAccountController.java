package com.enfec.asset.employee;

import com.enfec.asset.employee.dto.CreateEmployeeRequest;
import com.enfec.asset.employee.dto.EmployeeResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeAccountController {

    private final EmployeeAccountService employeeAccountService;

    public EmployeeAccountController(
            EmployeeAccountService employeeAccountService
    ) {
        this.employeeAccountService = employeeAccountService;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getEmployees() {
        return ResponseEntity.ok(employeeAccountService.getEmployees());
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request
    ) {

        return ResponseEntity
                .status(201)
                .body(
                        employeeAccountService.createEmployee(request)
                );
    }
}