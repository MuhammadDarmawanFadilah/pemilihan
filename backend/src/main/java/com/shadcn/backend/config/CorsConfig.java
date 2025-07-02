package com.shadcn.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Autowired
    private CorsProperties corsProperties;    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(corsProperties.getAllowedOriginsArray())
                .allowedMethods(corsProperties.getAllowedMethodsArray())
                .allowedHeaders(corsProperties.getAllowedHeadersArray())
                .allowCredentials(true);
    }    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(corsProperties.getAllowedOriginsArray()));
        configuration.setAllowedMethods(Arrays.asList(corsProperties.getAllowedMethodsArray()));
        configuration.setAllowedHeaders(Arrays.asList(corsProperties.getAllowedHeadersArray()));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
