package com.emporio.pet.dto;

import com.emporio.pet.entities.Customer;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CustomerDTO extends UserDTO {

    private String cpf;
    private List<PetDTO> pets = new ArrayList<>();

    public CustomerDTO() {
        super();
    }

    public CustomerDTO(Customer entity) {
        super(entity);
        this.cpf = entity.getCpf();

        if (entity.getPets() != null) {
            this.pets = entity.getPets().stream().map(PetDTO::new).collect(Collectors.toList());
        }
    }

    public String getCpf() {
        return cpf;
    }

    public List<PetDTO> getPets() {
        return pets;
    }
}