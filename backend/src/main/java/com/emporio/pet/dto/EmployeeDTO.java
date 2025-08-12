package com.emporio.pet.dto;

import com.emporio.pet.entities.Employee;

import java.time.LocalDate;

public class EmployeeDTO extends UserDTO {


    public Long employeeId;
    public String jobTitle;

    public EmployeeDTO() {
        super();
    }

    public EmployeeDTO(Employee entity) {
        super(entity.getUser());

        this.employeeId = entity.getId();
        this.jobTitle = entity.getJobTitle();
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getJobTitle() {
        return jobTitle;
    }
}