package cinepark.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

/**
 * 필터 체인(시큐리티 {@code AuthenticationEntryPoint} 등)은 MVC 예외 레지스트리를 타지 않으므로
 * JSON 본문은 여기에서 기록합니다. 컨트롤러에서는 {@link ApiExceptionHandler}로 동일 형식 응답을 맞춥니다.
 */
@Component
@RequiredArgsConstructor
public class ApiJsonErrorWriter {

    private final ObjectMapper objectMapper;

    public void write(HttpServletResponse response, HttpStatus status, String message, String errorCode)
            throws IOException {
        write(response, status.value(), message, errorCode);
    }

    public void write(HttpServletResponse response, int httpStatus, String message, String errorCode)
            throws IOException {
        response.setStatus(httpStatus);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String body = objectMapper.writeValueAsString(ApiResponse.error(message, errorCode));
        response.getWriter().write(body);
    }
}
