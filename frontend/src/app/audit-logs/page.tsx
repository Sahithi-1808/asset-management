"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AuditLog = {
    id: string;
    assetId: string;
    assetTag: string;
    action: string;
    performedBy: string;
    oldValue: string | null;
    newValue: string | null;
    details: string | null;
    createdAt: string;
};

type FilterType =
    | "ALL"
    | "ASSET_CREATED"
    | "ASSET_ASSIGNED"
    | "ASSET_UNASSIGNED"
    | "STATUS_CHANGED"
    | "ASSET_RETIRED";

export default function AuditLogsPage() {

    const router = useRouter();

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

    const [logs, setLogs] =
        useState<AuditLog[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState<FilterType>("ALL");

    useEffect(() => {

        const loadAuditLogs = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await fetch(
                        "http://localhost:8084/api/v1/audit-logs",
                        {
                            headers: getAuthHeaders(),
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load audit logs (${response.status})`
                    );
                }

                const data: AuditLog[] =
                    await response.json();

                setLogs(data);

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load audit logs"
                );

            } finally {

                setLoading(false);

            }
        };

        loadAuditLogs();

    }, []);

    const formatDate = (value: string) => {

        return new Date(value).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const getActionLabel = (
        action: string
    ) => {

        return action
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    };

    const getActionStyle = (
        action: string
    ) => {

        switch (action) {

            case "ASSET_CREATED":
                return {
                    badge:
                        "border-emerald-200 bg-emerald-50 text-emerald-700",
                    dot:
                        "bg-emerald-500",
                    icon:
                        "+",
                };

            case "ASSET_ASSIGNED":
                return {
                    badge:
                        "border-sky-200 bg-sky-50 text-sky-700",
                    dot:
                        "bg-sky-500",
                    icon:
                        "→",
                };

            case "ASSET_UNASSIGNED":
                return {
                    badge:
                        "border-slate-200 bg-slate-100 text-slate-700",
                    dot:
                        "bg-slate-500",
                    icon:
                        "←",
                };

            case "STATUS_CHANGED":
                return {
                    badge:
                        "border-violet-200 bg-violet-50 text-violet-700",
                    dot:
                        "bg-violet-500",
                    icon:
                        "↻",
                };

            case "ASSET_RETIRED":
                return {
                    badge:
                        "border-rose-200 bg-rose-50 text-rose-700",
                    dot:
                        "bg-rose-500",
                    icon:
                        "✓",
                };

            default:
                return {
                    badge:
                        "border-amber-200 bg-amber-50 text-amber-700",
                    dot:
                        "bg-amber-500",
                    icon:
                        "•",
                };
        }
    };

    const filteredLogs =
        useMemo(() => {

            const query =
                search.trim().toLowerCase();

            return logs.filter((log) => {

                const matchesFilter =
                    filter === "ALL" ||
                    log.action === filter;

                if (!matchesFilter) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                return [
                    log.assetTag,
                    log.assetId,
                    log.action,
                    log.performedBy,
                    log.oldValue,
                    log.newValue,
                    log.details,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value)
                            .toLowerCase()
                            .includes(query)
                    );
            });

        }, [logs, search, filter]);

    const stats =
        useMemo(() => {

            return {
                total:
                logs.length,

                created:
                logs.filter(
                    (log) =>
                        log.action ===
                        "ASSET_CREATED"
                ).length,

                assigned:
                logs.filter(
                    (log) =>
                        log.action ===
                        "ASSET_ASSIGNED"
                ).length,

                statusChanges:
                logs.filter(
                    (log) =>
                        log.action ===
                        "STATUS_CHANGED"
                ).length,

                retired:
                logs.filter(
                    (log) =>
                        log.action ===
                        "ASSET_RETIRED"
                ).length,
            };

        }, [logs]);

    const uniqueAssets =
        new Set(
            logs.map(
                (log) =>
                    log.assetId
            )
        ).size;

    return (
        <main className="min-h-screen bg-[#f3f7f7] text-slate-800">

            {/* HEADER */}

            <header className="border-b border-slate-200/80 bg-white">

                <div className="mx-auto max-w-[1450px] px-6 py-7 sm:px-8">

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-600">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    className="h-6 w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>

                            </div>

                            <div>

                                <div className="flex items-center gap-2">

                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">
                                        Activity Center
                                    </span>

                                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />

                                </div>

                                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                    Audit Logs
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    Track asset changes and administrative activity.
                                </p>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/dashboard"
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                        >
                            <span className="text-base">
                                ←
                            </span>

                            Back to Dashboard
                        </button>

                    </div>

                </div>

            </header>

            {/* CONTENT */}

            <section className="mx-auto max-w-[1450px] px-6 py-7 sm:px-8">

                {/* SUMMARY */}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

                    <ActivityStat
                        label="Total Events"
                        value={stats.total}
                        icon="◉"
                        accent="teal"
                    />

                    <ActivityStat
                        label="Assets Tracked"
                        value={uniqueAssets}
                        icon="▣"
                        accent="blue"
                    />

                    <ActivityStat
                        label="Created"
                        value={stats.created}
                        icon="+"
                        accent="green"
                    />

                    <ActivityStat
                        label="Assigned"
                        value={stats.assigned}
                        icon="→"
                        accent="violet"
                    />

                    <ActivityStat
                        label="Status Changes"
                        value={stats.statusChanges}
                        icon="↻"
                        accent="amber"
                    />

                </div>

                {/* FILTER BAR */}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        <div>

                            <div className="flex items-center gap-2">

                                <span className="h-2 w-2 rounded-full bg-teal-500" />

                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                                    Activity History
                                </p>

                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Showing{" "}
                                <span className="font-semibold text-slate-700">
                                    {filteredLogs.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-slate-700">
                                    {logs.length}
                                </span>{" "}
                                recorded events
                            </p>

                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <div className="relative">

                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search audit activity..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-500/10 sm:w-72"
                                />

                            </div>

                            <select
                                value={filter}
                                onChange={(event) =>
                                    setFilter(
                                        event.target.value as FilterType
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                            >

                                <option value="ALL">
                                    All Activities
                                </option>

                                <option value="ASSET_CREATED">
                                    Asset Created
                                </option>

                                <option value="ASSET_ASSIGNED">
                                    Asset Assigned
                                </option>

                                <option value="ASSET_UNASSIGNED">
                                    Asset Unassigned
                                </option>

                                <option value="STATUS_CHANGED">
                                    Status Changed
                                </option>

                                <option value="ASSET_RETIRED">
                                    Asset Retired
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                        {error}
                    </div>
                )}

                {/* ACTIVITY PANEL */}

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_30px_rgba(15,23,42,0.05)]">

                    <div className="flex items-center justify-between border-b border-slate-200 bg-[#fbfdfd] px-5 py-4">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                                ◷
                            </div>

                            <div>

                                <h2 className="text-sm font-bold text-slate-800">
                                    Recent Administrative Activity
                                </h2>

                                <p className="text-xs text-slate-400">
                                    Asset lifecycle history
                                </p>

                            </div>

                        </div>

                        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 sm:flex">

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            Live Records

                        </div>

                    </div>

                    {loading ? (

                        <div className="px-6 py-24 text-center">

                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />

                            <p className="mt-4 text-sm font-medium text-slate-500">
                                Loading activity...
                            </p>

                        </div>

                    ) : filteredLogs.length === 0 ? (

                        <div className="px-6 py-24 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
                                ◌
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-slate-800">
                                No activity found
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Try changing your search or filter.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="min-w-full">

                                <thead>

                                <tr className="border-b border-slate-200 bg-slate-50/80">

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Asset
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Activity
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Performed By
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Change
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Details
                                    </th>

                                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                        Date
                                    </th>

                                </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                {filteredLogs.map(
                                    (log, index) => {

                                        const style =
                                            getActionStyle(
                                                log.action
                                            );

                                        return (
                                            <tr
                                                key={log.id}
                                                className="group transition hover:bg-teal-50/30"
                                            >

                                                {/* ASSET */}

                                                <td className="px-5 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-400">

                                                            {String(
                                                                index + 1
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}

                                                        </div>

                                                        <div>

                                                            <p className="font-mono text-sm font-bold text-slate-700">
                                                                {log.assetTag}
                                                            </p>

                                                            <p className="mt-1 max-w-[170px] truncate font-mono text-[9px] text-slate-400">
                                                                {log.assetId}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* ACTION */}

                                                <td className="px-5 py-5">

                                                    <span
                                                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ${style.badge}`}
                                                    >

                                                        <span
                                                            className={`flex h-5 w-5 items-center justify-center rounded-md ${style.dot} text-[10px] font-bold text-white`}
                                                        >
                                                            {style.icon}
                                                        </span>

                                                        {getActionLabel(
                                                            log.action
                                                        )}

                                                    </span>

                                                </td>

                                                {/* USER */}

                                                <td className="px-5 py-5">

                                                    <div className="flex items-center gap-2.5">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-600 ring-1 ring-teal-100">
                                                            {log.performedBy
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <span className="text-sm font-semibold text-slate-600">
                                                            {log.performedBy}
                                                        </span>

                                                    </div>

                                                </td>

                                                {/* CHANGE */}

                                                <td className="px-5 py-5">

                                                    {log.oldValue ||
                                                    log.newValue ? (

                                                        <div className="min-w-[150px]">

                                                            {log.oldValue && (
                                                                <div className="flex items-center gap-2 text-xs">

                                                                    <span className="text-slate-400">
                                                                        From
                                                                    </span>

                                                                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono font-semibold text-slate-600">
                                                                        {log.oldValue}
                                                                    </span>

                                                                </div>
                                                            )}

                                                            {log.newValue && (
                                                                <div className="mt-2 flex items-center gap-2 text-xs">

                                                                    <span className="text-teal-500">
                                                                        To
                                                                    </span>

                                                                    <span className="rounded-md bg-teal-50 px-2 py-1 font-mono font-bold text-teal-700">
                                                                        {log.newValue}
                                                                    </span>

                                                                </div>
                                                            )}

                                                        </div>

                                                    ) : (

                                                        <span className="text-slate-300">
                                                            —
                                                        </span>

                                                    )}

                                                </td>

                                                {/* DETAILS */}

                                                <td className="max-w-[300px] px-5 py-5">

                                                    <p className="text-sm leading-5 text-slate-500">
                                                        {log.details ||
                                                            "No additional details"}
                                                    </p>

                                                </td>

                                                {/* DATE */}

                                                <td className="whitespace-nowrap px-5 py-5">

                                                    <p className="text-xs font-semibold text-slate-600">
                                                        {formatDate(
                                                            log.createdAt
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-[9px] uppercase tracking-wider text-slate-400">
                                                        Audit event
                                                    </p>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </section>

        </main>
    );
}

function ActivityStat({
                          label,
                          value,
                          icon,
                          accent,
                      }: {
    label: string;
    value: number;
    icon: string;
    accent:
        | "teal"
        | "blue"
        | "green"
        | "violet"
        | "amber";
}) {

    const styles = {
        teal: {
            wrapper:
                "border-teal-100 bg-teal-50/60",
            icon:
                "bg-teal-100 text-teal-600",
            value:
                "text-teal-700",
        },

        blue: {
            wrapper:
                "border-blue-100 bg-blue-50/50",
            icon:
                "bg-blue-100 text-blue-600",
            value:
                "text-blue-700",
        },

        green: {
            wrapper:
                "border-emerald-100 bg-emerald-50/50",
            icon:
                "bg-emerald-100 text-emerald-600",
            value:
                "text-emerald-700",
        },

        violet: {
            wrapper:
                "border-violet-100 bg-violet-50/50",
            icon:
                "bg-violet-100 text-violet-600",
            value:
                "text-violet-700",
        },

        amber: {
            wrapper:
                "border-amber-100 bg-amber-50/50",
            icon:
                "bg-amber-100 text-amber-600",
            value:
                "text-amber-700",
        },
    };

    const current =
        styles[accent];

    return (
        <div
            className={`rounded-2xl border p-4 ${current.wrapper}`}
        >

            <div className="flex items-center justify-between">

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    {label}
                </p>

                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${current.icon}`}
                >
                    {icon}
                </div>

            </div>

            <p
                className={`mt-2 text-2xl font-bold ${current.value}`}
            >
                {value}
            </p>

        </div>
    );
}