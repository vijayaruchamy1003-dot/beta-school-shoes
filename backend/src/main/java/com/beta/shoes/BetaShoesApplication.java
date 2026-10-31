package com.beta.shoes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BetaShoesApplication {

    public static void main(String[] args) {
        SpringApplication.run(BetaShoesApplication.class, args);
    }
}
