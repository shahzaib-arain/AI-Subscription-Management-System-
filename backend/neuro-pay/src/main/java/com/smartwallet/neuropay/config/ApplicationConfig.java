package com.smartwallet.neuropay.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync  // enables @Async on MailService so emails don't block requests
public class ApplicationConfig {
}