package com.emporio.pet.dto;

import jakarta.validation.constraints.Size;

public class EmployeeUpdateDTO {

    @Size(min = 3, message = "Nome precisa ter no mínimo 3 caracteres")
    private final String name;

    private final String phone;

    private final String jobTitle;

    public EmployeeUpdateDTO(String name, String phone, String jobTitle) {
        this.name = name;
        this.phone = phone;
        this.jobTitle = jobTitle;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getJobTitle() {
        return jobTitle;
    }
}
