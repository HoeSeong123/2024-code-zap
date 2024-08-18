package codezap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootApplication
public class CodeZapApplication {

    public static void main(String[] args) {
        log.info("새로운 파일을 실행합니다.");
        SpringApplication.run(CodeZapApplication.class, args);
    }

}
