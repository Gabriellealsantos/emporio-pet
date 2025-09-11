package com.emporio.pet.dto;

import java.math.BigDecimal;

public class ServicesInsertDTO {

    private String name;
    private String description;
    private BigDecimal price;
    private int estimatedDurationInMinutes;

    public ServicesInsertDTO() {}

    public ServicesInsertDTO(String name, String description, BigDecimal price, int estimatedDurationInMinutes) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.estimatedDurationInMinutes = estimatedDurationInMinutes;
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

    public int getEstimatedDurationInMinutes() {
        return estimatedDurationInMinutes;
    }

    public void setEstimatedDurationInMinutes(int estimatedDurationInMinutes) {
        this.estimatedDurationInMinutes = estimatedDurationInMinutes;
    }
}