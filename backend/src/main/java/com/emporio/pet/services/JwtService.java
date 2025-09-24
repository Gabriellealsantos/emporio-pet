package com.emporio.pet.services;

import com.emporio.pet.entities.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${security.jwt.duration}")
    private long durationInSeconds;

    private final JwtEncoder encoder;

    public JwtService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    /**
     * Gera um token JWT assinado (HS256) com claims básicos: issuer, subject, expiry,
     * scope (autoridades) e userId.
     */
    public String generateToken(Authentication authentication) {

        User principal = (User) authentication.getPrincipal();
        Long userId = principal.getId();

        Instant now = Instant.now();
        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("my-app")
                .issuedAt(now)
                .expiresAt(now.plus(durationInSeconds, ChronoUnit.SECONDS))
                .subject(authentication.getName())
                .claim("scope", scope)
                .claim("userId", userId)
                .build();

        var jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        return this.encoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }
}
