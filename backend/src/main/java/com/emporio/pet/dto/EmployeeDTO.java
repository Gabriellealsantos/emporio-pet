package com.emporio.pet.dto;

import com.emporio.pet.entities.Employee;

import java.util.Set;
import java.util.stream.Collectors;

public class EmployeeDTO extends UserDTO {

    public String jobTitle;

    private Set<ServicesDTO> skilledServices;

    public EmployeeDTO() {
        super();
    }

    public EmployeeDTO(Employee entity) {
        super(entity);
        this.jobTitle = entity.getJobTitle();
        this.skilledServices = entity.getSkilledServices().stream()
                .map(ServicesDTO::new)
                .collect(Collectors.toSet());
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public Set<ServicesDTO> getSkilledServices() {
        return skilledServices;
    }
}