package cinepark.checkout.dto;

import jakarta.validation.Valid;
import java.util.List;

/**
 * @param lines 바로구매·세션 체크아웃 등: 비어 있지 않으면 이 목록을 신뢰(서버 재검증 후)한다. null 이거나 비어 있으면 서버 장바구니만 사용.
 * @param cartRevision 낙관적 락 등 확장 예약
 */
public record CheckoutPrepareRequestBody(String cartRevision, @Valid List<CheckoutPrepareLineRequest> lines) {

    public static final CheckoutPrepareRequestBody EMPTY = new CheckoutPrepareRequestBody(null, null);
}
