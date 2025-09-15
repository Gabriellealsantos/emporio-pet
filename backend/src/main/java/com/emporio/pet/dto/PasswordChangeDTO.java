package com.emporio.pet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PasswordChangeDTO {

    @NotBlank(message = "Senha atual é obrigatória.")
    private String currentPassword;

    @NotBlank(message = "Nova senha é obrigatória.")
    @Size(min = 8, message = "Nova senha precisa ter no mínimo 8 caracteres.")
    private String newPassword;

    @NotBlank(message = "Confirmação de senha é obrigatória.")
    private String confirmNewPassword;

    public PasswordChangeDTO() {
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmNewPassword() {
        return confirmNewPassword;
    }

    public void setConfirmNewPassword(String confirmNewPassword) {
        this.confirmNewPassword = confirmNewPassword;
    }
}