CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(120) NOT NULL,
    serial_number VARCHAR(120),
    device_type VARCHAR(40) NOT NULL,
    color VARCHAR(60),
    accessories VARCHAR(500),
    condition_notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_devices_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_devices_customer_id ON devices(customer_id);
CREATE INDEX idx_devices_serial_number ON devices(serial_number);
