package cinepark.jwt;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

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
        return buildToken(user, TYPE_ACCESS, accessExpirationMs);
    }

    public String createRefreshToken(User user) {
        return buildToken(user, TYPE_REFRESH, refreshExpirationMs);
    }

    private String buildToken(User user, String type, long ttlMs) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttlMs);
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .claim(CLAIM_TYPE, type)
                .issuedAt(now)
                .expiration(exp)
                .signWith(signingKey)
                .compact();
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
