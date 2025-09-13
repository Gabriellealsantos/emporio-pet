package com.emporio.pet.entities;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_customer")
@PrimaryKeyJoinColumn(name = "user_id")
public class Customer extends User {

    @Column(unique = true)
    private String cpf;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pet> pets = new ArrayList<>();

    public Customer() {
        super();
    }

    // Getters e Setters

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public List<Pet> getPets() {
        return pets;
    }

}