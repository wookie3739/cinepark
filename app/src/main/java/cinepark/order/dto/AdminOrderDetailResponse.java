package cinepark.order.dto;

import cinepark.checkout.dto.CheckoutConfirmResponse;

/** 결제 줄·발급 쿠폰 번호 포함 상세는 `order` 안에 동일 스키마(checkout 확정 스냅샷과 맞춤). */
public record AdminOrderDetailResponse(
        Long buyerUserId,
        String buyerEmail,
        String buyerName,
        CheckoutConfirmResponse order) {}
