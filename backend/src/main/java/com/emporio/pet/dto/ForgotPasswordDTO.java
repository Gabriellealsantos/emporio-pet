package com.emporio.pet.dto;

public class ForgotPasswordDTO {

    public String email;

    public ForgotPasswordDTO(String email) {
        this.email = email;
    }

    public String getEmail() { return email; }
}