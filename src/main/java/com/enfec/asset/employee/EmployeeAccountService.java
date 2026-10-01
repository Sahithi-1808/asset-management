package com.enfec.asset.employee;

import com.enfec.asset.employee.dto.CreateEmployeeRequest;
import com.enfec.asset.employee.dto.EmployeeResponse;

import java.util.List;

public interface EmployeeAccountService {
    EmployeeResponse createEmployee(CreateEmployeeRequest request);
    List<EmployeeResponse> getEmployees();
}
