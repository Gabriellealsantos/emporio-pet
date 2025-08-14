package com.emporio.pet.services;

import com.emporio.pet.dto.CustomerDTO;
import com.emporio.pet.dto.EmployeeDTO;
import com.emporio.pet.dto.UserDTO;
import com.emporio.pet.entities.Customer;
import com.emporio.pet.entities.Employee;
import com.emporio.pet.entities.User;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable) {

        Page<User> userPage = userRepository.findAll(pageable);

        return userPage.map(user -> {
            if (user instanceof Customer) {
                return new CustomerDTO((Customer) user);
            }
            else if (user instanceof Employee) {
                return new EmployeeDTO((Employee) user);
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

        if (user instanceof Customer) {
            return new CustomerDTO((Customer) user);
        }
        if (user instanceof Employee) {
            return new EmployeeDTO((Employee) user);
        }
        return new UserDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getMe() {
        User user = authService.authenticated();

        if (user instanceof Customer) {
            return new CustomerDTO((Customer) user);
        }
        if (user instanceof Employee) {
            return new EmployeeDTO((Employee) user);
        }
        return new UserDTO(user);
    }
}