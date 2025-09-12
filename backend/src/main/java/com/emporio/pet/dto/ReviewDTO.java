package com.emporio.pet.dto;

import com.emporio.pet.entities.Review;

import java.time.Instant;

public class ReviewDTO {

    private Long id;
    private Integer rating;
    private String comment;
    private Instant reviewDate;
    private String customerName;

    public ReviewDTO(Review entity) {
        this.id = entity.getId();
        this.rating = entity.getRating();
        this.comment = entity.getComment();
        this.reviewDate = entity.getReviewDate();
        if (entity.getAppointment() != null && entity.getAppointment().getPet() != null) {
            this.customerName = entity.getAppointment().getPet().getOwner().getName();
        }
    }

    public Long getId() { return id; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public Instant getReviewDate() { return reviewDate; }
    public String getCustomerName() { return customerName; }
}