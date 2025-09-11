package com.emporio.pet.dto;

import com.emporio.pet.entities.enums.UserStatus;

public class UserStatusUpdateDTO {

    private UserStatus newStatus;

    public UserStatusUpdateDTO(UserStatus newStatus) {
        this.newStatus = newStatus;
    }

    public UserStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(UserStatus newStatus) {
        this.newStatus = newStatus;
    }
}
