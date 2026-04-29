package cinepark.user.dto;

import cinepark.user.User;
import cinepark.user.UserRole;
import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AdminMemberDetailResponse {
    Long id;
    String email;
    String name;
    String phoneNumber;
    UserRole role;
    boolean agreeTerms;
    boolean agreePrivacy;
    boolean agreeMarketing;
    Instant createdAt;

    public static AdminMemberDetailResponse from(User u) {
        return AdminMemberDetailResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .name(u.getName())
                .phoneNumber(u.getPhoneNumber())
                .role(u.getRole())
                .agreeTerms(u.isAgreeTerms())
                .agreePrivacy(u.isAgreePrivacy())
                .agreeMarketing(u.isAgreeMarketing())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
