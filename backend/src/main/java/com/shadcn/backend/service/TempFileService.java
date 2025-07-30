package com.shadcn.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@Slf4j
public class TempFileService {

    @Value("${app.upload.temp-dir:/storage/temp}")
    private String tempUploadDir;

    /**
     * Clean up temporary files older than specified hours
     */
    public void cleanupOldTempFiles(int hoursOld) {
        try {
            Path tempDir = Paths.get(tempUploadDir);
            if (!Files.exists(tempDir)) {
                return;
            }

            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(hoursOld);

            try (Stream<Path> files = Files.list(tempDir)) {
                List<Path> oldFiles = files
                    .filter(Files::isRegularFile)
                    .filter(path -> {
                        try {
                            LocalDateTime fileModTime = LocalDateTime.ofInstant(
                                Files.getLastModifiedTime(path).toInstant(),
                                java.time.ZoneId.systemDefault()
                            );
                            return fileModTime.isBefore(cutoffTime);
                        } catch (IOException e) {
                            log.warn("Could not get modification time for file: {}", path);
                            return false;
                        }
                    })
                    .toList();

                for (Path oldFile : oldFiles) {
                    try {
                        Files.deleteIfExists(oldFile);
                        log.info("Deleted old temp file: {}", oldFile.getFileName());
                    } catch (IOException e) {
                        log.warn("Could not delete old temp file: {}", oldFile.getFileName(), e);
                    }
                }

                if (!oldFiles.isEmpty()) {
                    log.info("Cleaned up {} old temporary files", oldFiles.size());
                }
            }
        } catch (IOException e) {
            log.error("Error during temp file cleanup", e);
        }
    }

    /**
     * Move temporary file to permanent storage
     */
    public String moveTempFileToPermanent(String tempFileName, String permanentDir) throws IOException {
        Path tempFilePath = Paths.get(tempUploadDir).resolve(tempFileName);
        
        if (!Files.exists(tempFilePath)) {
            throw new IOException("Temporary file not found: " + tempFileName);
        }

        // Create permanent directory if it doesn't exist
        Path permanentDirPath = Paths.get(permanentDir);
        if (!Files.exists(permanentDirPath)) {
            Files.createDirectories(permanentDirPath);
        }

        // Extract original filename from temp filename
        // Temp filename format: yyyyMMdd_HHmmss_uuid_originalname.ext
        String originalFileName = extractOriginalFileName(tempFileName);
        
        // Generate clean filename for permanent storage using UUID
        String uuid = UUID.randomUUID().toString();
        
        // Split original filename to get name and extension
        int lastDotIndex = originalFileName.lastIndexOf('.');
        String extension = lastDotIndex > 0 ? originalFileName.substring(lastDotIndex) : "";
        
        String permanentFileName = uuid + extension;

        // Move file to permanent location with clean filename
        Path permanentFilePath = permanentDirPath.resolve(permanentFileName);
        Files.move(tempFilePath, permanentFilePath);

        log.info("Moved temp file {} to permanent storage: {}", tempFileName, permanentFilePath);
        return permanentFileName; // Return just the filename, not the full path
    }
    
    /**
     * Extract original filename from temp filename
     * Temp filename format: yyyyMMdd_HHmmss_uuid_originalname.ext
     */
    private String extractOriginalFileName(String tempFileName) {
        // Split by underscore and take everything after the third underscore
        String[] parts = tempFileName.split("_", 4);
        if (parts.length >= 4) {
            return parts[3]; // originalname.ext
        }
        // Fallback - return the filename as is if format doesn't match
        return tempFileName;
    }

    /**
     * Check if temporary file exists
     */
    public boolean tempFileExists(String fileName) {
        Path filePath = Paths.get(tempUploadDir).resolve(fileName);
        return Files.exists(filePath) && Files.isRegularFile(filePath);
    }

    /**
     * Get temp file path
     */
    public Path getTempFilePath(String fileName) {
        return Paths.get(tempUploadDir).resolve(fileName);
    }

    /**
     * Create temp directory if it doesn't exist
     */
    public void ensureTempDirectoryExists() throws IOException {
        Path tempDir = Paths.get(tempUploadDir);
        if (!Files.exists(tempDir)) {
            Files.createDirectories(tempDir);
            log.info("Created temp directory: {}", tempDir);
        }
    }
}
