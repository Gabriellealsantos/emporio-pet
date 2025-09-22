package com.emporio.pet.dto;

import java.math.BigDecimal;

public class ServicesInsertDTO {

    private String name;
    private String description;
    private BigDecimal price;
    private int estimatedDurationInMinutes;
    private String priceDisplay;
    private String durationDisplay;
    private boolean isFeatured;

    public ServicesInsertDTO() {}

    public ServicesInsertDTO(String name, String description, BigDecimal price, int estimatedDurationInMinutes, String priceDisplay, String durationDisplay, boolean isFeatured) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.estimatedDurationInMinutes = estimatedDurationInMinutes;
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
    public int getEstimatedDurationInMinutes() { return estimatedDurationInMinutes; }
    public void setEstimatedDurationInMinutes(int estimatedDurationInMinutes) { this.estimatedDurationInMinutes = estimatedDurationInMinutes; }
    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }
    public String getDurationDisplay() { return durationDisplay; }
    public void setDurationDisplay(String durationDisplay) { this.durationDisplay = durationDisplay; }
    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }
}