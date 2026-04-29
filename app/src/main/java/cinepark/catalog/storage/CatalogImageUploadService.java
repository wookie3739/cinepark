package cinepark.catalog.storage;

import cinepark.catalog.dto.CatalogImagePresignRequest;
import cinepark.catalog.dto.CatalogImagePresignResponse;
import cinepark.common.BusinessException;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Slf4j
@Component
public class CatalogImageUploadService {

    private static final int SIGN_MINUTES = 15;
    private static final DateTimeFormatter DAY = DateTimeFormatter.BASIC_ISO_DATE;

    /** 브라우저에서 PUT 시그니처와 일치시키기 위한 MIME 제한 */
    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final S3Presigner presignerOrNull;
    private final String bucket;

    public CatalogImageUploadService(
            @Value("${cinepark.aws.s3.bucket:}") String bucketProp,
            @Value("${cinepark.aws.region:ap-northeast-2}") String region,
            @Value("${cinepark.aws.access-key:}") String accessKey,
            @Value("${cinepark.aws.secret-key:}") String secretKey) {
        this.bucket = bucketProp == null ? "" : bucketProp.trim();
        if (!StringUtils.hasText(this.bucket)) {
            this.presignerOrNull = null;
            log.info("S3 버킷 미설정 — 업로드 presign 비활성");
            return;
        }
        S3Presigner.Builder b = S3Presigner.builder().region(Region.of(region));
        if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
            b.credentialsProvider(
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)));
        } else {
            b.credentialsProvider(DefaultCredentialsProvider.create());
        }
        this.presignerOrNull = b.build();
    }

    public CatalogImagePresignResponse presignPut(CatalogImagePresignRequest req) {
        if (presignerOrNull == null) {
            throw BusinessException.badRequest("이미지 업로드는 S3 버킷(cinepark.aws.s3.bucket) 설정 후 사용할 수 있습니다.");
        }
        String ct = req.getContentType().trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(ct)) {
            throw BusinessException.badRequest("지원 이미지 형식: JPEG, PNG, WebP, GIF");
        }
        String key = buildObjectKey(req.getFileName());
        PutObjectRequest put =
                PutObjectRequest.builder().bucket(bucket).key(key).contentType(ct).build();
        PutObjectPresignRequest presign =
                PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(SIGN_MINUTES))
                        .putObjectRequest(put)
                        .build();
        var signed = presignerOrNull.presignPutObject(presign);
        return CatalogImagePresignResponse.builder()
                .uploadUrl(signed.url().toString())
                .objectKey(key)
                .expiresInMinutes(SIGN_MINUTES)
                .build();
    }

    private static String buildObjectKey(String originalName) {
        String safe = sanitizeFileName(originalName);
        String day = LocalDate.now().format(DAY);
        return "catalog/images/" + day + "/" + UUID.randomUUID() + "_" + safe;
    }

    private static String sanitizeFileName(String name) {
        if (!StringUtils.hasText(name)) {
            return "image";
        }
        String base = Paths.get(name.trim()).getFileName().toString();
        String cleaned = base.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (cleaned.isEmpty()) {
            cleaned = "image";
        }
        return cleaned.length() > 120 ? cleaned.substring(0, 120) : cleaned;
    }
}
