package cinepark.user.dto;

import cinepark.user.User;
import cinepark.user.UserRole;
import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AdminMemberRowResponse {
    Long id;
    String email;
    String name;
    String phoneNumber;
    UserRole role;
    Instant createdAt;

    public static AdminMemberRowResponse from(User u) {
        return AdminMemberRowResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .name(u.getName())
                .phoneNumber(u.getPhoneNumber())
                .role(u.getRole())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
