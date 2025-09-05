package com.emporio.pet.dto;

import jakarta.validation.constraints.NotNull;

public class ServiceAssociationDTO {

    @NotNull(message = "O ID do serviço é obrigatório.")
    private Long serviceId;

    public ServiceAssociationDTO() {
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }
}