package com.emporio.pet.entities;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tb_employee")
@PrimaryKeyJoinColumn(name = "user_id")
public class Employee extends User {

    private String jobTitle;

    @OneToMany(mappedBy = "employee")
    private List<Appointment> appointments = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "tb_employee_service",
            joinColumns = @JoinColumn(name = "employee_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id"))
    private Set<Services> skilledServices = new HashSet<>();

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

    public Set<Services> getSkilledServices() {
        return skilledServices;
    }

}