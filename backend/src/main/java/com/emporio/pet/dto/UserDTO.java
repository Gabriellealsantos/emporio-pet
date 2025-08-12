package com.emporio.pet.dto;

import com.emporio.pet.entities.User;
import com.emporio.pet.entities.enums.UserStatus;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

public class UserDTO {

    public Long id;
    public String name;
    public String email;
    public String phone;
    public LocalDate birthDate;
    public UserStatus userStatus;
    public Set<RoleDTO> roles;

    public UserDTO() {
    }

    public UserDTO(Long id, String name, String email, String phone, LocalDate birthDate, UserStatus userStatus) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.birthDate = birthDate;
        this.userStatus = userStatus;
    }

    public UserDTO(User entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.email = entity.getEmail();
        this.phone = entity.getPhone();
        this.birthDate = entity.getBirthDate();
        this.userStatus = entity.getUserStatus();
        this.roles = entity.getRoles().stream()
                .map(RoleDTO::new)
                .collect(Collectors.toSet());
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public UserStatus getUserStatus() {
        return userStatus;
    }

    public Set<RoleDTO> getRoles() {
        return roles;
    }
}