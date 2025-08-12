package com.emporio.pet.dto;

import com.emporio.pet.dto.interfaces.UserCreateRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;
import java.time.LocalDate;

public class CustomerInsertDTO implements UserCreateRequest {

        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 3, message = "Nome precisa ter no mínimo 3 caracteres")
        public String name;

        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Formato de email inválido")
        public String email;

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, message = "Senha precisa ter no mínimo 8 caracteres")
        public String password;

        @NotBlank(message = "Telefone é obrigatório")
        public String phone;

        @PastOrPresent(message = "Data de nascimento não pode ser no futuro")
        public LocalDate birthDate;

        @NotBlank(message = "CPF é obrigatório")
        @CPF(message = "CPF inválido")
        public String cpf;

        // Constructor
        public CustomerInsertDTO(String name, String email, String password, String phone, LocalDate birthDate, String cpf) {
                this.name = name;
                this.email = email;
                this.password = password;
                this.phone = phone;
                this.birthDate = birthDate;
                this.cpf = cpf;
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

        public String getCpf() {
                return cpf;
        }

        public void setCpf(String cpf) {
                this.cpf = cpf;
        }
}