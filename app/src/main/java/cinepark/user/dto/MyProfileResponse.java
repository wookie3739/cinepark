package cinepark.user.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MyProfileResponse {
    String email;
    String name;
    String phoneNumber;
    String role;
}
