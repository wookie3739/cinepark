package cinepark.common;

public class DuplicatePhoneException extends RuntimeException {

    public DuplicatePhoneException() {
        super("이미 사용 중인 전화번호입니다.");
    }
}
