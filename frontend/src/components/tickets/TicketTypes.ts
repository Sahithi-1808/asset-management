export type TicketStatus =
    | "OPEN"
    | "ACKNOWLEDGED"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED"
    | "CANCELLED";

export type TicketIssueType =
    | "NOT_WORKING"
    | "HARDWARE_DAMAGE"
    | "SOFTWARE_ISSUE"
    | "PERFORMANCE_ISSUE"
    | "CONNECTIVITY_ISSUE"
    | "ACCESSORY_ISSUE"
    | "OTHER";

export type TicketPriority =
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "URGENT";

export type Ticket = {
    id: string;

    assetId: string;

    employeeUsername: string;

    issueType: TicketIssueType;

    description: string;

    priority: TicketPriority;

    status: TicketStatus;

    adminNote: string | null;

    createdAt: string;

    updatedAt: string;
};