package com.beta.shoes.service;

import com.beta.shoes.entity.Role;
import com.beta.shoes.entity.User;
import com.beta.shoes.repository.RoleRepository;
import com.beta.shoes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-email:admin@betashoes.example.com}")
    private String adminEmail;

    @Value("${app.bootstrap.admin-password:Admin@Beta2026}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (!StringUtils.hasText(adminEmail) || !StringUtils.hasText(adminPassword)) {
            log.info("Admin bootstrap skipped: email or password not configured.");
            return;
        }

        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            log.info("Admin user already provisioned: {}", adminEmail);
            return;
        }

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
            .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
            .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CUSTOMER").build()));

        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        roles.add(customerRole);

        User adminUser = User.builder()
            .email(adminEmail.trim().toLowerCase())
            .passwordHash(passwordEncoder.encode(adminPassword))
            .firstName("Apex")
            .lastName("Administrator")
            .phone("+91 98450 12345")
            .enabled(true)
            .roles(roles)
            .build();

        userRepository.save(adminUser);
        log.info("Successfully provisioned initial bootstrap admin: {}", adminEmail);
    }
}
