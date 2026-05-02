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
    private static final int LOG_BODY_MAX = 24_000;

    private final RestClient tossPaymentsRestClient;
    private final TossPaymentsProperties tossPaymentsProperties;

    public TossPaymentApproved confirmPayment(String paymentKey, String orderId, long amount) {
        ensureSecretConfigured();
        String auth = authorizationHeader();
        log.info(
                "toss payments confirm request paymentKey={} orderId={} amount={}",
                paymentKey,
                orderId,
                amount);
        JsonNode payment = tryConfirm(auth, paymentKey, orderId, amount);
        if (payment.has("paymentKey") && payment.has("orderId")) {
            logTossPaymentPayload("POST /v1/payments/confirm (승인 응답)", payment);
            return parsePaymentNode(payment);
        }
        String code = payment.path("code").asText("");
        if (looksLikeApprovedRetry(code)) {
            log.info("toss confirm retriable-ish code={}, trying GET /v1/payments/{}", code, paymentKey);
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
            if (log.isDebugEnabled()) {
                log.debug("toss confirm HTTP 200 raw={}", truncateForLog(body));
            }
            return parseJson(body);
        } catch (HttpClientErrorException ex) {
            String raw = ex.getResponseBodyAsString(StandardCharsets.UTF_8);
            log.warn(
                    "toss confirm HTTP {} status raw={}",
                    ex.getStatusCode().value(),
                    truncateForLog(raw));
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
        if (log.isDebugEnabled()) {
            log.debug("toss GET /v1/payments/{} raw={}", paymentKey, truncateForLog(body));
        }
        JsonNode payment = parseJson(body);
        logTossPaymentPayload("GET /v1/payments/{paymentKey} (재조회)", payment);
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
        String receiptUrl = pickReceiptUrl(payment);
        TossPaymentApproved approved = new TossPaymentApproved(pk, oid, amt, receiptUrl);
        log.info(
                "toss payments parsed approved paymentKey={} orderId={} totalAmount={} receiptUrl={}",
                approved.paymentKey(),
                approved.orderId(),
                approved.totalAmount(),
                approved.receiptUrl() != null ? approved.receiptUrl() : "(null)");
        return approved;
    }

    private static String pickReceiptUrl(JsonNode payment) {
        String u = nodeTextOrNull(payment.path("receipt").path("url"));
        if (u != null) {
            return u;
        }
        u = nodeTextOrNull(payment.at("/cashReceipt/receiptUrl"));
        if (u != null) {
            return u;
        }
        return nodeTextOrNull(payment.at("/mobilePhone/receiptUrl"));
    }

    private static String nodeTextOrNull(JsonNode n) {
        if (n == null || n.isMissingNode() || n.isNull()) {
            return null;
        }
        String t = n.asText("").trim();
        return t.isEmpty() ? null : t;
    }

    /**
     * PG Payment 객체 주요 필드 요약(INFO) + 전체 JSON(DEBUG). 시크릿·Authorization 은 로그에 넣지 않습니다.
     */
    private void logTossPaymentPayload(String label, JsonNode p) {
        if (p == null || p.isMissingNode()) {
            log.info("toss payments {}: (empty node)", label);
            return;
        }
        if (p.has("code") && !p.has("paymentKey")) {
            log.info(
                    "toss payments {}: error code={} message={}",
                    label,
                    p.path("code").asText(""),
                    p.path("message").asText(""));
            if (log.isDebugEnabled()) {
                log.debug("toss payments {} error raw={}", label, nodeToJsonForLog(p));
            }
            return;
        }
        log.info(
                "toss payments {}: paymentKey={} orderId={} orderName={} status={} method={} type={} "
                        + "totalAmount={} balanceAmount={} version={} mId={} approvedAt={} requestedAt={} "
                        + "lastTransactionKey={} transactionKey={} "
                        + "receipt.url={} receipt.nodePresent={} cashReceipt.receiptUrl={} mobilePhone.receiptUrl={} "
                        + "easyPay.provider={} card.issuerCode={} card.amount={} virtualAccountAbsent={} transferAbsent={} "
                        + "failurePresent={}",
                label,
                p.path("paymentKey").asText(""),
                p.path("orderId").asText(""),
                p.path("orderName").asText(""),
                p.path("status").asText(""),
                p.path("method").asText(""),
                p.path("type").asText(""),
                p.path("totalAmount").asText(""),
                p.path("balanceAmount").asText(""),
                p.path("version").asText(""),
                p.path("mId").asText(""),
                p.path("approvedAt").asText(""),
                p.path("requestedAt").asText(""),
                p.path("lastTransactionKey").asText(""),
                p.path("transactionKey").asText(""),
                textOrDash(p.at("/receipt/url")),
                p.has("receipt") && !p.get("receipt").isNull(),
                textOrDash(p.at("/cashReceipt/receiptUrl")),
                textOrDash(p.at("/mobilePhone/receiptUrl")),
                p.path("easyPay").path("provider").asText(""),
                p.path("card").path("issuerCode").asText(""),
                p.path("card").path("amount").asText(""),
                p.at("/virtualAccount").isMissingNode() || p.at("/virtualAccount").isNull(),
                p.at("/transfer").isMissingNode() || p.at("/transfer").isNull(),
                p.has("failure") && !p.get("failure").isNull());
        if (log.isDebugEnabled()) {
            log.debug("toss payments {} full json={}", label, nodeToJsonForLog(p));
        }
    }

    private static String textOrDash(JsonNode n) {
        if (n == null || n.isMissingNode() || n.isNull()) {
            return "—";
        }
        String t = n.asText("").trim();
        return t.isEmpty() ? "—" : t;
    }

    private static String nodeToJsonForLog(JsonNode node) {
        try {
            return truncateForLog(OM.writeValueAsString(node));
        } catch (Exception e) {
            return "(json serialize failed: " + e.getMessage() + ")";
        }
    }

    private static String truncateForLog(String s) {
        if (s == null) {
            return "";
        }
        if (s.length() <= LOG_BODY_MAX) {
            return s;
        }
        return s.substring(0, LOG_BODY_MAX) + "...(truncated,len=" + s.length() + ")";
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
