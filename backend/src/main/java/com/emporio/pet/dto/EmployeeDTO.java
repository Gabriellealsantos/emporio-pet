package com.emporio.pet.dto;

import com.emporio.pet.entities.Employee;

public class EmployeeDTO extends UserDTO {

    public String jobTitle;

    public EmployeeDTO() {
        super();
    }

    public EmployeeDTO(Employee entity) {
        super(entity);
        this.jobTitle = entity.getJobTitle();
    }

    public String getJobTitle() {
        return jobTitle;
    }
}