package com.berke.cra.minidesk.testsupport;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@Import(PostgresTestContainerConfiguration.class)
@ActiveProfiles("test")
public abstract class PostgresIntegrationTest {
}
