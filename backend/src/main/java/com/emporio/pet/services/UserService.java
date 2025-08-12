package com.emporio.pet.services;

import com.emporio.pet.dto.*;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Employee;
import com.emporio.pet.entities.User;
import com.emporio.pet.factory.UserFactory;
import com.emporio.pet.repositories.CustomerRepository;
import com.emporio.pet.repositories.EmployeeRepository;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.DatabaseException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import com.emporio.pet.services.exceptions.UsernameNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;

    public UserService(UserRepository userRepository, CustomerRepository customerRepository,
                       EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
    }

    // Dentro de UserService.java

    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable) {
        // 1. Busca a página de Users (otimizada com @EntityGraph no repositório)
        Page<User> userPage = userRepository.findAll(pageable);

        // 2. Extrai os IDs dos usuários da página
        List<Long> userIds = userPage.getContent().stream().map(User::getId).collect(Collectors.toList());

        // 3. Busca em LOTE todos os perfis de Customer e Employee
        List<Customer> customers = customerRepository.findByUser_IdIn(userIds);
        List<Employee> employees = employeeRepository.findByUser_IdIn(userIds);

        // 4. Cria mapas para busca rápida (ID do User -> Perfil)
        Map<Long, Customer> customerMap = customers.stream().collect(Collectors.toMap(c -> c.getUser().getId(), c -> c));
        Map<Long, Employee> employeeMap = employees.stream().collect(Collectors.toMap(e -> e.getUser().getId(), e -> e));

        // 5. Mapeia a página para o DTO polimórfico correto
        return userPage.map(user -> {
            if (customerMap.containsKey(user.getId())) {
                return new CustomerDTO(customerMap.get(user.getId()));
            }
            else if (employeeMap.containsKey(user.getId())) {
                return new EmployeeDTO(employeeMap.get(user.getId()));
            }
            else {
                return new UserDTO(user);
            }
        });
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User not found")
        );

        // Lógica polimórfica
        Optional<Customer> customerOpt = customerRepository.findByUserId(user.getId());
        if (customerOpt.isPresent()) {
            return new CustomerDTO(customerOpt.get());
        }

        Optional<Employee> employeeOpt = employeeRepository.findByUserId(user.getId());
        if (employeeOpt.isPresent()) {
            return new EmployeeDTO(employeeOpt.get());
        }

        return new UserDTO(user);
    }

    public User authenticated() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            return userRepository.findByEmail(username).orElseThrow(
                    () -> new UsernameNotFoundException("Invalid user")
            );
        }
        catch (Exception e) {
            throw new UsernameNotFoundException("Invalid user");
        }
    }

    @Transactional(readOnly = true)
    public UserDTO getMe() {
        User user = authenticated();

        Optional<Customer> customerOpt = customerRepository.findByUserId(user.getId());
        if (customerOpt.isPresent()) {
            return new CustomerDTO(customerOpt.get());
        }


        Optional<Employee> employeeOpt = employeeRepository.findByUserId(user.getId());
        if (employeeOpt.isPresent()) {
            return new EmployeeDTO(employeeOpt.get());
        }

        return new UserDTO(user);
    }



}
