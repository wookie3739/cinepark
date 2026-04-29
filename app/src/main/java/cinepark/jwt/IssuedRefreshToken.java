package cinepark.jwt;

import java.time.Instant;

/** 리프레시 토큰 원문, DB에 저장할 jti 및 만료 시각 */
public record IssuedRefreshToken(String rawToken, String jti, Instant expiresAt) {}
