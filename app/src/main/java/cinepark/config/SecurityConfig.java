package cinepark.config;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationEntryPoint jsonAuthenticationEntryPoint;
    private final AccessDeniedHandler jsonAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(
                        ex -> ex.authenticationEntryPoint(jsonAuthenticationEntryPoint)
                                .accessDeniedHandler(jsonAccessDeniedHandler))
                                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(HttpMethod.OPTIONS, "/**")
                                        .permitAll()
                                        .requestMatchers("/api/auth/**")
                                        .permitAll()
                                        .requestMatchers("/actuator/health", "/health", "/error")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/notices", "/api/notices/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/faqs", "/api/faqs/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/api/products/batch")
                                        .permitAll()
                                        .requestMatchers("/api/cart/**")
                                        .authenticated()
                                        .requestMatchers("/api/checkout/payments/**")
                                        .authenticated()
                                        .requestMatchers(HttpMethod.GET, "/api/my/orders", "/api/my/orders/**")
                                        .authenticated()
                                        .requestMatchers("/api/admin/**")
                                        .hasRole("ADMIN")
                                        .requestMatchers(HttpMethod.POST, "/api/my/inquiries")
                                        .authenticated()
                                        .requestMatchers(HttpMethod.GET, "/api/my/inquiries/**")
                                        .authenticated()
                                        .requestMatchers(HttpMethod.GET, "/api/me")
                                        .authenticated()
                                        .requestMatchers(HttpMethod.PATCH, "/api/me")
                                        .authenticated()
                                        .anyRequest()
                                        .permitAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
