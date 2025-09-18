package com.emporio.pet.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AppointmentInsertDTO {

    @NotNull(message = "O ID do serviço é obrigatório.")
    private Long serviceId;

    @NotNull(message = "O ID do pet é obrigatório.")
    private Long petId;

    private Long employeeId;

    @NotNull(message = "A data/hora de início é obrigatória.")
    @Future(message = "O agendamento não pode ser feito no passado.")
    private LocalDateTime startDateTime;

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }
}