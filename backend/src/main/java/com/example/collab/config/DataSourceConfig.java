package com.example.collab.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/collab_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}")
    private String mysqlUrl;

    @Value("${spring.datasource.username:root}")
    private String mysqlUser;

    @Value("${spring.datasource.password:root}")
    private String mysqlPassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String mysqlDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Attempt MySQL connection first
        log.info("Attempting to connect to MySQL database at: {}", mysqlUrl);
        try {
            HikariConfig mysqlConfig = new HikariConfig();
            mysqlConfig.setJdbcUrl(mysqlUrl);
            mysqlConfig.setUsername(mysqlUser);
            mysqlConfig.setPassword(mysqlPassword);
            mysqlConfig.setDriverClassName(mysqlDriver);
            mysqlConfig.setConnectionTimeout(3000); // 3 seconds timeout
            mysqlConfig.setInitializationFailTimeout(3000);

            HikariDataSource mysqlDataSource = new HikariDataSource(mysqlConfig);
            try (Connection conn = mysqlDataSource.getConnection()) {
                log.info(">>> Successfully connected to MySQL database: {}", conn.getMetaData().getDatabaseProductName());
                return mysqlDataSource;
            }
        } catch (Exception e) {
            log.warn("Could not connect to MySQL with default credentials ({}). Switching to persistent fallback database (H2 MySQL-compatible mode)...", e.getMessage());
            log.info("Tip: You can configure your custom MySQL password in 'application.properties' or via SPRING_DATASOURCE_PASSWORD.");

            // Fallback to embedded MySQL-compatible H2 database for seamless lab running
            HikariConfig h2Config = new HikariConfig();
            h2Config.setJdbcUrl("jdbc:h2:file:./collab_db_data;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE");
            h2Config.setUsername("sa");
            h2Config.setPassword("");
            h2Config.setDriverClassName("org.h2.Driver");

            HikariDataSource h2DataSource = new HikariDataSource(h2Config);
            log.info(">>> Fallback database initialized successfully!");
            return h2DataSource;
        }
    }
}
