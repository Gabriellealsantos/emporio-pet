package com.emporio.pet.dto;

import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.enums.AppointmentStatus;

import java.time.LocalDateTime;

public class AppointmentDTO {

    private Long id;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private AppointmentStatus status;
    private PetDTO pet;
    private ServicesDTO service;
    private EmployeeDTO employee;

    public AppointmentDTO(Appointment entity) {
        this.id = entity.getId();
        this.startDateTime = entity.getStartDateTime();
        this.endDateTime = entity.getEndDateTime();
        this.status = entity.getStatus();
        this.pet = new PetDTO(entity.getPet());
        this.service = new ServicesDTO(entity.getService());
        this.employee = new EmployeeDTO(entity.getEmployee());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public PetDTO getPet() {
        return pet;
    }

    public void setPet(PetDTO pet) {
        this.pet = pet;
    }

    public ServicesDTO getService() {
        return service;
    }

    public void setService(ServicesDTO service) {
        this.service = service;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }
}