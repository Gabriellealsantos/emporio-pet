package com.emporio.pet.services.exceptions;

public class EmailException extends RuntimeException {
    public EmailException(String msg) {
        super(msg);
    }
}