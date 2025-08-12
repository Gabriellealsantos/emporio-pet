package com.emporio.pet.services.exceptions;

public class UsernameNotFoundException extends RuntimeException {
    public UsernameNotFoundException(String msg) {
        super(msg);
    }
}
