package com.emporio.pet.services;

import org.springframework.beans.factory.annotation.Value; // IMPORTAR
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // 1. Injeta o valor do application.properties
    @Value("${storage.location}")
    private String storageLocation;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        try {
            // 2. Usa a variável para criar o caminho
            this.rootLocation = Paths.get(storageLocation);
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar o diretório de upload!", e);
        }
    }

    /**
     * Armazena o arquivo enviado no diretório configurado e retorna o caminho público relativo.
     */
    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Falha ao armazenar arquivo vazio.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            Path destinationFile = this.rootLocation.resolve(Paths.get(uniqueFilename)).normalize().toAbsolutePath();
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/images/" + uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao armazenar o arquivo.", e);
        }
    }
}