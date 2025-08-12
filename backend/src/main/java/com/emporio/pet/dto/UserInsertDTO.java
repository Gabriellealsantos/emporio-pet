package com.emporio.pet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class UserInsertDTO {

        @NotBlank(message = "O nome não pode ser vazio")
        public String name;

        @NotBlank(message = "O email não pode ser vazio")
        @Email(message = "Formato de email inválido")
        public String email;

        @NotBlank(message = "A senha não pode ser vazia")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        public String password;

        public String phone;
        public LocalDate birthDate;

        public UserInsertDTO(String name, String email, String password, String phone, LocalDate birthDate) {
                this.name = name;
                this.email = email;
                this.password = password;
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

        public String getPassword() {
                return password;
        }

        public void setPassword(String password) {
                this.password = password;
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