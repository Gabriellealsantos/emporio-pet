package com.emporio.pet.entities;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_employee")
@PrimaryKeyJoinColumn(name = "user_id")
public class Employee extends User {

    private String jobTitle;

    @OneToMany(mappedBy = "employee")
    private List<Appointment> appointments = new ArrayList<>();

    public Employee() {
        super();
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }
}