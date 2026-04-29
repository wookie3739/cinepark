package cinepark.catalog.storage;

import java.time.Duration;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Component
@Slf4j
public class CatalogImageDeliveryS3 implements CatalogImageDelivery {

    private final S3Presigner presigner;
    private final String bucket;

    public CatalogImageDeliveryS3(
            @Value("${cinepark.aws.s3.bucket:}") String bucketProp,
            @Value("${cinepark.aws.region:ap-northeast-2}") String region,
            @Value("${cinepark.aws.access-key:}") String accessKey,
            @Value("${cinepark.aws.secret-key:}") String secretKey) {
        this.bucket = bucketProp == null ? "" : bucketProp.trim();
        if (!StringUtils.hasText(this.bucket)) {
            this.presigner = null;
            log.info("S3 버킷 미설정 — CatalogImageDelivery 빈 노출 URL");
            return;
        }
        S3Presigner.Builder b =
                S3Presigner.builder().region(Region.of(region));
        if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
            b.credentialsProvider(
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)));
        } else {
            b.credentialsProvider(DefaultCredentialsProvider.create());
        }
        this.presigner = b.build();
    }

    @Override
    public Optional<String> publicUrlForObjectKey(String keyOrNull) {
        if (!StringUtils.hasText(keyOrNull)) {
            return Optional.empty();
        }
        String key = keyOrNull.trim();
        if (key.startsWith("http://") || key.startsWith("https://")) {
            return Optional.of(key);
        }
        if (presigner == null) {
            return Optional.empty();
        }
        try {
            GetObjectRequest get =
                    GetObjectRequest.builder().bucket(bucket).key(key).build();
            var presigned =
                    presigner.presignGetObject(
                            r -> r.signatureDuration(Duration.ofHours(1)).getObjectRequest(get));
            return Optional.of(presigned.url().toString());
        } catch (Exception e) {
            log.debug("S3 presign 실패 key={}: {}", key, e.getMessage());
            return Optional.empty();
        }
    }
}
