package com.emporio.pet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public class CustomerUpdateDTO {

    @Size(min = 3, message = "Nome precisa ter no mínimo 3 caracteres")
    private String name;

    private String phone;

    @NotBlank(message = "CPF é obrigatório")
    private String cpf;

    @PastOrPresent(message = "Data de nascimento não pode ser no futuro")
    private LocalDate birthDate;

    public CustomerUpdateDTO() {
    }

    public CustomerUpdateDTO(String name, String phone, String cpf, LocalDate birthDate) {
        this.name = name;
        this.phone = phone;
        this.cpf = cpf;
        this.birthDate = birthDate;
    }


    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
}