package com.beta.shoes.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.Profiles;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Automatically normalizes Railway PostgreSQL connection URLs (such as DATABASE_URL,
 * DATABASE_PRIVATE_URL, DATABASE_PUBLIC_URL, or non-JDBC SPRING_DATASOURCE_URL values
 * in the form postgresql://user:password@host:port/dbname) into standard Spring Boot
 * JDBC properties (spring.datasource.url, spring.datasource.username, spring.datasource.password).
 */
public class RailwayDatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "railwayDatabaseProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        if (environment.acceptsProfiles(Profiles.of("test"))) {
            return;
        }

        String rawUrl = firstNonBlank(
            environment.getProperty("SPRING_DATASOURCE_URL"),
            environment.getProperty("DATABASE_URL"),
            environment.getProperty("DATABASE_PRIVATE_URL"),
            environment.getProperty("DATABASE_PUBLIC_URL")
        );

        if (!StringUtils.hasText(rawUrl)) {
            return;
        }

        Map<String, Object> normalizedProps = parsePostgresUrl(rawUrl.trim(), environment);
        if (!normalizedProps.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, normalizedProps));
        }
    }

    static Map<String, Object> parsePostgresUrl(String rawUrl, ConfigurableEnvironment environment) {
        Map<String, Object> props = new HashMap<>();

        String cleanUri = rawUrl.startsWith("jdbc:") ? rawUrl.substring(5) : rawUrl;
        if (!cleanUri.startsWith("postgres://") && !cleanUri.startsWith("postgresql://")) {
            return props;
        }

        try {
            URI uri = URI.create(cleanUri);
            String host = uri.getHost();
            if (!StringUtils.hasText(host)) {
                return props;
            }

            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = StringUtils.hasText(uri.getRawPath()) ? uri.getRawPath() : "/railway";
            String query = uri.getRawQuery();

            StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                .append(host)
                .append(":")
                .append(port)
                .append(path);

            if (StringUtils.hasText(query)) {
                jdbcUrl.append("?").append(query);
            }

            props.put("spring.datasource.url", jdbcUrl.toString());

            String userInfo = uri.getRawUserInfo();
            if (StringUtils.hasText(userInfo)) {
                int colonIdx = userInfo.indexOf(':');
                String username = colonIdx >= 0 ? userInfo.substring(0, colonIdx) : userInfo;
                String password = colonIdx >= 0 ? userInfo.substring(colonIdx + 1) : "";

                if (environment == null || !StringUtils.hasText(environment.getProperty("SPRING_DATASOURCE_USERNAME"))) {
                    props.put("spring.datasource.username", URLDecoder.decode(username, StandardCharsets.UTF_8));
                }
                if (environment == null || !StringUtils.hasText(environment.getProperty("SPRING_DATASOURCE_PASSWORD"))) {
                    props.put("spring.datasource.password", URLDecoder.decode(password, StandardCharsets.UTF_8));
                }
            }
        } catch (IllegalArgumentException ignored) {
            // Fall back to standard application.yml property resolution if URI cannot be parsed
        }

        return props;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }
}
