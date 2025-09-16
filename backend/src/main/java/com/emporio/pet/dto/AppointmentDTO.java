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
    private ReviewDTO review;

    public AppointmentDTO(Appointment entity) {
        this.id = entity.getId();
        this.startDateTime = entity.getStartDateTime();
        this.endDateTime = entity.getEndDateTime();
        this.status = entity.getStatus();
        this.pet = new PetDTO(entity.getPet());
        this.service = new ServicesDTO(entity.getService());
        this.employee = new EmployeeDTO(entity.getEmployee());

        if (entity.getReview() != null) {
            this.review = new ReviewDTO(entity.getReview());
        }
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public PetDTO getPet() {
        return pet;
    }

    public ServicesDTO getService() {
        return service;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    // 3. GETTER ADICIONADO
    public ReviewDTO getReview() {
        return review;
    }
}