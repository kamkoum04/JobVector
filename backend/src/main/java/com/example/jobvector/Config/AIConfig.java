package com.example.jobvector.Config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIConfig {

    @Bean
    public OllamaApi ollamaApi(@Value("${spring.ai.ollama.base-url:http://localhost:11434}") String baseUrl) {
        return OllamaApi.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Bean
    public OllamaChatModel ollamaChatModel(
            OllamaApi ollamaApi,
            @Value("${spring.ai.ollama.chat.options.model:llama3}") String model,
            @Value("${spring.ai.ollama.chat.options.temperature:0.1}") Double temperature
    ) {
        OllamaOptions options = OllamaOptions.builder()
                .model(model)
                .temperature(temperature)
                .build();

        return OllamaChatModel.builder()
                .ollamaApi(ollamaApi)
                .defaultOptions(options)
                .build();
    }

    @Bean
    public ChatClient chatClient(OllamaChatModel ollamaChatModel) {
        return ChatClient.builder(ollamaChatModel).build();
    }
}
