package com.emporio.pet.services;

import com.emporio.pet.dto.EmployeeDTO;
import com.emporio.pet.dto.EmployeeInsertDTO;
import com.emporio.pet.dto.EmployeeUpdateDTO;
import com.emporio.pet.entities.Employee;
import com.emporio.pet.entities.User;
import com.emporio.pet.factory.UserFactory;
import com.emporio.pet.repositories.EmployeeRepository;
import com.emporio.pet.repositories.UserRepository;
import com.emporio.pet.services.exceptions.DatabaseException;
import com.emporio.pet.services.exceptions.ForbiddenException;
import com.emporio.pet.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final UserFactory userFactory;
    private final AuthService authService;

    public EmployeeService(EmployeeRepository employeeRepository, UserRepository userRepository,
                           UserFactory userFactory, AuthService authService) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.userFactory = userFactory;
        this.authService = authService;
    }

    @Transactional
    public EmployeeDTO create(EmployeeInsertDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DatabaseException("O email informado já está em uso.");
        }

        User user = userFactory.create(dto, "ROLE_EMPLOYEE");

        Employee employee = new Employee();
        employee.setJobTitle(dto.getJobTitle());
        employee.setUser(user);

        Employee savedEmployee = employeeRepository.save(employee);
        return new EmployeeDTO(savedEmployee);
    }

    @Transactional
    public EmployeeDTO update(Long id, EmployeeUpdateDTO dto) {
        if (!authService.isSelfOrAdminByEmployeeId(id)) {
            throw new ForbiddenException("Acesso negado");
        }

        Employee employeeEntity = employeeRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Funcionário não encontrado")
        );

        if (dto.getName() != null) employeeEntity.getUser().setName(dto.getName());
        if (dto.getPhone() != null) employeeEntity.getUser().setPhone(dto.getPhone());
        if (dto.getJobTitle() != null) employeeEntity.setJobTitle(dto.getJobTitle());

        employeeEntity = employeeRepository.save(employeeEntity);
        return new EmployeeDTO(employeeEntity);
    }
}
