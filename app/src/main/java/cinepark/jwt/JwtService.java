package cinepark.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cinepark.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    public static final String CLAIM_TYPE = "typ";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";

    private final long accessExpirationMs;
    private final long refreshExpirationMs;
    private final SecretKey signingKey;

    public JwtService(
            @Value("${cinepark.jwt.secret}") String secret,
            @Value("${cinepark.jwt.access-expiration-ms}") long accessExpirationMs,
            @Value("${cinepark.jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createAccessToken(User user) {
        return buildToken(user, TYPE_ACCESS, accessExpirationMs, null);
    }

    /** 리프레시 JWT에 jti를 넣고, 동일 값을 DB에 저장해 검증·회전에 사용한다. */
    public IssuedRefreshToken issueRefreshToken(User user) {
        String jti = UUID.randomUUID().toString();
        Date now = new Date();
        Date exp = new Date(now.getTime() + refreshExpirationMs);
        String compact =
                Jwts.builder()
                        .subject(String.valueOf(user.getId()))
                        .claim("email", user.getEmail())
                        .claim("name", user.getName())
                        .claim("role", user.getRole().name())
                        .claim(CLAIM_TYPE, TYPE_REFRESH)
                        .id(jti)
                        .issuedAt(now)
                        .expiration(exp)
                        .signWith(signingKey)
                        .compact();
        return new IssuedRefreshToken(compact, jti, exp.toInstant());
    }

    private String buildToken(User user, String type, long ttlMs, String jtiOrNull) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttlMs);
        var b =
                Jwts.builder()
                        .subject(String.valueOf(user.getId()))
                        .claim("email", user.getEmail())
                        .claim("name", user.getName())
                        .claim("role", user.getRole().name())
                        .claim(CLAIM_TYPE, type)
                        .issuedAt(now)
                        .expiration(exp);
        if (jtiOrNull != null && !jtiOrNull.isEmpty()) {
            b.id(jtiOrNull);
        }
        return b.signWith(signingKey).compact();
    }

    public boolean isAccessTokenValid(String token) {
        return parse(token)
                .filter(c -> TYPE_ACCESS.equals(c.get(CLAIM_TYPE, String.class)))
                .isPresent();
    }

    public boolean isRefreshTokenValid(String token) {
        return parse(token)
                .filter(c -> TYPE_REFRESH.equals(c.get(CLAIM_TYPE, String.class)))
                .isPresent();
    }

    public Optional<Long> getUserIdFromAccessToken(String token) {
        return parse(token)
                .filter(c -> TYPE_ACCESS.equals(c.get(CLAIM_TYPE, String.class)))
                .map(Claims::getSubject)
                .map(Long::parseLong);
    }

    public Optional<String> getRoleFromAccessToken(String token) {
        return parse(token)
                .filter(c -> TYPE_ACCESS.equals(c.get(CLAIM_TYPE, String.class)))
                .map(c -> c.get("role", String.class));
    }

    public Long getUserIdFromRefreshToken(String token) {
        return parse(token)
                .filter(c -> TYPE_REFRESH.equals(c.get(CLAIM_TYPE, String.class)))
                .map(Claims::getSubject)
                .map(Long::parseLong)
                .orElse(null);
    }

    public Optional<String> getJtiFromRefreshToken(String token) {
        return parse(token)
                .filter(c -> TYPE_REFRESH.equals(c.get(CLAIM_TYPE, String.class)))
                .map(Claims::getId)
                .filter(id -> id != null && !id.isEmpty());
    }

    private Optional<Claims> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (ExpiredJwtException e) {
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
