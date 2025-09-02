package com.emporio.pet.dto;

import java.math.BigDecimal;

public class ServicesUpdateDTO {

    private String name;
    private String description;
    private BigDecimal price;

    public ServicesUpdateDTO() {}

    public ServicesUpdateDTO(String name, String description, BigDecimal price) {
        this.name = name;
        this.description = description;
        this.price = price;
    }

    // Getters e Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}