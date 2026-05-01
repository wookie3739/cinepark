package cinepark.toss;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "cinepark.tosspayments")
public class TossPaymentsProperties {

    /** 비어 있으면 confirm 불가(test/local에서만 허용 권장) */
    private String secretKey = "";

    /** prepare 시 건 TTL(분). 기본 30 */
    @PositiveOrZero
    @Max(24 * 60)
    private int prepareTtlMinutes = 30;
}
