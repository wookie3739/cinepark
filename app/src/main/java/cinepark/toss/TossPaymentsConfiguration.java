package cinepark.toss;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(TossPaymentsProperties.class)
public class TossPaymentsConfiguration {

    @Bean
    RestClient tossPaymentsRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(30_000);
        return RestClient.builder()
                .baseUrl("https://api.tosspayments.com")
                .requestFactory(factory)
                .build();
    }
}
