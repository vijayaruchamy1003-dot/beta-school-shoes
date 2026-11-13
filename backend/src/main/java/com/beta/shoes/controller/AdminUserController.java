package com.beta.shoes.controller;

import com.beta.shoes.dto.UserManagementDto;
import com.beta.shoes.entity.Role;
import com.beta.shoes.entity.User;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.RoleRepository;
import com.beta.shoes.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private static final List<String> STANDARD_ROLES = List.of(
        "ROLE_ADMIN",
        "ROLE_MANAGER",
        "ROLE_STAFF",
        "ROLE_CUSTOMER"
    );

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<UserManagementDto.UserResponse>> getAllUsers(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String role
    ) {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        return ResponseEntity.ok(
            users.stream()
                .filter(u -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        String fullName = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                            (u.getLastName() != null ? u.getLastName() : "")).toLowerCase();
                        boolean match = fullName.contains(q)
                            || (u.getEmail() != null && u.getEmail().toLowerCase().contains(q))
                            || (u.getPhone() != null && u.getPhone().toLowerCase().contains(q));
                        if (!match) return false;
                    }
                    if (role != null && !role.trim().isEmpty()) {
                        String normalized = normalizeRoleName(role);
                        return u.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase(normalized));
                    }
                    return true;
                })
                .map(this::mapToResponse)
                .toList()
        );
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getAvailableRoles() {
        Set<String> roles = new LinkedHashSet<>(STANDARD_ROLES);
        roleRepository.findAll().forEach(r -> roles.add(r.getName()));
        return ResponseEntity.ok(new ArrayList<>(roles));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<UserManagementDto.UserResponse> createUser(
        @Valid @RequestBody UserManagementDto.CreateUserRequest request
    ) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("A user with email " + email + " already exists.");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters long.");
        }

        Set<Role> assignedRoles = resolveRoles(request.getRoles());

        User user = User.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode(request.getPassword().trim()))
            .firstName(request.getFirstName().trim())
            .lastName(request.getLastName() != null && !request.getLastName().trim().isEmpty() ? request.getLastName().trim() : ".")
            .phone(request.getPhone() != null ? request.getPhone().trim() : null)
            .enabled(request.getEnabled() != null ? request.getEnabled() : true)
            .roles(assignedRoles)
            .build();

        User saved = userRepository.save(user);
        log.info("Admin created user: email={}, roles={}", saved.getEmail(),
            saved.getRoles().stream().map(Role::getName).toList());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<UserManagementDto.UserResponse> updateUser(
        @PathVariable UUID id,
        @Valid @RequestBody UserManagementDto.UpdateUserRequest request
    ) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        String email = request.getEmail().trim().toLowerCase();
        Optional<User> existingWithEmail = userRepository.findByEmailIgnoreCase(email);
        if (existingWithEmail.isPresent() && !existingWithEmail.get().getId().equals(id)) {
            throw new BadRequestException("Email " + email + " is already in use by another user.");
        }

        user.setEmail(email);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName() != null && !request.getLastName().trim().isEmpty() ? request.getLastName().trim() : ".");
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);

        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            if (request.getPassword().trim().length() < 6) {
                throw new BadRequestException("Password must be at least 6 characters long.");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(resolveRoles(request.getRoles()));
        }

        User saved = userRepository.save(user);
        log.info("Admin updated user: id={}, email={}", saved.getId(), saved.getEmail());
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @PatchMapping("/{id}/status")
    @Transactional
    public ResponseEntity<UserManagementDto.UserResponse> toggleUserStatus(
        @PathVariable UUID id,
        @RequestParam boolean enabled
    ) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setEnabled(enabled);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(mapToResponse(saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        userRepository.delete(user);
        log.info("Admin deleted user: id={}, email={}", id, user.getEmail());
        return ResponseEntity.noContent().build();
    }

    private Set<Role> resolveRoles(List<String> requestedRoles) {
        List<String> roleNames = (requestedRoles == null || requestedRoles.isEmpty())
            ? List.of("ROLE_STAFF")
            : requestedRoles;

        Set<Role> roles = new HashSet<>();
        for (String rawName : roleNames) {
            if (rawName == null || rawName.trim().isEmpty()) continue;
            String normalized = normalizeRoleName(rawName);
            Role role = roleRepository.findByName(normalized)
                .orElseGet(() -> roleRepository.save(Role.builder().name(normalized).build()));
            roles.add(role);
        }
        if (roles.isEmpty()) {
            Role defaultRole = roleRepository.findByName("ROLE_STAFF")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_STAFF").build()));
            roles.add(defaultRole);
        }
        return roles;
    }

    private String normalizeRoleName(String raw) {
        String upper = raw.trim().toUpperCase().replace(" ", "_");
        return upper.startsWith("ROLE_") ? upper : "ROLE_" + upper;
    }

    private UserManagementDto.UserResponse mapToResponse(User user) {
        List<String> roleNames = user.getRoles().stream()
            .map(Role::getName)
            .sorted()
            .collect(Collectors.toList());

        return UserManagementDto.UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .enabled(user.isEnabled())
            .roles(roleNames)
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
