package com.emporio.pet.dto;

import java.math.BigDecimal;

public class ServicesUpdateDTO {

    private String name;
    private String description;
    private BigDecimal price;
    private String priceDisplay;
    private String durationDisplay;
    private Boolean isFeatured;

    public ServicesUpdateDTO() {}

    public ServicesUpdateDTO(String name, String description, BigDecimal price, String priceDisplay, String durationDisplay, Boolean isFeatured) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.priceDisplay = priceDisplay;
        this.durationDisplay = durationDisplay;
        this.isFeatured = isFeatured;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }
    public String getDurationDisplay() { return durationDisplay; }
    public void setDurationDisplay(String durationDisplay) { this.durationDisplay = durationDisplay; }
    public Boolean getFeatured() { return isFeatured; }
    public void setFeatured(Boolean featured) { isFeatured = featured; }
}