package com.beta.shoes.controller;

import com.beta.shoes.dto.ProductDto;
import com.beta.shoes.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDto.AdminProductResponse>> getAdminProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(productService.getAdminProducts(category, search, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto.AdminProductResponse> getAdminProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getAdminProductById(id));
    }

    @PostMapping
    public ResponseEntity<ProductDto.AdminProductResponse> createProduct(@Valid @RequestBody ProductDto.ProductCreateUpdateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto.AdminProductResponse> updateProduct(
        @PathVariable UUID id,
        @Valid @RequestBody ProductDto.ProductCreateUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductDto.AdminProductResponse> toggleActive(
        @PathVariable UUID id,
        @RequestParam boolean isActive
    ) {
        return ResponseEntity.ok(productService.toggleActive(id, isActive));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto.AdminProductResponse> uploadImage(
        @PathVariable UUID id,
        @RequestParam("file") MultipartFile file,
        @RequestParam(defaultValue = "true") boolean isPrimary
    ) {
        return ResponseEntity.ok(productService.uploadImage(id, file, isPrimary));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable UUID imageId) {
        productService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/sizes")
    public ResponseEntity<ProductDto.AdminProductResponse> addSize(
        @PathVariable UUID id,
        @RequestParam String ukSize,
        @RequestParam(defaultValue = "20") int initialStock
    ) {
        return ResponseEntity.ok(productService.addSize(id, ukSize, initialStock));
    }
}
