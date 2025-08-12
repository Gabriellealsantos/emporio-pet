package com.emporio.pet.dto.interfaces;

import java.time.LocalDate;

public interface UserCreateRequest {
    String getName();
    String getEmail();
    String getPassword();
    String getPhone();
    LocalDate getBirthDate();
}
