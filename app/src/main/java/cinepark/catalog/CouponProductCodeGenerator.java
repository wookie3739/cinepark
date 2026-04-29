package cinepark.catalog;

import java.security.SecureRandom;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class CouponProductCodeGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    /** 12자리 숫자 문자열 (선행 0 허용하지 않음이 자연스러움 — 그래도 12자 고정이면 앞자리 1~9로 시작하게 할 수 있음. 설계: 숫자 12자리.) */
    public static String random12DigitString() {
        char[] d = new char[12];
        d[0] = (char) ('1' + RANDOM.nextInt(9));
        for (int i = 1; i < 12; i++) {
            d[i] = (char) ('0' + RANDOM.nextInt(10));
        }
        return new String(d);
    }
}
