package com.emporio.pet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class UserUpdateDTO {

    @Size(min = 3, message = "O nome tem que ter mais de 3 caracteres")
    public String name;

    @Email(message = "Formato de email invalido")
    public String email;

    public String phone;
    public LocalDate birthDate;

    public UserUpdateDTO(String name, String email, String phone, LocalDate birthDate) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.birthDate = birthDate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }
}