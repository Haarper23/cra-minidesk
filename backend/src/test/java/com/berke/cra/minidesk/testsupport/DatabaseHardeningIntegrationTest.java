package com.berke.cra.minidesk.testsupport;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DatabaseHardeningIntegrationTest extends PostgresIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private Flyway flyway;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldVerifyDatasourceIsNotDevelopmentDatabase() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            String url = metaData.getURL();
            assertNotNull(url);
            assertFalse(url.contains("localhost:55432"),
                "Integration test datasource must not target localhost:55432. Found URL: " + url);
        }
    }

    @Test
    void shouldVerifyFlywaySchemaVersionIsFive() {
        assertNotNull(flyway.info().current(), "Flyway current migration info must not be null");
        assertEquals("5", flyway.info().current().getVersion().getVersion(),
            "Database schema must be fully migrated to Flyway version 5");
    }

    @Test
    void shouldVerifyTimelineEventsTableExists() {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'repair_order_timeline_events'",
            Integer.class
        );
        assertNotNull(count);
        assertEquals(1, count, "Table 'repair_order_timeline_events' must exist in database schema");
    }
}
