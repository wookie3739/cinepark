package cinepark.config;

import cinepark.common.ApiJsonErrorWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

@Configuration
public class JsonSecurityErrorConfig {

    @Bean
    public AuthenticationEntryPoint jsonAuthenticationEntryPoint(ApiJsonErrorWriter apiJsonErrorWriter) {
        return (request, response, authException) ->
                apiJsonErrorWriter.write(
                        response, HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.", "UNAUTHORIZED");
    }

    @Bean
    public AccessDeniedHandler jsonAccessDeniedHandler(ApiJsonErrorWriter apiJsonErrorWriter) {
        return (request, response, accessDeniedException) ->
                apiJsonErrorWriter.write(
                        response, HttpStatus.FORBIDDEN, "접근 권한이 없습니다.", "FORBIDDEN");
    }
}
