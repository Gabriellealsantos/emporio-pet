package com.emporio.pet.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_order_item")
public class OrderItem {

    @Id
    @GeneratedValue
    private Long id;
    @ManyToOne
    private Order order;

    @ManyToOne
    private Product product;

    @OneToOne
    private Appointment appointment;

    public OrderItem() {
    }

    public OrderItem(Long id, Order order, Product product, Appointment appointment) {
        this.id = id;
        this.order = order;
        this.product = product;
        this.appointment = appointment;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }
}