package com.emporio.pet.dto;

import com.emporio.pet.entities.Appointment;
import com.emporio.pet.entities.enums.AppointmentStatus;
import com.emporio.pet.entities.enums.InvoiceStatus;

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
    private Long invoiceId;
    private InvoiceStatus invoiceStatus;

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

        if (entity.getInvoice() != null) {
            this.invoiceId = entity.getInvoice().getId();
        }

        if (entity.getInvoice() != null) {
            this.invoiceId = entity.getInvoice().getId();
            this.invoiceStatus = entity.getInvoice().getStatus();
        } else {
            this.invoiceStatus = null;
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

    public ReviewDTO getReview() {
        return review;
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public InvoiceStatus getInvoiceStatus() {
        return invoiceStatus;
    }
}