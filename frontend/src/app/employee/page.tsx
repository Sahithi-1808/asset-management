"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AssetStatus =
    | "IN_STOCK"
    | "ASSIGNED"
    | "IN_REPAIR"
    | "RETIRED";

type Asset = {
    id: string;
    assetTag: string;
    name: string;
    category: string | null;
    manufacturer: string | null;
    model: string | null;
    status: AssetStatus;
    assignedTo: string | null;
};

export default function EmployeePage() {
    const router = useRouter();

    const [username] = useState(() => {
        if (typeof window === "undefined") return "";

        return sessionStorage.getItem("username") ?? "";
    });

    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUsername = sessionStorage.getItem("username");
        const storedRole = sessionStorage.getItem("role");
        const token = sessionStorage.getItem("token");

        if (!storedUsername || storedRole !== "EMPLOYEE" || !token) {
            router.push("/login");
            return;
        }

        async function loadAssignedAssets() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `http://localhost:8084/api/v1/assets/assigned/${storedUsername}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load your assigned assets."
                    );
                }

                const data: Asset[] = await response.json();
                setAssets(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load your assigned assets."
                );
            } finally {
                setLoading(false);
            }
        }

        void loadAssignedAssets();
    }, [router]);

    function formatStatus(status: AssetStatus) {
        switch (status) {
            case "IN_STOCK":
                return "In Stock";

            case "ASSIGNED":
                return "Assigned";

            case "IN_REPAIR":
                return "In Repair";

            case "RETIRED":
                return "Retired";

            default:
                return status;
        }
    }

    function signOut() {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("role");
        router.push("/login");
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/40 px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-xl shadow-indigo-100">

                    <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold text-white shadow-inner ring-1 ring-white/30">
                                {username ? username.charAt(0).toUpperCase() : "U"}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-indigo-100">
                                    Employee Portal
                                </p>

                                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Hello, {username}
                                </h1>

                                <p className="mt-1 text-sm text-indigo-100">
                                    View and manage the assets assigned to your account.
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={signOut}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
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
                                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18 8.25 21.75 12 18 15.75M9.75 12h12"
                                />
                            </svg>

                            Sign out
                        </button>

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
                                Unable to load assets
                            </p>

                            <p className="mt-0.5 text-sm text-red-700">
                                {error}
                            </p>
                        </div>

                    </div>
                )}

                {/* Summary */}
                <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

                    {/* Assigned Assets */}
                    <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">

                        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-indigo-100/70" />

                        <div className="relative flex items-start justify-between">

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Assigned Assets
                                </p>

                                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                    {assets.length}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Assets linked to your account
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
                                    <rect
                                        x="3"
                                        y="4"
                                        width="18"
                                        height="16"
                                        rx="2"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        d="M8 8h8M8 12h8M8 16h4"
                                    />
                                </svg>
                            </div>

                        </div>

                    </div>

                    {/* Active */}
                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">

                        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-100/70" />

                        <div className="relative flex items-start justify-between">

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Active
                                </p>

                                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                    {
                                        assets.filter(
                                            (asset) =>
                                                asset.status === "ASSIGNED"
                                        ).length
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Currently assigned and active
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
                                        d="M12 3v18M3 12h18"
                                    />
                                </svg>
                            </div>

                        </div>

                    </div>

                    {/* In Repair */}
                    <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">

                        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-amber-100/70" />

                        <div className="relative flex items-start justify-between">

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    In Repair
                                </p>

                                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                    {
                                        assets.filter(
                                            (asset) =>
                                                asset.status === "IN_REPAIR"
                                        ).length
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Assets currently under repair
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
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m14.7 6.3 3-3a4.24 4.24 0 0 1 0 6l-3 3"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m17.7 9.3-7.8 7.8a2.12 2.12 0 0 1-3 0l-.1-.1a2.12 2.12 0 0 1 0-3l7.8-7.8"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m5.3 18.7 2 2"
                                    />
                                </svg>
                            </div>

                        </div>

                    </div>

                </div>

                {/* Assets */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    {/* Section Header */}
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <rect
                                        x="3"
                                        y="5"
                                        width="18"
                                        height="14"
                                        rx="2"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        d="M8 9h8M8 13h5"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    My Assets
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Assets currently assigned to your account.
                                </p>
                            </div>

                        </div>

                        {!loading && assets.length > 0 && (
                            <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                {assets.length}{" "}
                                {assets.length === 1 ? "asset" : "assets"}
                            </div>
                        )}

                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                            </div>

                            <p className="mt-4 text-sm font-medium text-slate-700">
                                Loading your assets...
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Please wait while we retrieve your assigned assets.
                            </p>

                        </div>
                    ) : assets.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <svg
                                    className="h-8 w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <rect
                                        x="3"
                                        y="4"
                                        width="18"
                                        height="16"
                                        rx="2"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        d="M8 9h8M8 13h5"
                                    />
                                </svg>

                            </div>

                            <p className="mt-5 text-sm font-semibold text-slate-900">
                                No assets assigned
                            </p>

                            <p className="mt-1 max-w-sm text-sm text-slate-500">
                                There are currently no assets assigned to you.
                            </p>

                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[900px] text-left">

                                <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80">

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Asset Tag
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Asset
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Category
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Manufacturer
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Model
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Status
                                    </th>

                                </tr>
                                </thead>

                                <tbody>

                                {assets.map((asset) => (
                                    <tr
                                        key={asset.id}
                                        className="group border-b border-slate-100 transition last:border-b-0 hover:bg-indigo-50/30"
                                    >

                                        {/* Asset Tag */}
                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
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
                                                            d="M20 12 12 20l-8-8V4h8l8 8Z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            d="M8 8h.01"
                                                        />
                                                    </svg>
                                                </div>

                                                <span className="text-sm font-bold text-slate-900">
                                                    {asset.assetTag}
                                                </span>

                                            </div>

                                        </td>

                                        {/* Asset */}
                                        <td className="px-6 py-5">

                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {asset.name}
                                                </p>

                                                {asset.model && (
                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {asset.model}
                                                    </p>
                                                )}
                                            </div>

                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-5">

                                            {asset.category ? (
                                                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                    {asset.category}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-400">
                                                    -
                                                </span>
                                            )}

                                        </td>

                                        {/* Manufacturer */}
                                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                                            {asset.manufacturer ?? "-"}
                                        </td>

                                        {/* Model */}
                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {asset.model ?? "-"}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-5">

                                            {asset.status === "ASSIGNED" && (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    {formatStatus(asset.status)}
                                                </span>
                                            )}

                                            {asset.status === "IN_STOCK" && (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                    {formatStatus(asset.status)}
                                                </span>
                                            )}

                                            {asset.status === "IN_REPAIR" && (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    {formatStatus(asset.status)}
                                                </span>
                                            )}

                                            {asset.status === "RETIRED" && (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-200">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                    {formatStatus(asset.status)}
                                                </span>
                                            )}

                                        </td>

                                    </tr>
                                ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

                {/* Footer */}
                <div className="mt-6 flex flex-col items-center justify-between gap-2 px-2 text-xs text-slate-400 sm:flex-row">

                    <p>
                        Asset Management Portal
                    </p>

                    <p>
                        Employee View
                    </p>

                </div>

            </div>
        </main>
    );
}