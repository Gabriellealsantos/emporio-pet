package com.emporio.pet.dto;

import com.emporio.pet.entities.Services;

import java.math.BigDecimal;

public class ServicesDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean active;

    public ServicesDTO() {}

    public ServicesDTO(Long id, String name, String description, BigDecimal price, Boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.active = active;
    }

    public ServicesDTO(Services entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.description = entity.getDescription();
        this.price = entity.getPrice();
        this.active = entity.isActive();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}