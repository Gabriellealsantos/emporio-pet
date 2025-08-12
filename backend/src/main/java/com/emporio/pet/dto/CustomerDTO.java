package com.emporio.pet.dto;

import com.emporio.pet.entities.Customer;

import java.time.LocalDate;

public class CustomerDTO extends UserDTO  {

    public Long customerId;
    public String cpf;

    public CustomerDTO() {
        super();
    }

    public CustomerDTO(Customer entity) {
        super(entity.getUser());
        this.customerId = entity.getId();
        this.cpf = entity.getCpf();
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCpf() {
        return cpf;
    }
}