package com.berke.cra.minidesk.repairorder.timeline;

import com.berke.cra.minidesk.repairorder.RepairOrder;
import com.berke.cra.minidesk.repairorder.RepairOrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "repair_order_timeline_events")
public class RepairOrderTimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_order_id", nullable = false)
    private RepairOrder repairOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 60)
    private RepairOrderTimelineEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 50)
    private RepairOrderStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 50)
    private RepairOrderStatus newStatus;

    @Column(name = "description", nullable = false, length = 1000)
    private String description;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Protected constructor for JPA
    protected RepairOrderTimelineEvent() {
    }

    // Public constructor for creating events
    public RepairOrderTimelineEvent(RepairOrder repairOrder,
                                    RepairOrderTimelineEventType eventType,
                                    RepairOrderStatus previousStatus,
                                    RepairOrderStatus newStatus,
                                    String description,
                                    String metadata) {
        this.repairOrder = repairOrder;
        this.eventType = eventType;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.description = description;
        this.metadata = metadata;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    // Getters
    public Long getId() {
        return id;
    }

    public RepairOrder getRepairOrder() {
        return repairOrder;
    }

    public RepairOrderTimelineEventType getEventType() {
        return eventType;
    }

    public RepairOrderStatus getPreviousStatus() {
        return previousStatus;
    }

    public RepairOrderStatus getNewStatus() {
        return newStatus;
    }

    public String getDescription() {
        return description;
    }

    public String getMetadata() {
        return metadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    // Explicitly no setters are provided to enforce immutability
}
