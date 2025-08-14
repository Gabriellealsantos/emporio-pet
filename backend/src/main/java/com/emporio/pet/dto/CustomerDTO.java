package com.emporio.pet.dto;

import com.emporio.pet.entities.Customer;

public class CustomerDTO extends UserDTO {

    public String cpf;

    public CustomerDTO() {
        super();
    }

    public CustomerDTO(Customer entity) {
        super(entity);

        this.cpf = entity.getCpf();
    }

    public String getCpf() {
        return cpf;
    }
}