"use client";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import { useRouter } from "next/navigation";

import type {
    Ticket,
    TicketStatus
} from "@/components/tickets/TicketTypes";

type Asset = {
    id: string;
    assetTag: string;
    name: string;
    category: string;
    manufacturer: string;
    model: string;
    status: string;
    assignedTo: string | null;
};

const API =
    "http://localhost:8084/api/v1";

const statuses: TicketStatus[] = [
    "OPEN",
    "ACKNOWLEDGED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "CANCELLED"
];

export default function AdminTicketsPage() {

    const router = useRouter();

    const [tickets, setTickets] =
        useState<Ticket[]>([]);

    const [assets, setAssets] =
        useState<Asset[]>([]);

    const [error, setError] =
        useState("");

    const [savingTicketId, setSavingTicketId] =
        useState<string | null>(null);

    const [successTicketId, setSuccessTicketId] =
        useState<string | null>(null);

    const [draftStatuses, setDraftStatuses] =
        useState<Record<string, TicketStatus>>({});

    const [draftNotes, setDraftNotes] =
        useState<Record<string, string>>({});

    async function load() {

        try {

            setError("");

            const authHeaders = getAuthHeaders();

            const [
                ticketsResponse,
                assetsResponse
            ] = await Promise.all([
                fetch(`${API}/tickets`, {
                    headers: authHeaders,
                }),
                fetch(`${API}/assets`, {
                    headers: authHeaders,
                })
            ]);

            if (!ticketsResponse.ok) {

                setError(
                    "Unable to load tickets."
                );

                return;
            }

            if (!assetsResponse.ok) {

                setError(
                    "Unable to load asset information."
                );

                return;
            }

            const ticketData =
                await ticketsResponse.json();

            const assetData =
                await assetsResponse.json();

            setTickets(ticketData);
            setAssets(assetData);

        } catch {

            setError(
                "Unable to connect to the Asset Management server."
            );
        }
    }

    useEffect(() => {

        load();

    }, []);

    const ticketSummary =
        useMemo(() => {

            return {
                total: tickets.length,

                open: tickets.filter(
                    (ticket) =>
                        ticket.status === "OPEN"
                ).length,

                inProgress: tickets.filter(
                    (ticket) =>
                        ticket.status === "IN_PROGRESS"
                ).length,

                resolved: tickets.filter(
                    (ticket) =>
                        ticket.status === "RESOLVED"
                ).length
            };

        }, [tickets]);

    function getAsset(
        assetId: string
    ) {

        return assets.find(
            (asset) =>
                asset.id === assetId
        );
    }

    function getCurrentStatus(
        ticket: Ticket
    ): TicketStatus {

        return (
            draftStatuses[ticket.id] ??
            ticket.status
        );
    }

    function getCurrentNote(
        ticket: Ticket
    ): string {

        return (
            draftNotes[ticket.id] ??
            ticket.adminNote ??
            ""
        );
    }

    function hasUnsavedChanges(
        ticket: Ticket
    ): boolean {

        const currentStatus =
            draftStatuses[ticket.id] ??
            ticket.status;

        const currentNote =
            draftNotes[ticket.id] ??
            ticket.adminNote ??
            "";

        return (
            currentStatus !== ticket.status ||
            currentNote !== (ticket.adminNote ?? "")
        );
    }

    function changeStatus(
        ticketId: string,
        status: TicketStatus
    ) {

        setSuccessTicketId(null);

        setDraftStatuses(
            (current) => ({
                ...current,
                [ticketId]: status
            })
        );
    }

    function changeNote(
        ticketId: string,
        note: string
    ) {

        setSuccessTicketId(null);

        setDraftNotes(
            (current) => ({
                ...current,
                [ticketId]: note
            })
        );
    }

    function cancelChanges(
        ticket: Ticket
    ) {

        setDraftStatuses(
            (current) => {

                const next = {
                    ...current
                };

                delete next[ticket.id];

                return next;
            }
        );

        setDraftNotes(
            (current) => {

                const next = {
                    ...current
                };

                delete next[ticket.id];

                return next;
            }
        );

        setSuccessTicketId(null);
        setError("");
    }

    function getAuthHeaders(): HeadersInit {
        if (typeof window === "undefined") {
            return {};
        }

        const jwtToken = window.sessionStorage.getItem("token");

        if (!jwtToken) {
            return {};
        }

        return {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        };
    }

    async function saveChanges(
        ticket: Ticket
    ) {

        try {

            setError("");
            setSuccessTicketId(null);
            setSavingTicketId(ticket.id);

            const status =
                getCurrentStatus(ticket);

            const adminNote =
                getCurrentNote(ticket);

            const response =
                await fetch(
                    `${API}/tickets/${ticket.id}`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            status,
                            adminNote
                        })
                    }
                );

            if (!response.ok) {

                setError(
                    "Unable to update the ticket."
                );

                return;
            }

            const updatedTicket =
                await response.json();

            setTickets(
                (currentTickets) =>
                    currentTickets.map(
                        (currentTicket) =>
                            currentTicket.id ===
                            updatedTicket.id
                                ? updatedTicket
                                : currentTicket
                    )
            );

            setDraftStatuses(
                (current) => {

                    const next = {
                        ...current
                    };

                    delete next[ticket.id];

                    return next;
                }
            );

            setDraftNotes(
                (current) => {

                    const next = {
                        ...current
                    };

                    delete next[ticket.id];

                    return next;
                }
            );

            setSuccessTicketId(
                ticket.id
            );

        } catch {

            setError(
                "Unable to connect to the Asset Management server."
            );

        } finally {

            setSavingTicketId(null);
        }
    }

    function getStatusStyle(
        status: TicketStatus
    ) {

        switch (status) {

            case "OPEN":
                return "border-sky-400/30 bg-sky-400/10 text-sky-300";

            case "ACKNOWLEDGED":
                return "border-violet-400/30 bg-violet-400/10 text-violet-300";

            case "IN_PROGRESS":
                return "border-amber-400/30 bg-amber-400/10 text-amber-300";

            case "RESOLVED":
                return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";

            case "CLOSED":
                return "border-slate-400/30 bg-slate-400/10 text-slate-300";

            case "CANCELLED":
                return "border-rose-400/30 bg-rose-400/10 text-rose-300";

            default:
                return "border-slate-400/20 bg-slate-400/10 text-slate-300";
        }
    }

    function getPriorityStyle(
        priority: string
    ) {

        switch (priority) {

            case "LOW":
                return "border-slate-400/20 bg-slate-400/10 text-slate-300";

            case "MEDIUM":
                return "border-sky-400/20 bg-sky-400/10 text-sky-300";

            case "HIGH":
                return "border-orange-400/20 bg-orange-400/10 text-orange-300";

            case "URGENT":
                return "border-rose-400/20 bg-rose-400/10 text-rose-300";

            default:
                return "border-slate-400/20 bg-slate-400/10 text-slate-300";
        }
    }

    return (
        <main className="min-h-screen bg-[#eef2f6] px-5 py-7 sm:px-8 lg:px-10">

            <div className="mx-auto max-w-[1450px]">

                {/* SUPPORT CENTER HEADER */}

                <div className="mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-[#172033] shadow-[0_20px_50px_rgba(15,23,42,0.15)]">

                    <div className="relative px-6 py-7 sm:px-8">

                        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex items-start gap-4">

                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-7 w-7"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 014 11.5a8.5 8.5 0 018.5-8.5 8.5 8.5 0 018.5 8.5z"
                                        />
                                    </svg>

                                </div>

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                                            Support Center
                                        </span>

                                    </div>

                                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                                        Ticket Queue
                                    </h1>

                                    <p className="mt-1 max-w-2xl text-sm text-slate-400">
                                        Review, prioritize, and resolve employee asset support requests.
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/dashboard")
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-200"
                            >
                                <span className="text-base">
                                    ←
                                </span>

                                Dashboard
                            </button>

                        </div>

                    </div>

                    {/* QUEUE COUNTERS */}

                    <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">

                        <QueueStat
                            label="Total"
                            value={ticketSummary.total}
                            color="slate"
                        />

                        <QueueStat
                            label="Open"
                            value={ticketSummary.open}
                            color="blue"
                        />

                        <QueueStat
                            label="In Progress"
                            value={ticketSummary.inProgress}
                            color="amber"
                        />

                        <QueueStat
                            label="Resolved"
                            value={ticketSummary.resolved}
                            color="green"
                        />

                    </div>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100">
                                !
                            </span>

                            {error}
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}

                {tickets.length === 0 && !error && (
                    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-7 w-7"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 014 11.5a8.5 8.5 0 018.5-8.5 8.5 8.5 0 018.5 8.5z"
                                />
                            </svg>

                        </div>

                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            Queue is clear
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Employee asset support requests will appear here.
                        </p>

                    </div>
                )}

                {/* TICKET QUEUE */}

                <div className="space-y-6">

                    {tickets.map(
                        (ticket) => {

                            const asset =
                                getAsset(
                                    ticket.assetId
                                );

                            const currentStatus =
                                getCurrentStatus(
                                    ticket
                                );

                            const currentNote =
                                getCurrentNote(
                                    ticket
                                );

                            const changed =
                                hasUnsavedChanges(
                                    ticket
                                );

                            const saving =
                                savingTicketId ===
                                ticket.id;

                            return (
                                <article
                                    key={ticket.id}
                                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
                                >

                                    {/* TICKET TOP BAR */}

                                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">

                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                            <div className="flex items-start gap-4">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
                                                    #
                                                </div>

                                                <div>

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h2 className="text-lg font-bold text-slate-900">
                                                            {ticket.issueType.replaceAll(
                                                                "_",
                                                                " "
                                                            )}
                                                        </h2>

                                                        <span
                                                            className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(
                                                                ticket.priority
                                                            )}`}
                                                        >
                                                            {ticket.priority}
                                                        </span>

                                                    </div>

                                                    <p className="mt-1 text-sm text-slate-500">

                                                        Reported by{" "}

                                                        <span className="font-semibold text-slate-700">
                                                            {ticket.employeeUsername}
                                                        </span>

                                                    </p>

                                                </div>

                                            </div>

                                            <div className="flex items-center gap-3">

                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Status
                                                </span>

                                                <span
                                                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                                                        ticket.status
                                                    )}`}
                                                >
                                                    {ticket.status.replaceAll(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                    {/* ASSET STRIP */}

                                    <div className="grid grid-cols-1 border-b border-slate-200 sm:grid-cols-2">

                                        <div className="px-6 py-4">

                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                                Asset
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-slate-800">
                                                {asset?.name ??
                                                    "Unknown Asset"}
                                            </p>

                                        </div>

                                        <div className="border-t border-slate-200 px-6 py-4 sm:border-l sm:border-t-0">

                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                                Asset Tag
                                            </p>

                                            <p className="mt-1 font-mono text-sm font-bold text-slate-800">
                                                {asset?.assetTag ??
                                                    ticket.assetId}
                                            </p>

                                        </div>

                                    </div>

                                    {/* ISSUE DESCRIPTION */}

                                    <div className="px-6 py-6">

                                        <div className="rounded-2xl border-l-4 border-blue-500 bg-blue-50/60 px-5 py-4">

                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-500">
                                                Employee Report
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                                {ticket.description}
                                            </p>

                                        </div>

                                    </div>

                                    {/* WORK AREA */}

                                    <div className="grid gap-6 border-t border-slate-100 px-6 py-6 lg:grid-cols-2">

                                        <div>

                                            <div className="mb-2 flex items-center justify-between">

                                                <label
                                                    htmlFor={`status-${ticket.id}`}
                                                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500"
                                                >
                                                    Workflow Status
                                                </label>

                                            </div>

                                            <select
                                                id={`status-${ticket.id}`}
                                                value={
                                                    currentStatus
                                                }
                                                disabled={saving}
                                                onChange={(event) =>
                                                    changeStatus(
                                                        ticket.id,
                                                        event.target.value as TicketStatus
                                                    )
                                                }
                                                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            >

                                                {statuses.map(
                                                    (status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status.replaceAll(
                                                                "_",
                                                                " "
                                                            )}
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                            <p className="mt-2 text-xs text-slate-400">
                                                Move this request through the support workflow.
                                            </p>

                                        </div>

                                        <div>

                                            <div className="mb-2 flex items-center justify-between">

                                                <label
                                                    htmlFor={`admin-note-${ticket.id}`}
                                                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500"
                                                >
                                                    Resolution Note
                                                </label>

                                            </div>

                                            <textarea
                                                id={`admin-note-${ticket.id}`}
                                                value={
                                                    currentNote
                                                }
                                                onChange={(event) =>
                                                    changeNote(
                                                        ticket.id,
                                                        event.target.value
                                                    )
                                                }
                                                disabled={saving}
                                                placeholder="Add an update or resolution note..."
                                                rows={4}
                                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                                            />

                                            <p className="mt-2 text-xs text-slate-400">
                                                The employee can see this note.
                                            </p>

                                        </div>

                                    </div>

                                    {/* ACTION BAR */}

                                    <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div>

                                            {successTicketId ===
                                                ticket.id && (
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">

                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                                                            ✓
                                                        </span>

                                                        Ticket updated successfully

                                                    </div>
                                                )}

                                            {changed &&
                                                successTicketId !==
                                                ticket.id && (
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">

                                                        <span className="h-2 w-2 rounded-full bg-amber-500" />

                                                        Unsaved changes

                                                    </div>
                                                )}

                                            {!changed &&
                                                successTicketId !==
                                                ticket.id && (
                                                    <p className="text-xs text-slate-400">
                                                        No pending changes
                                                    </p>
                                                )}

                                        </div>

                                        <div className="flex gap-3">

                                            <button
                                                type="button"
                                                disabled={
                                                    !changed ||
                                                    saving
                                                }
                                                onClick={() =>
                                                    cancelChanges(
                                                        ticket
                                                    )
                                                }
                                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    !changed ||
                                                    saving
                                                }
                                                onClick={() =>
                                                    saveChanges(
                                                        ticket
                                                    )
                                                }
                                                className="rounded-xl bg-[#172033] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                            >
                                                {saving
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </button>

                                        </div>

                                    </div>

                                    {/* FOOTER */}

                                    <div className="flex flex-col gap-2 px-6 py-4 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                                        <p className="font-mono">
                                            Ticket ID:{" "}
                                            {ticket.id}
                                        </p>

                                        <p>
                                            Created:{" "}
                                            {new Date(
                                                ticket.createdAt
                                            ).toLocaleString()}
                                        </p>

                                    </div>

                                </article>
                            );
                        }
                    )}

                </div>

            </div>

        </main>
    );
}

function QueueStat({
                       label,
                       value,
                       color,
                   }: {
    label: string;
    value: number;
    color: "slate" | "blue" | "amber" | "green";
}) {
    const styles = {
        slate: "text-slate-300",
        blue: "text-blue-300",
        amber: "text-amber-300",
        green: "text-emerald-300",
    };

    return (
        <div className="border-r border-white/10 px-5 py-4 last:border-r-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {label}
            </p>

            <p
                className={`mt-1 text-2xl font-bold ${styles[color]}`}
            >
                {value}
            </p>
        </div>
    );
}