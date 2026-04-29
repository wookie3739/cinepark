package cinepark.auth.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class FindIdResponse {
    /** 가입 시 입력한 로그인 ID(이메일) — 전화번호 일치 검증 후 반환 */
    String email;
}
