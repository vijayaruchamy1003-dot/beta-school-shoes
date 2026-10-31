package com.beta.shoes;

import com.beta.shoes.security.JwtTokenProvider;
import com.beta.shoes.security.UserDetailsImpl;
import com.beta.shoes.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminSchoolSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @DisplayName("Unauthenticated request to admin schools API must return 401/403")
    void testUnauthenticatedAccessDenied() throws Exception {
        mockMvc.perform(get("/api/admin/schools"))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin user with ROLE_ADMIN must be allowed to access admin schools API")
    void testAdminRoleAllowed() throws Exception {
        UserDetails adminDetails = userDetailsService.loadUserByUsername("admin@betashoes.example.com");
        UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken(adminDetails, null, adminDetails.getAuthorities());
        String adminToken = jwtTokenProvider.generateToken(auth);

        mockMvc.perform(get("/api/admin/schools")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk());
    }
}
