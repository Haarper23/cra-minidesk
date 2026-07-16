CREATE TABLE repair_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    device_id BIGINT NOT NULL,
    reported_issue VARCHAR(2000) NOT NULL,
    diagnosis_notes VARCHAR(4000),
    technician_notes VARCHAR(4000),
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(30) NOT NULL,
    estimated_cost NUMERIC(12,2),
    final_cost NUMERIC(12,2),
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_repair_orders_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE RESTRICT,
    CONSTRAINT chk_repair_orders_estimated_cost CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
    CONSTRAINT chk_repair_orders_final_cost CHECK (final_cost IS NULL OR final_cost >= 0)
);

CREATE INDEX idx_repair_orders_device_id ON repair_orders(device_id);
CREATE INDEX idx_repair_orders_status ON repair_orders(status);
CREATE INDEX idx_repair_orders_created_at ON repair_orders(created_at);
