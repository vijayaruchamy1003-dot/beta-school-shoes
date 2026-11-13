package com.beta.shoes.service;

import com.beta.shoes.dto.ProductDto;
import com.beta.shoes.entity.Inventory;
import com.beta.shoes.entity.Product;
import com.beta.shoes.entity.ProductImage;
import com.beta.shoes.entity.ProductSize;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.InventoryRepository;
import com.beta.shoes.repository.ProductImageRepository;
import com.beta.shoes.repository.ProductRepository;
import com.beta.shoes.repository.ProductSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryRepository inventoryRepository;
    private final StorageService storageService;

    // --- PUBLIC ENDPOINTS (Strictly hides exact stock counts) ---

    public static String normalizeCategory(String category) {
        if (!StringUtils.hasText(category)) {
            return null;
        }
        return category.trim().toUpperCase().replaceAll("\\s+", "_");
    }

    @Transactional(readOnly = true)
    public Page<ProductDto.PublicProductResponse> getPublicProducts(
        String category, String search, String ukSize, Pageable pageable
    ) {
        String cleanCategory = StringUtils.hasText(category) && !"ALL".equalsIgnoreCase(category) ? normalizeCategory(category) : null;
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;
        String cleanSize = StringUtils.hasText(ukSize) && !"ALL".equalsIgnoreCase(ukSize) ? ukSize.trim() : null;

        Page<Product> products = productRepository.findPublicProducts(cleanCategory, cleanSearch, cleanSize, pageable);
        return products.map(this::mapToPublicResponse);
    }

    @Transactional(readOnly = true)
    public ProductDto.PublicProductResponse getPublicProductById(UUID id) {
        Product product = productRepository.findById(id)
            .filter(Product::isActive)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return mapToPublicResponse(product);
    }

    public static String formatShortId(UUID id, String sku) {
        if (id == null) return "PRD";
        String str = id.toString();
        if (str.startsWith("11111111-1111-1111-1111-1111111111")) {
            return "PRD-" + str.substring(str.length() - 3);
        }
        return "PRD-" + str.substring(0, 6).toUpperCase();
    }

    public static String resolvePublicImageUrl(String rawUrl) {
        if (!StringUtils.hasText(rawUrl)) {
            return null;
        }
        String trimmed = rawUrl.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
            return trimmed;
        }
        String filename = trimmed.substring(trimmed.lastIndexOf('/') + 1);
        String apiPath = "/api/products/images/" + filename;
        try {
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(apiPath)
                .toUriString();
        } catch (Exception ignored) {
            return apiPath;
        }
    }

    private ProductDto.PublicProductResponse mapToPublicResponse(Product product) {
        String rawPrimaryImg = product.getImages().stream()
            .filter(ProductImage::isPrimary)
            .map(ProductImage::getImageUrl)
            .findFirst()
            .orElseGet(() -> product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());

        String primaryImg = resolvePublicImageUrl(rawPrimaryImg);

        List<String> allImages = product.getImages().stream()
            .map(img -> resolvePublicImageUrl(img.getImageUrl()))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        List<ProductDto.PublicSizeResponse> sizeResponses = product.getSizes().stream()
            .map(size -> {
                boolean hasStock = false;
                if (size.getInventory() != null) {
                    hasStock = size.getInventory().getAvailableStock() > 0;
                }
                return ProductDto.PublicSizeResponse.builder()
                    .id(size.getId())
                    .ukSize(size.getUkSize())
                    .isAvailable(size.isAvailable() && hasStock)
                    .build();
            })
            .collect(Collectors.toList());

        return ProductDto.PublicProductResponse.builder()
            .id(product.getId())
            .shortId(formatShortId(product.getId(), product.getSku()))
            .sku(product.getSku())
            .name(product.getName())
            .shortDescription(product.getShortDescription())
            .category(product.getCategory())
            .basePrice(product.getBasePrice())
            .mrp(product.getMrp())
            .isBestseller(product.isBestseller())
            .isNewArrival(product.isNewArrival())
            .badgeText(product.getBadgeText())
            .primaryImageUrl(primaryImg)
            .imageUrls(allImages)
            .sizes(sizeResponses)
            .build();
    }

    // --- ADMIN ENDPOINTS (Exact inventory counts, low-stock threshold alerts, full CRUD) ---

    @Transactional(readOnly = true)
    public Page<ProductDto.AdminProductResponse> getAdminProducts(String category, String search, Pageable pageable) {
        String cleanCategory = StringUtils.hasText(category) && !"ALL".equalsIgnoreCase(category) ? normalizeCategory(category) : null;
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;

        Page<Product> products = productRepository.findAdminProducts(cleanCategory, cleanSearch, pageable);
        return products.map(this::mapToAdminResponse);
    }

    @Transactional(readOnly = true)
    public ProductDto.AdminProductResponse getAdminProductById(UUID id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return mapToAdminResponse(product);
    }

    @Transactional
    public ProductDto.AdminProductResponse createProduct(ProductDto.ProductCreateUpdateRequest request) {
        if (productRepository.findBySku(request.getSku().trim()).isPresent()) {
            throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists.");
        }

        Product product = Product.builder()
            .sku(request.getSku().trim())
            .name(request.getName().trim())
            .shortDescription(request.getShortDescription().trim())
            .category(normalizeCategory(request.getCategory()))
            .basePrice(request.getBasePrice())
            .mrp(request.getMrp())
            .isBestseller(request.getIsBestseller() != null ? request.getIsBestseller() : false)
            .isNewArrival(request.getIsNewArrival() != null ? request.getIsNewArrival() : false)
            .badgeText(StringUtils.hasText(request.getBadgeText()) ? request.getBadgeText().trim() : null)
            .isActive(request.getIsActive() != null ? request.getIsActive() : true)
            .build();

        product = productRepository.save(product);

        // Add sizes if provided (with price & count)
        if (request.getSizes() != null && !request.getSizes().isEmpty()) {
            for (ProductDto.SizeInputDto sDto : request.getSizes()) {
                if (StringUtils.hasText(sDto.getUkSize())) {
                    int count = sDto.getCount() != null ? Math.max(0, sDto.getCount()) : 20;
                    BigDecimal sizePrice = sDto.getPrice() != null ? sDto.getPrice() : request.getBasePrice();
                    createProductSize(product, sDto.getUkSize().trim(), count, sizePrice);
                }
            }
        } else if (request.getInitialSizes() != null && !request.getInitialSizes().isEmpty()) {
            for (String sizeLabel : request.getInitialSizes()) {
                if (StringUtils.hasText(sizeLabel)) {
                    createProductSize(product, sizeLabel.trim(), 20, request.getBasePrice()); // Default seed quantity 20
                }
            }
        }

        return mapToAdminResponse(product);
    }

    @Transactional
    public ProductDto.AdminProductResponse updateProduct(UUID id, ProductDto.ProductCreateUpdateRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Check SKU uniqueness if changed
        if (!product.getSku().equalsIgnoreCase(request.getSku().trim())) {
            if (productRepository.findBySku(request.getSku().trim()).isPresent()) {
                throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists.");
            }
            product.setSku(request.getSku().trim());
        }

        product.setName(request.getName().trim());
        product.setShortDescription(request.getShortDescription().trim());
        product.setCategory(normalizeCategory(request.getCategory()));
        product.setBasePrice(request.getBasePrice());
        product.setMrp(request.getMrp());
        if (request.getIsBestseller() != null) {
            product.setBestseller(request.getIsBestseller());
        }
        if (request.getIsNewArrival() != null) {
            product.setNewArrival(request.getIsNewArrival());
        }
        product.setBadgeText(StringUtils.hasText(request.getBadgeText()) ? request.getBadgeText().trim() : null);
        if (request.getIsActive() != null) {
            product.setActive(request.getIsActive());
        }

        product = productRepository.save(product);

        // Update sizes (with price & count) if provided
        if (request.getSizes() != null) {
            Map<String, ProductSize> existingSizesByNormalized = new HashMap<>();
            for (ProductSize ps : product.getSizes()) {
                String norm = ps.getUkSize().replaceAll("(?i)^UK\\s*", "").trim().toLowerCase();
                existingSizesByNormalized.put(norm, ps);
            }

            Set<ProductSize> keptSizes = new HashSet<>();
            for (ProductDto.SizeInputDto sDto : request.getSizes()) {
                if (!StringUtils.hasText(sDto.getUkSize())) continue;
                String sizeLabel = sDto.getUkSize().trim();
                String norm = sizeLabel.replaceAll("(?i)^UK\\s*", "").trim().toLowerCase();
                int count = sDto.getCount() != null ? Math.max(0, sDto.getCount()) : 0;
                BigDecimal sizePrice = sDto.getPrice() != null ? sDto.getPrice() : request.getBasePrice();

                ProductSize existing = existingSizesByNormalized.get(norm);
                if (existing != null) {
                    existing.setUkSize(sizeLabel);
                    existing.setPrice(sizePrice);
                    existing.setAvailable(true);
                    if (existing.getInventory() != null) {
                        existing.getInventory().setTotalStock(count);
                    } else {
                        Inventory inv = Inventory.builder()
                            .productSize(existing)
                            .totalStock(count)
                            .reservedStock(0)
                            .lowStockThreshold(5)
                            .build();
                        existing.setInventory(inv);
                    }
                    productSizeRepository.save(existing);
                    keptSizes.add(existing);
                } else {
                    ProductSize newSize = createProductSize(product, sizeLabel, count, sizePrice);
                    keptSizes.add(newSize);
                }
            }

            // Mark unselected sizes as unavailable
            for (ProductSize ps : product.getSizes()) {
                if (!keptSizes.contains(ps)) {
                    ps.setAvailable(false);
                    if (ps.getInventory() != null) {
                        ps.getInventory().setTotalStock(0);
                    }
                    productSizeRepository.save(ps);
                }
            }
        }

        return mapToAdminResponse(product);
    }

    @Transactional
    public ProductDto.AdminProductResponse toggleActive(UUID id, boolean isActive) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        product.setActive(isActive);
        return mapToAdminResponse(productRepository.save(product));
    }

    @Transactional
    public ProductDto.AdminProductResponse uploadImage(UUID productId, MultipartFile file, boolean isPrimary) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        String imageUrl = storageService.storeFile(file);
        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

        String base64Data = null;
        try {
            base64Data = Base64.getEncoder().encodeToString(file.getBytes());
        } catch (IOException ignored) {
        }

        if (isPrimary || product.getImages().isEmpty()) {
            // Unset current primary and shift displayOrder
            for (ProductImage existingImg : product.getImages()) {
                existingImg.setPrimary(false);
                existingImg.setDisplayOrder(existingImg.getDisplayOrder() + 1);
            }
            productImageRepository.saveAll(product.getImages());
            isPrimary = true;
        }

        ProductImage image = ProductImage.builder()
            .product(product)
            .imageUrl(imageUrl)
            .storageKey(filename)
            .contentType(StringUtils.hasText(file.getContentType()) ? file.getContentType() : "image/jpeg")
            .imageDataBase64(base64Data)
            .isPrimary(isPrimary)
            .displayOrder(isPrimary ? 0 : product.getImages().size())
            .build();

        image = productImageRepository.saveAndFlush(image);
        if (isPrimary) {
            product.getImages().add(0, image);
        } else {
            product.getImages().add(image);
        }
        productRepository.save(product);

        return mapToAdminResponse(product);
    }

    @Transactional(readOnly = true)
    public Optional<ProductImage> findImageByFilename(String filename) {
        if (!StringUtils.hasText(filename)) return Optional.empty();
        String cleanName = filename.substring(filename.lastIndexOf('/') + 1);
        return productImageRepository.findByFilename(cleanName).stream().findFirst();
    }

    @Transactional
    public void deleteImage(UUID imageId) {
        ProductImage image = productImageRepository.findById(imageId)
            .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));

        storageService.deleteFile(image.getImageUrl());
        productImageRepository.delete(image);
    }

    @Transactional
    public ProductDto.AdminProductResponse addSize(UUID productId, String ukSize, int initialStock) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (productSizeRepository.findByProductIdAndUkSize(productId, ukSize.trim()).isPresent()) {
            throw new BadRequestException("Size '" + ukSize + "' already exists for this product.");
        }

        createProductSize(product, ukSize.trim(), initialStock, product.getBasePrice());
        return mapToAdminResponse(product);
    }

    private ProductSize createProductSize(Product product, String ukSize, int initialStock, BigDecimal price) {
        ProductSize productSize = ProductSize.builder()
            .product(product)
            .ukSize(ukSize)
            .price(price)
            .isAvailable(true)
            .build();

        productSize = productSizeRepository.save(productSize);

        Inventory inventory = Inventory.builder()
            .productSize(productSize)
            .totalStock(Math.max(0, initialStock))
            .reservedStock(0)
            .lowStockThreshold(5)
            .build();

        inventory = inventoryRepository.save(inventory);
        productSize.setInventory(inventory);
        product.getSizes().add(productSize);

        return productSize;
    }

    public ProductDto.AdminProductResponse mapToAdminResponse(Product product) {
        String rawPrimaryImg = product.getImages().stream()
            .filter(ProductImage::isPrimary)
            .map(ProductImage::getImageUrl)
            .findFirst()
            .orElseGet(() -> product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());

        String primaryImg = resolvePublicImageUrl(rawPrimaryImg);

        List<ProductDto.AdminImageResponse> imgResponses = product.getImages().stream()
            .map(img -> ProductDto.AdminImageResponse.builder()
                .id(img.getId())
                .imageUrl(resolvePublicImageUrl(img.getImageUrl()))
                .storageKey(img.getStorageKey())
                .isPrimary(img.isPrimary())
                .displayOrder(img.getDisplayOrder())
                .build())
            .collect(Collectors.toList());

        int totalCombined = 0;
        List<ProductDto.AdminSizeStockResponse> sizeResponses = new ArrayList<>();

        for (ProductSize size : product.getSizes()) {
            Inventory inv = size.getInventory();
            int total = inv != null ? inv.getTotalStock() : 0;
            int reserved = inv != null ? inv.getReservedStock() : 0;
            int available = inv != null ? inv.getAvailableStock() : 0;
            int threshold = inv != null ? inv.getLowStockThreshold() : 5;
            boolean low = inv != null && inv.isLowStock();

            totalCombined += available;

            sizeResponses.add(ProductDto.AdminSizeStockResponse.builder()
                .sizeId(size.getId())
                .ukSize(size.getUkSize())
                .price(size.getPrice() != null ? size.getPrice() : product.getBasePrice())
                .isAvailable(size.isAvailable())
                .inventoryId(inv != null ? inv.getId() : null)
                .totalStock(total)
                .reservedStock(reserved)
                .availableStock(available)
                .lowStockThreshold(threshold)
                .isLowStock(low)
                .build());
        }

        return ProductDto.AdminProductResponse.builder()
            .id(product.getId())
            .shortId(formatShortId(product.getId(), product.getSku()))
            .sku(product.getSku())
            .name(product.getName())
            .shortDescription(product.getShortDescription())
            .category(product.getCategory())
            .basePrice(product.getBasePrice())
            .mrp(product.getMrp())
            .isBestseller(product.isBestseller())
            .isNewArrival(product.isNewArrival())
            .badgeText(product.getBadgeText())
            .isActive(product.isActive())
            .primaryImageUrl(primaryImg)
            .images(imgResponses)
            .sizes(sizeResponses)
            .totalCombinedStock(totalCombined)
            .createdAt(product.getCreatedAt())
            .updatedAt(product.getUpdatedAt())
            .build();
    }
}
