package com.beta.shoes;

import com.beta.shoes.dto.AuthDto;
import com.beta.shoes.entity.Role;
import com.beta.shoes.entity.User;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.repository.RoleRepository;
import com.beta.shoes.repository.UserRepository;
import com.beta.shoes.security.JwtTokenProvider;
import com.beta.shoes.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private Role customerRole;

    @BeforeEach
    void setUp() {
        customerRole = Role.builder().id(1L).name("ROLE_CUSTOMER").build();
    }

    @Test
    void register_Success() {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
            .email("parent@example.com")
            .password("SecurePass123")
            .firstName("Arun")
            .lastName("Kumar")
            .phone("+91 98450 11111")
            .build();

        when(userRepository.existsByEmailIgnoreCase("parent@example.com")).thenReturn(false);
        when(roleRepository.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode("SecurePass123")).thenReturn("hashedPassword");

        User savedUser = User.builder()
            .id(UUID.randomUUID())
            .email("parent@example.com")
            .passwordHash("hashedPassword")
            .firstName("Arun")
            .lastName("Kumar")
            .roles(Collections.singleton(customerRole))
            .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked.jwt.token");

        AuthDto.AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("parent@example.com", response.getEmail());
        assertEquals("mocked.jwt.token", response.getToken());
        assertTrue(response.getRoles().contains("ROLE_CUSTOMER"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsBadRequest() {
        AuthDto.RegisterRequest request = AuthDto.RegisterRequest.builder()
            .email("existing@example.com")
            .password("SecurePass123")
            .firstName("Duplicate")
            .lastName("User")
            .build();

        when(userRepository.existsByEmailIgnoreCase("existing@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }
}
