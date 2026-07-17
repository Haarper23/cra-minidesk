package com.berke.cra.minidesk.customer;

import com.berke.cra.minidesk.testsupport.PostgresTestContainerConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@Import(PostgresTestContainerConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class CustomerSpecificationsIntegrationTest {

    @Autowired
    private CustomerRepository customerRepository;

    @BeforeEach
    void setUp() {
        customerRepository.deleteAllInBatch();

        customerRepository.save(new Customer("John Doe", "john.doe@example.com", "111222", "Notes A"));
        customerRepository.save(new Customer("Alice Smith", "alice@example.com", "333444", "Notes B"));
        customerRepository.save(new Customer("Percent % Customer", "percent@example.com", "555666", "Notes C"));
        customerRepository.save(new Customer("Under_score Customer", "under@example.com", "777888", "Notes D"));
        customerRepository.save(new Customer("Back\\slash Customer", "backslash@example.com", "999000", "Notes E"));
    }

    @Test
    void shouldFindCustomerByCaseInsensitivePartialName() {
        Page<Customer> result = customerRepository.findAll(
                CustomerSpecifications.hasText("lIcE"),
                PageRequest.of(0, 10)
        );
        assertEquals(1, result.getTotalElements());
        assertEquals("Alice Smith", result.getContent().get(0).getFullName());
    }

    @Test
    void shouldFindCustomerByCaseInsensitivePartialEmail() {
        Page<Customer> result = customerRepository.findAll(
                CustomerSpecifications.hasText("JOHN.DOE@"),
                PageRequest.of(0, 10)
        );
        assertEquals(1, result.getTotalElements());
        assertEquals("John Doe", result.getContent().get(0).getFullName());
    }

    @Test
    void shouldFindCustomerByPartialPhoneNumber() {
        Page<Customer> result = customerRepository.findAll(
                CustomerSpecifications.hasText("333"),
                PageRequest.of(0, 10)
        );
        assertEquals(1, result.getTotalElements());
        assertEquals("Alice Smith", result.getContent().get(0).getFullName());
    }

    @Test
    void shouldReturnAllWhenQueryIsBlankOrNull() {
        Page<Customer> resultNull = customerRepository.findAll(
                CustomerSpecifications.hasText(null),
                PageRequest.of(0, 10)
        );
        assertEquals(5, resultNull.getTotalElements());

        Page<Customer> resultBlank = customerRepository.findAll(
                CustomerSpecifications.hasText("   "),
                PageRequest.of(0, 10)
        );
        assertEquals(5, resultBlank.getTotalElements());
    }

    @Test
    void shouldMatchLiteralPercentWithoutActingAsWildcard() {
        Page<Customer> result = customerRepository.findAll(
                CustomerSpecifications.hasText("%"),
                PageRequest.of(0, 10)
        );
        assertEquals(1, result.getTotalElements());
        assertEquals("Percent % Customer", result.getContent().get(0).getFullName());
    }

    @Test
    void shouldMatchLiteralUnderscoreWithoutActingAsWildcard() {
        Page<Customer> result = customerRepository.findAll(
                CustomerSpecifications.hasText("_"),
                PageRequest.of(0, 10)
        );
        assertEquals(1, result.getTotalElements());
        assertEquals("Under_score Customer", result.getContent().get(0).getFullName());
    }

    @Test
    void shouldMatchLiteralBackslashCorrectly() {
        Page<Customer> result = customerRepository.findAll(
                CustomerSpecifications.hasText("\\"),
                PageRequest.of(0, 10)
        );
        assertEquals(1, result.getTotalElements());
        assertEquals("Back\\slash Customer", result.getContent().get(0).getFullName());
    }

    @Test
    void shouldPagingAndSortingExecuteCorrectly() {
        Page<Customer> result = customerRepository.findAll(
                CustomerSpecifications.hasText(null),
                PageRequest.of(0, 3, Sort.by(Sort.Direction.ASC, "fullName"))
        );
        assertEquals(5, result.getTotalElements());
        assertEquals(3, result.getContent().size());
        assertEquals("Alice Smith", result.getContent().get(0).getFullName());
        assertEquals("Back\\slash Customer", result.getContent().get(1).getFullName());
        assertEquals("John Doe", result.getContent().get(2).getFullName());
    }
}
