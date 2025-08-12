package com.emporio.pet.dto;


public class ResetPasswordDTO {

    public final String token;
    public final String newPassword;

    public ResetPasswordDTO(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }

    public String getToken() { return token; }
    public String getNewPassword() { return newPassword; }
}