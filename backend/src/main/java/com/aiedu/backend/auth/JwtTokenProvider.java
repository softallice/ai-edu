package com.aiedu.backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/**
 * JWT(HS256) 발급·검증기.
 *
 * <p>교육용으로 외부 JWT 라이브러리 없이 JDK 의 {@link Mac}(HMAC-SHA256)과 Base64URL 로
 * {@code header.payload.signature} 토큰을 직접 구성합니다. JWT 의 구조를 그대로 드러내는 것이
 * 목적입니다. 운영에서는 검증된 라이브러리(jjwt/Nimbus) 사용을 권장합니다.
 */
@Component
public class JwtTokenProvider {

    private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64D = Base64.getUrlDecoder();
    private static final String HMAC = "HmacSHA256";

    private final byte[] secret;
    private final long validityMillis;
    private final ObjectMapper objectMapper;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.validity-ms}") long validityMillis,
            ObjectMapper objectMapper) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.validityMillis = validityMillis;
        this.objectMapper = objectMapper;
    }

    /** 발급된 토큰과 만료 시각(epoch millis). */
    public record IssuedToken(String value, long expiresAtMillis) {
    }

    /** 토큰에서 추출한 클레임. */
    public record TokenClaims(String email, String accountNo, String name, List<String> roles, long expiresAtMillis) {
    }

    public IssuedToken issue(User user, long nowMillis) {
        long expMillis = nowMillis + validityMillis;
        String header = encode(Map.of("alg", "HS256", "typ", "JWT"));

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.getEmail());
        claims.put("accountNo", user.getAccountNo());
        claims.put("name", user.getName());
        claims.put("roles", List.copyOf(user.getRoles()));
        claims.put("iat", nowMillis / 1000);
        claims.put("exp", expMillis / 1000);
        String payload = encode(claims);

        String signingInput = header + "." + payload;
        String signature = B64.encodeToString(hmac(signingInput));
        return new IssuedToken(signingInput + "." + signature, expMillis);
    }

    @SuppressWarnings("unchecked")
    public TokenClaims parse(String token, long nowMillis) {
        if (token == null || token.isBlank()) {
            throw new InvalidTokenException("토큰이 비어 있습니다.");
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new InvalidTokenException("토큰 형식이 올바르지 않습니다.");
        }
        String signingInput = parts[0] + "." + parts[1];
        byte[] expected = hmac(signingInput);
        byte[] provided;
        try {
            provided = B64D.decode(parts[2]);
        } catch (IllegalArgumentException ex) {
            throw new InvalidTokenException("서명 디코딩에 실패했습니다.");
        }
        // 타이밍 공격 방지를 위해 상수 시간 비교
        if (!MessageDigest.isEqual(expected, provided)) {
            throw new InvalidTokenException("서명이 유효하지 않습니다.");
        }

        Map<String, Object> claims;
        try {
            claims = objectMapper.readValue(B64D.decode(parts[1]), Map.class);
        } catch (Exception ex) {
            throw new InvalidTokenException("페이로드를 해석할 수 없습니다.");
        }

        long expMillis = ((Number) claims.get("exp")).longValue() * 1000;
        if (nowMillis >= expMillis) {
            throw new InvalidTokenException("토큰이 만료되었습니다.");
        }
        List<String> roles = claims.get("roles") instanceof List<?> list
                ? list.stream().map(String::valueOf).toList()
                : List.of();
        return new TokenClaims(
                (String) claims.get("sub"),
                (String) claims.get("accountNo"),
                (String) claims.get("name"),
                roles,
                expMillis);
    }

    private String encode(Map<String, ?> map) {
        return B64.encodeToString(objectMapper.writeValueAsBytes(map));
    }

    private byte[] hmac(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC);
            mac.init(new SecretKeySpec(secret, HMAC));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new IllegalStateException("HMAC 계산 실패", ex);
        }
    }
}
