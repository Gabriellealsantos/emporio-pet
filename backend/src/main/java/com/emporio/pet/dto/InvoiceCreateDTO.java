package com.emporio.pet.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class InvoiceCreateDTO {

    @NotNull(message = "O ID do cliente é obrigatório.")
    private Long customerId;

    @NotEmpty(message = "A lista de agendamentos não pode ser vazia.")
    private List<Long> appointmentIds;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<Long> getAppointmentIds() {
        return appointmentIds;
    }

    public void setAppointmentIds(List<Long> appointmentIds) {
        this.appointmentIds = appointmentIds;
    }
}