package com.emporio.pet.services;

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

    // 1. Define o caminho para a nossa pasta raiz de uploads.
    private final Path rootLocation = Paths.get("uploaded-images");

    // 2. Este método é executado assim que a aplicação inicia.
    // Ele garante que a pasta de uploads exista.
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar o diretório de upload!", e);
        }
    }

    // 3. Este é o método principal que salva o arquivo.
    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Falha ao armazenar arquivo vazio.");
        }

        try {
            // 4. Gera um nome de arquivo único para evitar colisões.
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // 5. Salva o arquivo no nosso diretório (ex: uploaded-images/arquivo-unico.jpg).
            Path destinationFile = this.rootLocation.resolve(Paths.get(uniqueFilename)).normalize().toAbsolutePath();
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            // 6. Retorna o caminho PÚBLICO que será salvo no banco de dados.
            return "/images/" + uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao armazenar o arquivo.", e);
        }
    }
}