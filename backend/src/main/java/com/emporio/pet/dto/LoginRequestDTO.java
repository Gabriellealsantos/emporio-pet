package com.emporio.pet.dto;


public class LoginRequestDTO {

    public String email;
    public String password;

    public LoginRequestDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() { return email; }
    public String getPassword() { return password; }
}