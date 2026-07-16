CREATE TABLE repair_order_timeline_events (
    id BIGSERIAL PRIMARY KEY,
    repair_order_id BIGINT NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    description VARCHAR(1000) NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_repair_order_timeline_repair_order FOREIGN KEY (repair_order_id) REFERENCES repair_orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_repair_timeline_repair_order_id ON repair_order_timeline_events(repair_order_id);
CREATE INDEX idx_repair_timeline_created_at ON repair_order_timeline_events(created_at);
CREATE INDEX idx_repair_timeline_event_type ON repair_order_timeline_events(event_type);
