package com.emporio.pet.dto;

import com.emporio.pet.entities.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public class AppointmentStatusUpdateDTO {

    @NotNull(message = "O novo status é obrigatório.")
    private AppointmentStatus newStatus;

    public AppointmentStatusUpdateDTO() {
    }

    public AppointmentStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(AppointmentStatus newStatus) {
        this.newStatus = newStatus;
    }
}