package com.emporio.pet.services.exceptions;

public class OrderInvalidException extends RuntimeException {
    public OrderInvalidException(String message) {
        super(message);
    }
}
