package com.emporio.pet.factory;

import com.emporio.pet.dto.interfaces.UserCreateRequest;
import com.emporio.pet.entities.Role;
import com.emporio.pet.entities.User;
import com.emporio.pet.entities.enums.UserStatus;
import com.emporio.pet.repositories.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserFactory {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserFactory(RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Agora o método é genérico e aceita a role como parâmetro
    public User create(UserCreateRequest dto, String roleAuthority) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setBirthDate(dto.getBirthDate());
        user.setUserStatus(UserStatus.NON_BLOCKED);

        Role userRole = roleRepository.findByAuthority(roleAuthority);
        user.getRoles().add(userRole);

        return user;
    }
}
