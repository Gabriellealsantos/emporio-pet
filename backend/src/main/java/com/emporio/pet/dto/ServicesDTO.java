package com.emporio.pet.dto;

import com.emporio.pet.entities.Services;
import java.math.BigDecimal;

public class ServicesDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int estimatedDurationInMinutes;
    private boolean active;
    private String imageUrl;
    private String priceDisplay;
    private String durationDisplay;
    private boolean isFeatured;

    public ServicesDTO() {}

    public ServicesDTO(Services entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.description = entity.getDescription();
        this.price = entity.getPrice();
        this.estimatedDurationInMinutes = entity.getEstimatedDurationInMinutes();
        this.active = entity.isActive();
        this.imageUrl = entity.getImageUrl();
        this.priceDisplay = entity.getPriceDisplay();
        this.durationDisplay = entity.getDurationDisplay();
        this.isFeatured = entity.isFeatured();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public int getEstimatedDurationInMinutes() { return estimatedDurationInMinutes; }
    public boolean isActive() { return active; }
    public String getImageUrl() { return imageUrl; }
    public String getPriceDisplay() { return priceDisplay; }
    public String getDurationDisplay() { return durationDisplay; }
    public boolean isFeatured() { return isFeatured; }
}