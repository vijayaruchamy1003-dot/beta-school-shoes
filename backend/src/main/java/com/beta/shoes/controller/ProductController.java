package com.beta.shoes.controller;

import com.beta.shoes.dto.ProductDto;
import com.beta.shoes.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDto.PublicProductResponse>> getCatalogue(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String ukSize,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        return ResponseEntity.ok(productService.getPublicProducts(category, search, ukSize, pageRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto.PublicProductResponse> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getPublicProductById(id));
    }
}
