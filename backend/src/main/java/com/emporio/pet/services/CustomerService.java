package com.emporio.pet.services;

import com.emporio.pet.dto.CustomerDTO;
import com.emporio.pet.dto.CustomerInsertDTO;
import com.emporio.pet.dto.CustomerUpdateDTO;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Role;
import com.emporio.pet.entities.enums.UserStatus;
import com.emporio.pet.repositories.CustomerRepository;
import com.emporio.pet.repositories.RoleRepository;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.DatabaseException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository; // Adicionado para atribuir o papel

    public CustomerService(CustomerRepository customerRepository, UserRepository userRepository,
                           AuthService authService, PasswordEncoder passwordEncoder,
                           RoleRepository roleRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public CustomerDTO register(CustomerInsertDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DatabaseException("O email informado já está em uso.");
        }
        if (customerRepository.findByCpf(dto.getCpf()).isPresent()) {
            throw new DatabaseException("O CPF informado já está em uso.");
        }

        Customer customer = new Customer();

        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setBirthDate(dto.getBirthDate());
        customer.setPassword(passwordEncoder.encode(dto.getPassword()));
        customer.setUserStatus(UserStatus.NON_BLOCKED);

        customer.setCpf(dto.getCpf());

        Role clientRole = roleRepository.findByAuthority("ROLE_CLIENT");
        customer.getRoles().add(clientRole);

        Customer savedCustomer = customerRepository.save(customer);
        return new CustomerDTO(savedCustomer);
    }

    @Transactional
    public CustomerDTO update(Long id, CustomerUpdateDTO dto) {
        // A verificação de segurança (isSelfOrAdmin) já está aqui, perfeito.
        if (!authService.isSelfOrAdmin(id)) {
            throw new ForbiddenException("Acesso negado");
        }

        Customer customerEntity = customerRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Cliente não encontrado")
        );

        // Atualiza os campos se eles foram fornecidos no DTO
        if (dto.getName() != null) customerEntity.setName(dto.getName());
        if (dto.getPhone() != null) customerEntity.setPhone(dto.getPhone());
        if (dto.getCpf() != null) customerEntity.setCpf(dto.getCpf());
        if (dto.getBirthDate() != null) customerEntity.setBirthDate(dto.getBirthDate());


        customerEntity = customerRepository.save(customerEntity);
        return new CustomerDTO(customerEntity);
    }
}