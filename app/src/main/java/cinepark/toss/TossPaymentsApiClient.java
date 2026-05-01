package cinepark.toss;

import cinepark.common.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class TossPaymentsApiClient {

    private static final ObjectMapper OM = new ObjectMapper();

    private final RestClient tossPaymentsRestClient;
    private final TossPaymentsProperties tossPaymentsProperties;

    public TossPaymentApproved confirmPayment(String paymentKey, String orderId, long amount) {
        ensureSecretConfigured();
        String auth = authorizationHeader();
        JsonNode payment = tryConfirm(auth, paymentKey, orderId, amount);
        if (payment.has("paymentKey") && payment.has("orderId")) {
            return parsePaymentNode(payment);
        }
        String code = payment.path("code").asText("");
        if (looksLikeApprovedRetry(code)) {
            log.info("toss confirm retriable-ish code={}, trying GET /v1/payments", code);
            return getPaymentApproved(auth, paymentKey);
        }
        throw BusinessException.of(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                payment.path("message").asText("결제 확인에 실패했습니다."),
                code.isBlank() ? "TOSS_REJECT" : code);
    }

    public void cancelPaymentQuietly(String paymentKey, String reason) {
        if (paymentKey == null || paymentKey.isBlank()) {
            return;
        }
        if (tossPaymentsProperties.getSecretKey() == null
                || tossPaymentsProperties.getSecretKey().isBlank()) {
            return;
        }
        try {
            tossPaymentsRestClient
                    .post()
                    .uri("/v1/payments/{paymentKey}/cancel", paymentKey)
                    .header(HttpHeaders.AUTHORIZATION, authorizationHeader())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("cancelReason", reason.length() > 190 ? reason.substring(0, 190) : reason))
                    .retrieve()
                    .toBodilessEntity();
            log.info("toss payments cancel completed paymentKey={}", paymentKey);
        } catch (Exception e) {
            log.warn("toss payments cancel failed paymentKey={}", paymentKey, e);
        }
    }

    private JsonNode tryConfirm(String auth, String paymentKey, String orderId, long amount) {
        try {
            String body =
                    tossPaymentsRestClient
                            .post()
                            .uri("/v1/payments/confirm")
                            .header(HttpHeaders.AUTHORIZATION, auth)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Map.of("paymentKey", paymentKey, "orderId", orderId, "amount", amount))
                            .retrieve()
                            .body(String.class);
            return parseJson(body);
        } catch (HttpClientErrorException ex) {
            String raw = ex.getResponseBodyAsString(StandardCharsets.UTF_8);
            return parseJson(raw);
        }
    }

    private TossPaymentApproved getPaymentApproved(String auth, String paymentKey) {
        String body =
                tossPaymentsRestClient
                        .get()
                        .uri("/v1/payments/{paymentKey}", paymentKey)
                        .header(HttpHeaders.AUTHORIZATION, auth)
                        .retrieve()
                        .body(String.class);
        JsonNode payment = parseJson(body);
        return parsePaymentNode(payment);
    }

    private static JsonNode parseJson(String body) {
        try {
            return OM.readTree(body == null || body.isBlank() ? "{}" : body);
        } catch (Exception e) {
            throw BusinessException.badRequest("PG 응답 파싱 실패.");
        }
    }

    private static boolean looksLikeApprovedRetry(String code) {
        if (code == null || code.isBlank()) {
            return false;
        }
        String c = code.toUpperCase();
        return c.contains("ALREADY") || c.contains("DONE") || c.contains("EXIST");
    }

    private TossPaymentApproved parsePaymentNode(JsonNode payment) {
        String pk = payment.path("paymentKey").asText(null);
        String oid = payment.path("orderId").asText(null);
        if (pk == null || oid == null || oid.isBlank()) {
            throw BusinessException.badRequest("토스 결제 응답 형식이 올바르지 않습니다.");
        }
        if (!payment.has("totalAmount") || payment.get("totalAmount").isNull()) {
            throw BusinessException.badRequest("토스 결제 금액 정보가 없습니다.");
        }
        long amt = payment.get("totalAmount").asLong();
        String receiptUrl =
                payment.path("receipt").isMissingNode() ? null : payment.path("receipt").path("url").asText(null);
        return new TossPaymentApproved(pk, oid, amt, receiptUrl);
    }

    private String authorizationHeader() {
        byte[] encoded =
                java.util.Base64.getEncoder().encode((tossPaymentsProperties.getSecretKey().trim() + ":")
                        .getBytes(StandardCharsets.UTF_8));
        return "Basic " + new String(encoded, StandardCharsets.UTF_8);
    }

    private void ensureSecretConfigured() {
        if (tossPaymentsProperties.getSecretKey() == null || tossPaymentsProperties.getSecretKey().isBlank()) {
            throw BusinessException.of(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "PG 시크릿 키가 설정되지 않았습니다.(cinepark.tosspayments.secret-key 또는 TOSSPAYMENTS_SECRET_KEY)",
                    "TOSS_SECRET_MISSING");
        }
    }
}
