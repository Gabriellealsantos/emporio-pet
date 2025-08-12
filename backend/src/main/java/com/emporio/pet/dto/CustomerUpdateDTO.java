package com.emporio.pet.dto;

import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public class CustomerUpdateDTO {

    @Size(min = 3, message = "Nome precisa ter no mínimo 3 caracteres")
    private final String name;

    private final String phone;

    @CPF(message = "CPF inválido")
    private final String cpf;

    public CustomerUpdateDTO(String name, String phone, String cpf) {
        this.name = name;
        this.phone = phone;
        this.cpf = cpf;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getCpf() {
        return cpf;
    }
}