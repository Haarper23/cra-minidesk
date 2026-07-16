package com.berke.cra.minidesk.repairorder;

public enum RepairOrderStatus {
    RECEIVED,
    DIAGNOSING,
    WAITING_FOR_CUSTOMER_APPROVAL,
    APPROVED,
    IN_REPAIR,
    WAITING_FOR_PART,
    COMPLETED,
    READY_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
