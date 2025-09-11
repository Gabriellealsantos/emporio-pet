package com.emporio.pet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class PetAdminInsertDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, message = "Nome precisa ter no mínimo 2 caracteres")
    private String name;

    @NotNull(message = "Dono é obrigatório")
    private Long ownerId;

    @NotNull(message = "Raça é obrigatória")
    private Long breedId;

    @PastOrPresent(message = "Data de nascimento não pode ser no futuro")
    private LocalDate birthDate;

    private String notes;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public Long getBreedId() { return breedId; }
    public void setBreedId(Long breedId) { this.breedId = breedId; }
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}