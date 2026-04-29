package cinepark.catalog.storage;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * S3 키 또는 공개 URL 문자열을 받아, 클라이언트에서 쓸 노출 URL로 변환한다.
 * 설정이 없으면 Optional.empty() 로 두고 클라에서 플레이스홀더 사용.
 */
public interface CatalogImageDelivery {

    Optional<String> publicUrlForObjectKey(String keyOrNull);

    default List<String> publicUrlsForJsonArray(String jsonArrayOrNull) {
        if (jsonArrayOrNull == null || jsonArrayOrNull.isBlank()) {
            return Collections.emptyList();
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            String[] arr = om.readValue(jsonArrayOrNull, String[].class);
            return java.util.Arrays.stream(arr)
                    .map(this::publicUrlForObjectKey)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .toList();
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }
}
