package com.emporio.pet.services;

import com.emporio.pet.dto.CustomerDTO;
import com.emporio.pet.dto.CustomerInsertDTO;
import com.emporio.pet.dto.CustomerUpdateDTO;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.User;
import com.emporio.pet.factory.UserFactory;
import com.emporio.pet.repositories.CustomerRepository;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.DatabaseException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final UserFactory userFactory;
    private final AuthService authService;

    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository, UserFactory userFactory, AuthService authService) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.userFactory = userFactory;
        this.authService = authService;
    }

    @Transactional
    public CustomerDTO register(CustomerInsertDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DatabaseException("O email informado já está em uso.");
        }
        if (customerRepository.findByCpf(dto.getCpf()).isPresent()) {
            throw new DatabaseException("O CPF informado já está em uso.");
        }

        User user = userFactory.create(dto, "ROLE_CLIENT");

        Customer customer = new Customer();
        customer.setCpf(dto.getCpf());
        customer.setUser(user);

        Customer savedCustomer = customerRepository.save(customer);
        return new CustomerDTO(savedCustomer);
    }

    @Transactional
    public CustomerDTO update(Long id, CustomerUpdateDTO dto) {
        if (!authService.isSelfOrAdminByCustomerId(id)) {
            throw new ForbiddenException("Acesso negado");
        }

        Customer customerEntity = customerRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Cliente não encontrado")
        );

        if (dto.getName() != null) customerEntity.getUser().setName(dto.getName());
        if (dto.getPhone() != null) customerEntity.getUser().setPhone(dto.getPhone());
        if (dto.getCpf() != null) customerEntity.setCpf(dto.getCpf());

        customerEntity = customerRepository.save(customerEntity);
        return new CustomerDTO(customerEntity);
    }
}