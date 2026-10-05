"use client";

import {
    FormEvent,
    useEffect,
    useState
} from "react";

import {
    useRouter
} from "next/navigation";

import type {
    Ticket,
    TicketIssueType,
    TicketPriority
} from "@/components/tickets/TicketTypes";

const API =
    "http://localhost:8084/api/v1";

function getAuthHeaders(): HeadersInit {
    if (typeof window === "undefined") {
        return {};
    }

    const jwtToken =
        window.sessionStorage.getItem("token");

    if (!jwtToken) {
        return {};
    }

    return {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
    };
}

type AssetStatus =
    | "IN_STOCK"
    | "ASSIGNED"
    | "IN_REPAIR"
    | "RETIRED";

type AssignedAsset = {
    id: string;
    assetTag: string;
    name: string;
    category: string | null;
    manufacturer: string | null;
    model: string | null;
    status: AssetStatus;
    assignedTo: string | null;
};

const issueTypes: TicketIssueType[] = [
    "NOT_WORKING",
    "HARDWARE_DAMAGE",
    "SOFTWARE_ISSUE",
    "PERFORMANCE_ISSUE",
    "CONNECTIVITY_ISSUE",
    "ACCESSORY_ISSUE",
    "OTHER"
];

const priorities: TicketPriority[] = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT"
];

function formatIssueType(
    value: TicketIssueType
) {
    return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) =>
            character.toUpperCase()
        );
}

function formatStatus(
    value: Ticket["status"]
) {
    return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) =>
            character.toUpperCase()
        );
}

export default function EmployeeTicketsPage() {

    const router = useRouter();

    const [username, setUsername] =
        useState("");

    const [assets, setAssets] =
        useState<AssignedAsset[]>([]);

    const [assetId, setAssetId] =
        useState("");

    const [issueType, setIssueType] =
        useState<TicketIssueType>(
            "NOT_WORKING"
        );

    const [priority, setPriority] =
        useState<TicketPriority>(
            "MEDIUM"
        );

    const [description, setDescription] =
        useState("");

    const [tickets, setTickets] =
        useState<Ticket[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    useEffect(() => {

        const storedUsername =
            sessionStorage.getItem("username");

        const storedRole =
            sessionStorage.getItem("role");

        const token =
            sessionStorage.getItem("token");

        if (
            !storedUsername ||
            storedRole !== "EMPLOYEE" ||
            !token
        ) {
            router.push("/login");
            return;
        }

        const employeeUsername =
            storedUsername;

        setUsername(employeeUsername);

        async function loadAssignedAssets() {

            try {

                const response =
                    await fetch(
                        `${API}/assets/assigned/${encodeURIComponent(
                            employeeUsername
                        )}`,
                        {
                            headers: getAuthHeaders(),
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load assigned assets."
                    );
                }

                const data =
                    await response.json();

                setAssets(data);

                if (data.length > 0) {
                    setAssetId(data[0].id);
                }

            } catch {

                setError(
                    "Unable to load your assigned assets."
                );
            }
        }

        async function loadTickets() {

            try {

                const response =
                    await fetch(
                        `${API}/tickets/my?username=${encodeURIComponent(
                            employeeUsername
                        )}`,
                        {
                            headers: getAuthHeaders(),
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load tickets."
                    );
                }

                const data =
                    await response.json();

                setTickets(data);

            } catch {

                setError(
                    "Unable to load your ticket history."
                );

            } finally {

                setLoading(false);
            }
        }

        async function loadPage() {

            await Promise.all([
                loadAssignedAssets(),
                loadTickets()
            ]);
        }

        loadPage();

    }, [router]);

    async function submitTicket(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setError("");
        setMessage("");

        if (!assetId) {

            setError(
                "Please select an assigned asset."
            );

            return;
        }

        if (!description.trim()) {

            setError(
                "Please describe the issue."
            );

            return;
        }

        setSubmitting(true);

        try {

            const response =
                await fetch(
                    `${API}/tickets`,
                    {
                        method: "POST",

                        headers: getAuthHeaders(),

                        body: JSON.stringify({
                            assetId,
                            employeeUsername:
                            username,
                            issueType,
                            description:
                                description.trim(),
                            priority
                        })
                    }
                );

            const data =
                await response.json().catch(
                    () => null
                );

            if (!response.ok) {

                setError(
                    data?.message ||
                    "Unable to raise the ticket."
                );

                return;
            }

            setDescription("");

            setIssueType(
                "NOT_WORKING"
            );

            setPriority(
                "MEDIUM"
            );

            setMessage(
                "Your ticket has been raised successfully."
            );

            const ticketsResponse =
                await fetch(
                    `${API}/tickets/my?username=${encodeURIComponent(
                        username
                    )}`,
                    {
                        headers: getAuthHeaders(),
                    }
                );

            if (ticketsResponse.ok) {

                const updatedTickets =
                    await ticketsResponse.json();

                setTickets(updatedTickets);
            }

        } catch {

            setError(
                "Unable to connect to the Asset Management server."
            );

        } finally {

            setSubmitting(false);
        }
    }

    function signOut() {

        sessionStorage.removeItem(
            "username"
        );

        sessionStorage.removeItem(
            "role"
        );

        sessionStorage.removeItem(
            "token"
        );

        router.push("/login");
    }

    const totalTickets =
        tickets.length;

    const openTickets =
        tickets.filter(
            (ticket) =>
                ticket.status === "OPEN" ||
                ticket.status === "ACKNOWLEDGED" ||
                ticket.status === "IN_PROGRESS"
        ).length;

    const resolvedTickets =
        tickets.filter(
            (ticket) =>
                ticket.status === "RESOLVED" ||
                ticket.status === "CLOSED"
        ).length;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/40 px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-xl shadow-indigo-100">

                    <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold text-white shadow-inner ring-1 ring-white/30">
                                {username
                                    ? username
                                        .charAt(0)
                                        .toUpperCase()
                                    : "U"}
                            </div>

                            <div>

                                <p className="text-sm font-medium text-indigo-100">
                                    Employee Portal
                                </p>

                                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Asset Support
                                </h1>

                                <p className="mt-1 text-sm text-indigo-100">
                                    Raise and track issues with your assigned assets.
                                </p>

                            </div>

                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/employee")
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white/50"
                            >

                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19 8 12l7-7"
                                    />
                                </svg>

                                Back to Dashboard

                            </button>

                        </div>

                    </div>

                </div>

                {/* Error */}
                {error && (
                    <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m0 3.75h.007M10.29 3.86 2.82 17.25A1.5 1.5 0 0 0 4.13 19.5h15.74a1.5 1.5 0 0 0 1.31-2.25L13.71 3.86a1.95 1.95 0 0 0-3.42 0Z"
                                />
                            </svg>

                        </div>

                        <div>

                            <p className="text-sm font-semibold text-red-800">
                                Unable to load ticket information
                            </p>

                            <p className="mt-0.5 text-sm text-red-700">
                                {error}
                            </p>

                        </div>

                    </div>
                )}

                {/* Success */}
                {message && (
                    <div className="mb-7 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m5 12 4 4L19 6"
                                />
                            </svg>

                        </div>

                        <div>

                            <p className="text-sm font-semibold text-emerald-800">
                                Ticket submitted
                            </p>

                            <p className="mt-0.5 text-sm text-emerald-700">
                                {message}
                            </p>

                        </div>

                    </div>
                )}

                {/* Summary */}
                <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

                    {/* Total Tickets */}
                    <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">

                        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-indigo-100/70" />

                        <div className="relative flex items-start justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Total Tickets
                                </p>

                                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                    {totalTickets}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Issues raised by you
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">

                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.38 8.38 0 0 1-3.9-.9L3 21l1.9-5.6A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 3.1-6.6A8.38 8.38 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5Z"
                                    />
                                </svg>

                            </div>

                        </div>

                    </div>

                    {/* Open */}
                    <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">

                        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-amber-100/70" />

                        <div className="relative flex items-start justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Open Tickets
                                </p>

                                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                    {openTickets}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Issues awaiting resolution
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">

                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="8.5"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        d="M12 7.5v5l3 2"
                                    />

                                </svg>

                            </div>

                        </div>

                    </div>

                    {/* Resolved */}
                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">

                        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-100/70" />

                        <div className="relative flex items-start justify-between">

                            <div>

                                <p className="text-sm font-medium text-slate-500">
                                    Resolved
                                </p>

                                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                    {resolvedTickets}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Tickets completed or closed
                                </p>

                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">

                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m5 12 4 4L19 6"
                                    />
                                </svg>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Raise Issue */}
                <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center gap-4 border-b border-slate-200 px-6 py-6 sm:px-8">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">

                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.38 8.38 0 0 1-3.9-.9L3 21l1.9-5.6A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 3.1-6.6A8.38 8.38 0 0 1 12.5 3a8.5 8.5 0 0 1 8.5 8.5Z"
                                />

                                <path
                                    strokeLinecap="round"
                                    d="M12 8v7M8.5 11.5h7"
                                />

                            </svg>

                        </div>

                        <div>

                            <h2 className="text-lg font-bold text-slate-900">
                                Raise an Issue
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Report a problem with one of your assigned assets.
                            </p>

                        </div>

                    </div>

                    <form
                        onSubmit={submitTicket}
                        className="px-6 py-7 sm:px-8"
                    >

                        <div className="grid gap-5 md:grid-cols-2">

                            {/* Employee */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Employee
                                </label>

                                <input
                                    type="text"
                                    value={username}
                                    readOnly
                                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 outline-none"
                                />

                            </div>

                            {/* Assigned Asset */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Assigned Asset
                                </label>

                                {assets.length === 0 ? (

                                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                        No assets are currently assigned to you.
                                    </div>

                                ) : (

                                    <select
                                        value={assetId}
                                        onChange={(event) =>
                                            setAssetId(
                                                event.target.value
                                            )
                                        }
                                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >

                                        {assets.map(
                                            (asset) => (

                                                <option
                                                    key={asset.id}
                                                    value={asset.id}
                                                >
                                                    {asset.name} —{" "}
                                                    {asset.assetTag}
                                                </option>

                                            )
                                        )}

                                    </select>

                                )}

                            </div>

                            {/* Issue Type */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Issue Type
                                </label>

                                <select
                                    value={issueType}
                                    onChange={(event) =>
                                        setIssueType(
                                            event.target.value as TicketIssueType
                                        )
                                    }
                                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                >

                                    {issueTypes.map(
                                        (type) => (

                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {formatIssueType(type)}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* Priority */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Priority
                                </label>

                                <select
                                    value={priority}
                                    onChange={(event) =>
                                        setPriority(
                                            event.target.value as TicketPriority
                                        )
                                    }
                                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                >

                                    {priorities.map(
                                        (value) => (

                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {value}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                        {/* Description */}
                        <div className="mt-5">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                rows={5}
                                placeholder="Describe the issue with your asset..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />

                        </div>

                        {/* Submit */}
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-xs text-slate-400">
                                Please provide enough detail to help resolve the issue.
                            </p>

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    assets.length === 0
                                }
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {submitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Raising Ticket...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 5v14M5 12h14"
                                            />
                                        </svg>

                                        Raise Ticket
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </section>

                {/* My Tickets */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">

                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">

                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        d="M8 8h8M8 12h8M8 16h5"
                                    />

                                </svg>

                            </div>

                            <div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    My Tickets
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Track issues raised for your assigned assets.
                                </p>

                            </div>

                        </div>

                        {!loading && tickets.length > 0 && (
                            <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                {tickets.length}{" "}
                                {tickets.length === 1
                                    ? "ticket"
                                    : "tickets"}
                            </div>
                        )}

                    </div>

                    {loading ? (

                        <div className="flex flex-col items-center justify-center px-6 py-16">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">

                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />

                            </div>

                            <p className="mt-4 text-sm font-medium text-slate-700">
                                Loading your tickets...
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Please wait while we retrieve your ticket history.
                            </p>

                        </div>

                    ) : tickets.length === 0 ? (

                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <svg
                                    className="h-8 w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        d="M8 9h8M8 13h5"
                                    />

                                </svg>

                            </div>

                            <p className="mt-5 text-sm font-semibold text-slate-900">
                                No tickets yet
                            </p>

                            <p className="mt-1 max-w-sm text-sm text-slate-500">
                                You have not raised any tickets for your assigned assets.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4 px-6 py-6 sm:px-8">

                            {tickets.map(
                                (ticket) => {

                                    const asset =
                                        assets.find(
                                            (item) =>
                                                item.id ===
                                                ticket.assetId
                                        );

                                    const status =
                                        ticket.status;

                                    const isResolved =
                                        status ===
                                        "RESOLVED" ||
                                        status ===
                                        "CLOSED";

                                    const isOpen =
                                        status ===
                                        "OPEN" ||
                                        status ===
                                        "ACKNOWLEDGED" ||
                                        status ===
                                        "IN_PROGRESS";

                                    return (
                                        <article
                                            key={ticket.id}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-200 hover:bg-indigo-50/20"
                                        >

                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <h3 className="font-bold text-slate-900">
                                                            {formatIssueType(
                                                                ticket.issueType
                                                            )}
                                                        </h3>

                                                        {isResolved && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">

                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                                                {formatStatus(
                                                                    ticket.status
                                                                )}

                                                            </span>
                                                        )}

                                                        {isOpen && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">

                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                                                                {formatStatus(
                                                                    ticket.status
                                                                )}

                                                            </span>
                                                        )}

                                                        {!isResolved &&
                                                            !isOpen && (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">

                                                                    {formatStatus(
                                                                        ticket.status
                                                                    )}

                                                                </span>
                                                            )}

                                                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                                                            {ticket.priority}
                                                        </span>

                                                    </div>

                                                    <p className="mt-2 text-sm font-medium text-slate-600">
                                                        {asset
                                                            ? `${asset.name} — ${asset.assetTag}`
                                                            : ticket.assetId}
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">

                                                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                    Issue Description
                                                </p>

                                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                                    {ticket.description}
                                                </p>

                                            </div>

                                            {ticket.adminNote && (
                                                <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">

                                                    <div className="flex items-center gap-2">

                                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">

                                                            <svg
                                                                className="h-4 w-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M8 10h8M8 14h5"
                                                                />

                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5l-4 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                                                                />

                                                            </svg>

                                                        </div>

                                                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                                                            Admin Note
                                                        </p>

                                                    </div>

                                                    <p className="mt-2 text-sm leading-6 text-indigo-900">
                                                        {ticket.adminNote}
                                                    </p>

                                                </div>
                                            )}

                                            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">

                                                <p className="text-xs text-slate-400">
                                                    Raised{" "}
                                                    {new Date(
                                                        ticket.createdAt
                                                    ).toLocaleString()}
                                                </p>

                                                <span className="text-xs font-medium text-slate-400">
                                                    Ticket ID:{" "}
                                                    {ticket.id}
                                                </span>

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>
                    )}

                </section>

                {/* Footer */}
                <div className="mt-6 flex flex-col items-center justify-between gap-2 px-2 text-xs text-slate-400 sm:flex-row">

                    <p>
                        Asset Management Portal
                    </p>

                    <p>
                        Employee Support View
                    </p>

                </div>

            </div>

        </main>
    );
}