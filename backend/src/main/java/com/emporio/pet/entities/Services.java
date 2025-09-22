package com.emporio.pet.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.*;

@Entity
@Table(name = "tb_service")
public class Services {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @ManyToMany(mappedBy = "skilledServices")
    private Set<Employee> qualifiedEmployees = new HashSet<>();

    @Column(nullable = false)
    private int estimatedDurationInMinutes;
    private Boolean active = true;

    @OneToMany(mappedBy = "service")
    private List<Appointment> appointments = new ArrayList<>();

    private boolean isFeatured = false;
    private String imageUrl;
    private String priceDisplay;
    private String durationDisplay;

    public Services() {
    }

    public Services(Long id, String name, String description, BigDecimal price, int estimatedDurationInMinutes) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.estimatedDurationInMinutes = estimatedDurationInMinutes;
        this.active = true;
    }


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

    public Set<Employee> getQualifiedEmployees() {
        return qualifiedEmployees;
    }

    public int getEstimatedDurationInMinutes() {
        return estimatedDurationInMinutes;
    }

    public void setEstimatedDurationInMinutes(int estimatedDurationInMinutes) {
        this.estimatedDurationInMinutes = estimatedDurationInMinutes;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
    public boolean isActive() {
        return active;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getPriceDisplay() {
        return priceDisplay;
    }

    public void setPriceDisplay(String priceDisplay) {
        this.priceDisplay = priceDisplay;
    }

    public String getDurationDisplay() {
        return durationDisplay;
    }

    public void setDurationDisplay(String durationDisplay) {
        this.durationDisplay = durationDisplay;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Services service = (Services) o;
        return Objects.equals(id, service.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}