package com.smartwallet.neuropay;

import com.smartwallet.neuropay.service.PlanSeederService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class NeuroPayApplication {

	public static void main(String[] args) {
		SpringApplication.run(NeuroPayApplication.class, args);
	}

	@Bean
	CommandLineRunner seedMarketplaceCatalog(PlanSeederService planSeederService) {
		return args -> planSeederService.seedCatalogIfEmpty();
	}

}
