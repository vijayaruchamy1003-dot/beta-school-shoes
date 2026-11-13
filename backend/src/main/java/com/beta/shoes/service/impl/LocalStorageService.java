package com.beta.shoes.service.impl;

import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.service.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class LocalStorageService implements StorageService {

    private final Path rootLocation;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        ".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif", ".gif", ".jfif", ".bmp"
    );

    public LocalStorageService(@Value("${storage.local.upload-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Initialized file upload directory at: {}", rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex > 0) {
            extension = originalFilename.substring(extIndex).toLowerCase();
        } else if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
            String subtype = file.getContentType().substring("image/".length()).toLowerCase();
            extension = "." + (subtype.equals("jpeg") ? "jpg" : subtype);
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
                extension = ".jpg";
            } else {
                throw new BadRequestException("Invalid file type. Allowed formats: " + ALLOWED_EXTENSIONS);
            }
        }

        String storedFilename = UUID.randomUUID().toString() + extension;
        Path destinationFile = this.rootLocation.resolve(storedFilename).normalize();

        // Path Traversal Security Check
        if (!destinationFile.getParent().equals(this.rootLocation)) {
            throw new BadRequestException("Cannot store file outside current directory.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            // Return public URL path
            return "/api/products/images/" + storedFilename;
        } catch (IOException e) {
            log.error("Failed to store file {}", originalFilename, e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public byte[] readFileIfExists(String filename) {
        if (!StringUtils.hasText(filename)) return null;
        String cleanName = filename.substring(filename.lastIndexOf('/') + 1);
        Path filePath = this.rootLocation.resolve(cleanName).normalize();
        if (!filePath.getParent().equals(this.rootLocation) || !Files.exists(filePath)) {
            return null;
        }
        try {
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.warn("Failed to read file from disk: {}", cleanName, e);
            return null;
        }
    }

    @Override
    public void deleteFile(String fileKeyOrUrl) {
        if (!StringUtils.hasText(fileKeyOrUrl)) return;
        try {
            String filename = fileKeyOrUrl.substring(fileKeyOrUrl.lastIndexOf('/') + 1);
            Path filePath = this.rootLocation.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", fileKeyOrUrl, e);
        }
    }
}
