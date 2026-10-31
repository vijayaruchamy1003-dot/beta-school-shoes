package com.beta.shoes.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String storeFile(MultipartFile file);
    void deleteFile(String fileKeyOrUrl);
}
