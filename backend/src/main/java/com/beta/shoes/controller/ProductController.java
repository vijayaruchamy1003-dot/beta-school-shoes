package com.beta.shoes.controller;

import com.beta.shoes.dto.ProductDto;
import com.beta.shoes.entity.ProductImage;
import com.beta.shoes.service.ProductService;
import com.beta.shoes.service.impl.LocalStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final LocalStorageService localStorageService;

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

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable String filename) {
        MediaType mediaType = guessMediaType(filename);

        // 1. Check PostgreSQL database first (always persistent across deployments)
        Optional<ProductImage> dbImg = productService.findImageByFilename(filename);
        if (dbImg.isPresent() && StringUtils.hasText(dbImg.get().getImageDataBase64())) {
            if (StringUtils.hasText(dbImg.get().getContentType())) {
                try {
                    mediaType = MediaType.parseMediaType(dbImg.get().getContentType());
                } catch (Exception ignored) {
                }
            }
            byte[] bytes = Base64.getDecoder().decode(dbImg.get().getImageDataBase64());
            return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic())
                .body(bytes);
        }

        // 2. Fallback to local disk storage (/app/uploads)
        byte[] diskBytes = localStorageService.readFileIfExists(filename);
        if (diskBytes != null) {
            return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic())
                .body(diskBytes);
        }

        return ResponseEntity.notFound().build();
    }

    private static MediaType guessMediaType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        if (lower.endsWith(".svg")) return MediaType.parseMediaType("image/svg+xml");
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if (lower.endsWith(".avif")) return MediaType.parseMediaType("image/avif");
        return MediaType.IMAGE_JPEG;
    }
}
