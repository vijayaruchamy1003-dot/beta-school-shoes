package com.beta.shoes;

import com.beta.shoes.config.RailwayDatabaseEnvironmentPostProcessor;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class RailwayDatabaseConfigTest {

    @Test
    void shouldNormalizeRailwayPostgresqlUrlWithEmbeddedCredentials() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("DATABASE_URL", "postgresql://postgres:mySecretPass123@postgres.railway.internal:5432/railway");

        RailwayDatabaseEnvironmentPostProcessor processor = new RailwayDatabaseEnvironmentPostProcessor();
        processor.postProcessEnvironment(env, new SpringApplication());

        assertEquals("jdbc:postgresql://postgres.railway.internal:5432/railway", env.getProperty("spring.datasource.url"));
        assertEquals("postgres", env.getProperty("spring.datasource.username"));
        assertEquals("mySecretPass123", env.getProperty("spring.datasource.password"));
    }

    @Test
    void shouldNormalizePostgresShortSchemeAndQueryParams() {
        MockEnvironment env = new MockEnvironment();
        env.setProperty("DATABASE_PUBLIC_URL", "postgres://dbuser:p%40ssword@roundhouse.proxy.rlwy.net:19283/railway?sslmode=require");

        RailwayDatabaseEnvironmentPostProcessor processor = new RailwayDatabaseEnvironmentPostProcessor();
        processor.postProcessEnvironment(env, new SpringApplication());

        assertEquals("jdbc:postgresql://roundhouse.proxy.rlwy.net:19283/railway?sslmode=require", env.getProperty("spring.datasource.url"));
        assertEquals("dbuser", env.getProperty("spring.datasource.username"));
        assertEquals("p@ssword", env.getProperty("spring.datasource.password"));
    }

    @Test
    void shouldSkipWhenTestProfileIsActive() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("test");
        env.setProperty("DATABASE_URL", "postgresql://postgres:secret@postgres.railway.internal:5432/railway");

        RailwayDatabaseEnvironmentPostProcessor processor = new RailwayDatabaseEnvironmentPostProcessor();
        processor.postProcessEnvironment(env, new SpringApplication());

        assertNull(env.getProperty("spring.datasource.url"));
    }
}
