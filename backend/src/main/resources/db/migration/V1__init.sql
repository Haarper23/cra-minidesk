CREATE TABLE app_metadata (
    id BIGSERIAL PRIMARY KEY,
    app_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO app_metadata (app_name, version)
VALUES ('CRA MiniDesk', '0.1.0');
