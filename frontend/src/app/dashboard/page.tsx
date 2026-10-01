"use client";

import { FormEvent, useEffect, useState } from "react";
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

    serialNumber: string | null;
    condition: string | null;
    purchaseDate: string | null;
    warrantyStartDate: string | null;
    warrantyExpiryDate: string | null;
    assetExpiryDate: string | null;
    vendor: string | null;
    purchasePrice: number | null;
    invoiceNumber: string | null;
    purchaseOrderNumber: string | null;
    assignedDate: string | null;
    location: string | null;
    lastMaintenanceDate: string | null;
    nextMaintenanceDate: string | null;
};

type AssetQuantity = {
    name: string;
    category: string | null;
    manufacturer: string | null;
    model: string | null;
    quantity: number;
};

type StatusHistory = {
    id: string;
    oldStatus: AssetStatus | null;
    newStatus: AssetStatus;
    changedAt: string;
};

const STATUS_OPTIONS: {
    value: AssetStatus;
    label: string;
}[] = [
    {
        value: "IN_STOCK",
        label: "In Stock",
    },
    {
        value: "ASSIGNED",
        label: "Assigned",
    },
    {
        value: "IN_REPAIR",
        label: "In Repair",
    },
    {
        value: "RETIRED",
        label: "Retired",
    },
];

const EMPLOYEE_OPTIONS = [
    {
        username: "sam",
        label: "Sam",
    },
    {
        username: "alex",
        label: "Alex",
    },
];

export default function DashboardPage() {
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

    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [updatingDetails, setUpdatingDetails] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    const [editForm, setEditForm] = useState({
        serialNumber: "",
        condition: "",
        purchaseDate: "",
        warrantyStartDate: "",
        warrantyExpiryDate: "",
        assetExpiryDate: "",
        vendor: "",
        purchasePrice: "",
        invoiceNumber: "",
        purchaseOrderNumber: "",
        assignedDate: "",
        location: "",
        lastMaintenanceDate: "",
        nextMaintenanceDate: "",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [assetQuantities, setAssetQuantities] = useState<AssetQuantity[]>([]);
    const [quantityLoading, setQuantityLoading] = useState(true);
    const [quantityError, setQuantityError] = useState("");

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const [newAsset, setNewAsset] = useState({
        assetTag: "",
        name: "",
        category: "",
        manufacturer: "",
        model: "",
        status: "IN_STOCK" as AssetStatus,
        assignedTo: "",

        serialNumber: "",
        condition: "",
        purchaseDate: "",
        warrantyStartDate: "",
        warrantyExpiryDate: "",
        assetExpiryDate: "",
        vendor: "",
        purchasePrice: "",
        invoiceNumber: "",
        purchaseOrderNumber: "",
        assignedDate: "",
        location: "",
        lastMaintenanceDate: "",
        nextMaintenanceDate: "",
    });

    const [selectedStatuses, setSelectedStatuses] = useState<
        Record<string, AssetStatus>
    >({});

    const [selectedEmployees, setSelectedEmployees] = useState<
        Record<string, string>
    >({});

    const [updatingAssetId, setUpdatingAssetId] = useState<string | null>(
        null
    );

    const [statusError, setStatusError] = useState("");
    const [statusSuccess, setStatusSuccess] = useState("");

    const [showHistory, setShowHistory] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");
    const [history, setHistory] = useState<StatusHistory[]>([]);
    const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);

    useEffect(() => {
        async function loadAssets() {
            try {
                const response = await fetch(
                    "http://localhost:8084/api/v1/assets",
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (!response.ok) {
                    throw new Error();
                }

                const data = await response.json();

                setAssets(data);

                const quantityResponse = await fetch(
                    "http://localhost:8084/api/v1/assets/quantities",
                    {
                        headers: getAuthHeaders(),
                    }
                );

                if (!quantityResponse.ok) {
                    throw new Error();
                }

                const quantityData = await quantityResponse.json();

                setAssetQuantities(quantityData);

                const initialStatuses: Record<string, AssetStatus> = {};
                const initialEmployees: Record<string, string> = {};

                data.forEach((asset: Asset) => {
                    initialStatuses[asset.id] = asset.status;

                    if (asset.assignedTo) {
                        initialEmployees[asset.id] = asset.assignedTo;
                    }
                });

                setSelectedStatuses(initialStatuses);
                setSelectedEmployees(initialEmployees);
            } catch {
                setError(
                    "Unable to connect to the Asset Management API."
                );
            } finally {
                setLoading(false);
                setQuantityLoading(false);
            }
        }

        loadAssets();
    }, []);

    async function handleCreateAsset(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setCreating(true);
        setCreateError("");

        try {
            const response = await fetch(
                "http://localhost:8084/api/v1/assets",
                {
                    method: "POST",
                    headers: getAuthHeaders(),

                    body: JSON.stringify({
                        assetTag: newAsset.assetTag.trim(),
                        name: newAsset.name.trim(),
                        category: newAsset.category.trim() || null,
                        manufacturer:
                            newAsset.manufacturer.trim() || null,
                        model: newAsset.model.trim() || null,
                        status: newAsset.status,
                        assignedTo:
                            newAsset.assignedTo.trim() || null,

                        serialNumber:
                            newAsset.serialNumber.trim() || null,
                        condition:
                            newAsset.condition.trim() || null,
                        purchaseDate:
                            newAsset.purchaseDate || null,
                        warrantyStartDate:
                            newAsset.warrantyStartDate || null,
                        warrantyExpiryDate:
                            newAsset.warrantyExpiryDate || null,
                        assetExpiryDate:
                            newAsset.assetExpiryDate || null,
                        vendor:
                            newAsset.vendor.trim() || null,
                        purchasePrice:
                            newAsset.purchasePrice
                                ? Number(newAsset.purchasePrice)
                                : null,
                        invoiceNumber:
                            newAsset.invoiceNumber.trim() || null,
                        purchaseOrderNumber:
                            newAsset.purchaseOrderNumber.trim() || null,
                        assignedDate:
                            newAsset.assignedDate || null,
                        location:
                            newAsset.location.trim() || null,
                        lastMaintenanceDate:
                            newAsset.lastMaintenanceDate || null,
                        nextMaintenanceDate:
                            newAsset.nextMaintenanceDate || null,

                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setCreateError(
                    data?.message || "Unable to create asset."
                );
                return;
            }

            setAssets((current) => [...current, data]);

            setSelectedStatuses((current) => ({
                ...current,
                [data.id]: data.status,
            }));

            if (data.assignedTo) {
                setSelectedEmployees((current) => ({
                    ...current,
                    [data.id]: data.assignedTo,
                }));
            }

            setNewAsset({
                assetTag: "",
                name: "",
                category: "",
                manufacturer: "",
                model: "",
                status: "IN_STOCK",
                assignedTo: "",


                serialNumber: "",
                condition: "",
                purchaseDate: "",
                warrantyStartDate: "",
                warrantyExpiryDate: "",
                assetExpiryDate: "",
                vendor: "",
                purchasePrice: "",
                invoiceNumber: "",
                purchaseOrderNumber: "",
                assignedDate: "",
                location: "",
                lastMaintenanceDate: "",
                nextMaintenanceDate: "",
            });

            setShowCreateForm(false);
        } catch {
            setCreateError(
                "Unable to connect to the Asset Management API."
            );
        } finally {
            setCreating(false);
        }
    }

    function handleEditAsset(asset: Asset) {
        setEditingAsset(asset);

        setEditForm({
            serialNumber: asset.serialNumber ?? "",
            condition: asset.condition ?? "",
            purchaseDate: asset.purchaseDate ?? "",
            warrantyStartDate: asset.warrantyStartDate ?? "",
            warrantyExpiryDate: asset.warrantyExpiryDate ?? "",
            assetExpiryDate: asset.assetExpiryDate ?? "",
            vendor: asset.vendor ?? "",
            purchasePrice:
                asset.purchasePrice !== null
                    ? String(asset.purchasePrice)
                    : "",
            invoiceNumber: asset.invoiceNumber ?? "",
            purchaseOrderNumber: asset.purchaseOrderNumber ?? "",
            assignedDate: asset.assignedDate ?? "",
            location: asset.location ?? "",
            lastMaintenanceDate: asset.lastMaintenanceDate ?? "",
            nextMaintenanceDate: asset.nextMaintenanceDate ?? "",
        });

        setEditError("");
        setEditSuccess("");
    }

    async function handleSaveAssetDetails() {
        if (!editingAsset) {
            return;
        }

        setUpdatingDetails(true);
        setEditError("");
        setEditSuccess("");

        try {
            const response = await fetch(
                `http://localhost:8084/api/v1/assets/${editingAsset.id}`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        serialNumber: editForm.serialNumber.trim() || null,
                        condition: editForm.condition.trim() || null,
                        purchaseDate: editForm.purchaseDate || null,
                        warrantyStartDate:
                            editForm.warrantyStartDate || null,
                        warrantyExpiryDate:
                            editForm.warrantyExpiryDate || null,
                        assetExpiryDate:
                            editForm.assetExpiryDate || null,
                        vendor: editForm.vendor.trim() || null,
                        purchasePrice: editForm.purchasePrice
                            ? Number(editForm.purchasePrice)
                            : null,
                        invoiceNumber:
                            editForm.invoiceNumber.trim() || null,
                        purchaseOrderNumber:
                            editForm.purchaseOrderNumber.trim() || null,
                        assignedDate: editForm.assignedDate || null,
                        location: editForm.location.trim() || null,
                        lastMaintenanceDate:
                            editForm.lastMaintenanceDate || null,
                        nextMaintenanceDate:
                            editForm.nextMaintenanceDate || null,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setEditError(
                    data?.message ||
                    "Unable to update asset details."
                );
                return;
            }

            setAssets((current) =>
                current.map((asset) =>
                    asset.id === editingAsset.id
                        ? data
                        : asset
                )
            );

            setSelectedAsset((current) =>
                current?.id === editingAsset.id
                    ? data
                    : current
            );

            setEditingAsset(null);
            setEditSuccess(
                `${editingAsset.assetTag} details updated successfully.`
            );
        } catch {
            setEditError(
                "Unable to connect to the Asset Management API."
            );
        } finally {
            setUpdatingDetails(false);
        }
    }

    function handleStatusSelection(
        assetId: string,
        status: AssetStatus
    ) {
        setSelectedStatuses((current) => ({
            ...current,
            [assetId]: status,
        }));

        setStatusError("");
        setStatusSuccess("");
    }

    function handleEmployeeSelection(
        assetId: string,
        username: string
    ) {
        setSelectedEmployees((current) => ({
            ...current,
            [assetId]: username,
        }));

        setStatusError("");
        setStatusSuccess("");
    }

    async function handleUpdateStatus(asset: Asset) {
        const selectedStatus =
            selectedStatuses[asset.id] ?? asset.status;

        const selectedEmployee =
            selectedEmployees[asset.id] ??
            asset.assignedTo ??
            "";

        if (
            selectedStatus === "ASSIGNED" &&
            !selectedEmployee
        ) {
            setStatusError(
                `Please select an employee for ${asset.assetTag}.`
            );
            setStatusSuccess("");
            return;
        }

        if (
            selectedStatus === asset.status &&
            selectedEmployee === (asset.assignedTo ?? "")
        ) {
            setStatusSuccess(
                `${asset.assetTag} has no changes.`
            );
            setStatusError("");
            return;
        }

        setUpdatingAssetId(asset.id);
        setStatusError("");
        setStatusSuccess("");

        try {
            const response = await fetch(
                `http://localhost:8084/api/v1/assets/${asset.id}/status`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        status: selectedStatus,
                        assignedTo:
                            selectedStatus === "ASSIGNED"
                                ? selectedEmployee
                                : null,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setStatusError(
                    data?.message ||
                    "Unable to update asset status."
                );
                return;
            }

            const updatedAssignedTo =
                data?.assignedTo ??
                (
                    selectedStatus === "ASSIGNED"
                        ? selectedEmployee
                        : null
                );

            setAssets((current) =>
                current.map((currentAsset) =>
                    currentAsset.id === asset.id
                        ? {
                            ...currentAsset,
                            status:
                                data?.status ??
                                selectedStatus,
                            assignedTo: updatedAssignedTo,
                        }
                        : currentAsset
                )
            );

            setSelectedStatuses((current) => ({
                ...current,
                [asset.id]:
                    data?.status ?? selectedStatus,
            }));

            setSelectedEmployees((current) => ({
                ...current,
                [asset.id]: updatedAssignedTo ?? "",
            }));

            setStatusSuccess(
                `${asset.assetTag} updated successfully.`
            );
        } catch {
            setStatusError(
                "Unable to connect to the Asset Management API."
            );
        } finally {
            setUpdatingAssetId(null);
        }
    }

    async function handleViewHistory(asset: Asset) {
        setHistoryAsset(asset);
        setShowHistory(true);
        setHistoryLoading(true);
        setHistoryError("");
        setHistory([]);

        try {
            const response = await fetch(
                `http://localhost:8084/api/v1/assets/${asset.id}/status-history`,
            {
                headers: getAuthHeaders(),
            }
        );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                setHistoryError(
                    data?.message ||
                    "Unable to load status history."
                );
                return;
            }

            setHistory(data);
        } catch {
            setHistoryError(
                "Unable to connect to the Asset Management API."
            );
        } finally {
            setHistoryLoading(false);
        }
    }

    function closeHistory() {
        setShowHistory(false);
        setHistoryAsset(null);
        setHistory([]);
        setHistoryError("");
    }

    const total = assets.length;

    const totalQuantity = assetQuantities.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const inStock = assets.filter(
        (asset) => asset.status === "IN_STOCK"
    ).length;

    const assigned = assets.filter(
        (asset) => asset.status === "ASSIGNED"
    ).length;

    const inRepair = assets.filter(
        (asset) => asset.status === "IN_REPAIR"
    ).length;

    const retired = assets.filter(
        (asset) => asset.status === "RETIRED"
    ).length;

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,0.30),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(139,92,246,0.25),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.18),transparent_35%),linear-gradient(135deg,#070b1a_0%,#111a3a_45%,#24135f_100%)] px-4 py-5 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-[1500px]">

                {/* Header */}
                <div className="mb-7 rounded-3xl border border-white/15 bg-white/[0.08] px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.20)] backdrop-blur-xl sm:px-7">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4">

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    Hello, admin
                                </h1>

                                <p className="mt-1 text-sm text-white/65">
                                    System administrator dashboard
                                </p>
                            </div>

                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/admin/audit-logs")
                                }
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-2.5 text-sm font-semibold text-amber-200 transition-all hover:-translate-y-0.5 hover:border-amber-300/50 hover:bg-amber-400/20"
                            >
                                <span className="text-lg leading-none">
                                    ◉
                                </span>
                                Audit Logs
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/admin/tickets")
                                }
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-300/30 bg-indigo-400/10 px-5 py-2.5 text-sm font-semibold text-indigo-200 transition-all hover:-translate-y-0.5 hover:border-indigo-300/50 hover:bg-indigo-400/20"
                            >
                                <span className="text-lg leading-none">
                                    ✓
                                </span>
                                Ticket Management
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/requests")}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-purple-300/30 bg-purple-400/10 px-5 py-2.5 text-sm font-semibold text-purple-200 transition-all hover:-translate-y-0.5 hover:border-purple-300/50 hover:bg-purple-400/20"
                            >
    <span className="text-lg leading-none">
        ◈
    </span>
                                Asset Requests
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(true);
                                    setCreateError("");
                                }}
                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl"
                            >
                                <span className="text-lg leading-none">
                                    +
                                </span>
                                Create Asset
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="cursor-pointer rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/15"
                            >
                                Sign out
                            </button>

                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 backdrop-blur-md">
                        <span className="font-bold">!</span>
                        <span>{error}</span>
                    </div>
                )}

                {statusError && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 backdrop-blur-md">
                        <span className="font-bold">!</span>
                        <span>{statusError}</span>
                    </div>
                )}

                {statusSuccess && (
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200 backdrop-blur-md">
                        <span className="font-bold">✓</span>
                        <span>{statusSuccess}</span>
                    </div>
                )}

                {/* Create Asset */}
                {showCreateForm && (
                    <section className="mb-7 overflow-hidden rounded-3xl border border-white/15 bg-slate-950/40 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">

                        <div className="border-b border-white/10 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 px-6 py-6 sm:px-7">

                            <div className="flex items-start justify-between gap-4">

                                <div>
                                    <div className="mb-2 inline-flex rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                                        Inventory
                                    </div>

                                    <h2 className="text-xl font-bold text-white">
                                        Create Asset
                                    </h2>

                                    <p className="mt-1 text-sm text-white/60">
                                        Add a new asset to the inventory.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateForm(false)
                                    }
                                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl text-white/70 shadow-sm transition hover:bg-white/15 hover:text-white"
                                >
                                    ×
                                </button>

                            </div>
                        </div>

                        <form
                            onSubmit={handleCreateAsset}
                            className="grid grid-cols-1 gap-5 p-6 sm:p-7 md:grid-cols-2"
                        >
                            {/* Asset Tag */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Asset Tag
                                </label>

                                <input
                                    required
                                    value={newAsset.assetTag}
                                    onChange={(event) =>
                                        setNewAsset({
                                            ...newAsset,
                                            assetTag:
                                            event.target.value,
                                        })
                                    }
                                    placeholder="e.g. LAPTOP-003"
                                    className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/20 focus:border-indigo-400 focus:bg-white/[0.10] focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Asset Name */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Asset Name
                                </label>

                                <input
                                    required
                                    value={newAsset.name}
                                    onChange={(event) =>
                                        setNewAsset({
                                            ...newAsset,
                                            name:
                                            event.target.value,
                                        })
                                    }
                                    placeholder="e.g. Lenovo ThinkPad"
                                    className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/20 focus:border-indigo-400 focus:bg-white/[0.10] focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Category
                                </label>

                                <input
                                    value={newAsset.category}
                                    onChange={(event) =>
                                        setNewAsset({
                                            ...newAsset,
                                            category:
                                            event.target.value,
                                        })
                                    }
                                    placeholder="e.g. LAPTOP"
                                    className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/20 focus:border-indigo-400 focus:bg-white/[0.10] focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Manufacturer */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Manufacturer
                                </label>

                                <input
                                    value={newAsset.manufacturer}
                                    onChange={(event) =>
                                        setNewAsset({
                                            ...newAsset,
                                            manufacturer:
                                            event.target.value,
                                        })
                                    }
                                    placeholder="e.g. Lenovo"
                                    className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/20 focus:border-indigo-400 focus:bg-white/[0.10] focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Model */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Model
                                </label>

                                <input
                                    value={newAsset.model}
                                    onChange={(event) =>
                                        setNewAsset({
                                            ...newAsset,
                                            model:
                                            event.target.value,
                                        })
                                    }
                                    placeholder="e.g. ThinkPad E14"
                                    className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/35 hover:border-white/20 focus:border-indigo-400 focus:bg-white/[0.10] focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Status
                                </label>

                                <select
                                    value={newAsset.status}
                                    onChange={(event) =>
                                        setNewAsset({
                                            ...newAsset,
                                            status:
                                                event.target.value as AssetStatus,
                                        })
                                    }
                                    className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                >
                                    {STATUS_OPTIONS.map(
                                        (option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Assigned To */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Assigned To
                                </label>

                                <select
                                    value={newAsset.assignedTo}
                                    onChange={(event) =>
                                        setNewAsset({
                                            ...newAsset,
                                            assignedTo:
                                            event.target.value,
                                        })
                                    }
                                    className="h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                >
                                    <option value="">
                                        Select employee
                                    </option>

                                    {EMPLOYEE_OPTIONS.map(
                                        (employee) => (
                                            <option
                                                key={
                                                    employee.username
                                                }
                                                value={
                                                    employee.username
                                                }
                                            >
                                                {
                                                    employee.label
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Additional Asset Details */}
                            <div className="col-span-full mt-4">
                                <h3 className="mb-3 text-lg font-semibold text-white">
                                    Asset Details
                                </h3>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Serial Number
                                </label>
                                <input
                                    type="text"
                                    value={newAsset.serialNumber}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            serialNumber: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                    placeholder="Enter serial number"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Condition
                                </label>
                                <input
                                    type="text"
                                    value={newAsset.condition}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            condition: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                    placeholder="e.g. New, Good, Fair"
                                />
                            </div>

                            <div className="col-span-full mt-4">
                                <h3 className="mb-3 text-lg font-semibold text-white">
                                    Purchase & Warranty
                                </h3>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Purchase Date
                                </label>
                                <input
                                    type="date"
                                    value={newAsset.purchaseDate}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            purchaseDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Warranty Start Date
                                </label>
                                <input
                                    type="date"
                                    value={newAsset.warrantyStartDate}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            warrantyStartDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Warranty Expiry Date
                                </label>
                                <input
                                    type="date"
                                    value={newAsset.warrantyExpiryDate}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            warrantyExpiryDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Asset Expiry Date
                                </label>
                                <input
                                    type="date"
                                    value={newAsset.assetExpiryDate}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            assetExpiryDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Vendor / Supplier
                                </label>
                                <input
                                    type="text"
                                    value={newAsset.vendor}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            vendor: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                    placeholder="Enter vendor or supplier"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Purchase Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newAsset.purchasePrice}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            purchasePrice: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                    placeholder="Enter purchase price"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Invoice Number
                                </label>
                                <input
                                    type="text"
                                    value={newAsset.invoiceNumber}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            invoiceNumber: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                    placeholder="Enter invoice number"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Purchase Order Number
                                </label>
                                <input
                                    type="text"
                                    value={newAsset.purchaseOrderNumber}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            purchaseOrderNumber: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                    placeholder="Enter purchase order number"
                                />
                            </div>

                            <div className="col-span-full mt-4">
                                <h3 className="mb-3 text-lg font-semibold text-white">
                                    Assignment & Location
                                </h3>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Assigned Date
                                </label>
                                <input
                                    type="date"
                                    value={newAsset.assignedDate}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            assignedDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={newAsset.location}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            location: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                    placeholder="Enter asset location"
                                />
                            </div>

                            <div className="col-span-full mt-4">
                                <h3 className="mb-3 text-lg font-semibold text-white">
                                    Maintenance
                                </h3>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Last Maintenance Date
                                </label>
                                <input
                                    type="date"
                                    value={newAsset.lastMaintenanceDate}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            lastMaintenanceDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-slate-300">
                                    Next Maintenance Date
                                </label>
                                <input
                                    type="date"
                                    value={newAsset.nextMaintenanceDate}
                                    onChange={(e) =>
                                        setNewAsset({
                                            ...newAsset,
                                            nextMaintenanceDate: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white"
                                />
                            </div>

                            {/* Create Error */}
                            {createError && (
                                <div className="md:col-span-2 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    <span className="font-bold">
                                        !
                                    </span>
                                    <span>{createError}</span>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="md:col-span-2 flex justify-end gap-3 border-t border-white/10 pt-5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCreateForm(false)
                                    }
                                    className="cursor-pointer rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:from-indigo-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create Asset"}
                                </button>

                            </div>
                        </form>
                    </section>
                )}

                {/* Statistics */}
                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

                    <StatCard
                        title="Total Assets"
                        value={total}
                        icon="▦"
                        color="indigo"
                    />

                    <StatCard
                        title="In Stock"
                        value={inStock}
                        icon="✓"
                        color="green"
                    />

                    <StatCard
                        title="Assigned"
                        value={assigned}
                        icon="●"
                        color="blue"
                    />

                    <StatCard
                        title="In Repair"
                        value={inRepair}
                        icon="↻"
                        color="orange"
                    />

                    <StatCard
                        title="Retired"
                        value={retired}
                        icon="—"
                        color="red"
                    />

                </div>

                {/* Asset Quantity Breakdown */}
                <section
                    id="asset-quantity-breakdown"
                    className="mb-7 rounded-3xl border border-white/15 bg-white/[0.07] shadow-[0_20px_70px_rgba(0,0,0,0.20)] backdrop-blur-xl"
                >

                    <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-6 sm:px-7 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Asset Quantity Breakdown
                            </h2>

                            <p className="mt-1 text-sm text-white/60">
                                Automatically calculated from the registered assets.
                            </p>
                        </div>

                        <div className="rounded-full border border-indigo-300/20 bg-indigo-400/10 px-4 py-2 text-sm font-bold text-indigo-200">
                            Total Quantity: {totalQuantity}
                        </div>

                    </div>

                    {quantityLoading ? (
                        <div className="px-6 py-10 text-center text-sm text-white/60">
                            Loading quantities...
                        </div>
                    ) : quantityError ? (
                        <div className="px-6 py-10 text-center text-sm text-red-300">
                            {quantityError}
                        </div>
                    ) : assetQuantities.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-white/60">
                            No asset quantities available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-7">

                            {assetQuantities.map((item) => (
                                <div
                                    key={`${item.name}-${item.category}-${item.manufacturer}-${item.model}`}
                                    className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 transition hover:-translate-y-0.5 hover:border-indigo-300/30 hover:bg-indigo-400/10 hover:shadow-lg hover:shadow-indigo-950/20"
                                >

                                    <div className="flex items-center justify-between gap-4">

                                        <div className="min-w-0">

                                            <h3 className="truncate text-base font-bold text-white">
                                                {item.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-white/60">
                                                {item.manufacturer || "Unknown manufacturer"}
                                            </p>

                                            {item.model && (
                                                <p className="mt-1 text-xs text-white/40">
                                                    {item.model}
                                                </p>
                                            )}

                                            {item.category && (
                                                <span className="mt-2 inline-flex rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70">
                                                    {item.category}
                                                </span>
                                            )}

                                        </div>

                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-500/15 text-2xl font-bold text-indigo-200">
                                            {item.quantity}
                                        </div>

                                    </div>

                                    <div className="mt-4 border-t border-white/10 pt-3">

                                        <p className="text-xs font-medium text-white/40">
                                            Available quantity
                                        </p>

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}
                </section>

                {/* Assets */}
                <section className="overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] shadow-[0_20px_70px_rgba(0,0,0,0.20)] backdrop-blur-xl">

                    <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-6 sm:px-7 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Assets
                            </h2>

                            <p className="mt-1 text-sm text-white/60">
                                Current asset inventory and lifecycle status
                            </p>
                        </div>

                        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/65">
                            {total} total
                        </div>

                    </div>

                    {loading ? (
                        <div className="px-6 py-16 text-center text-sm text-white/60">
                            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-300/20 border-t-indigo-400" />
                            Loading assets...
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="px-6 py-16 text-center">

                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-400/10 text-2xl text-indigo-200">
                                ▦
                            </div>

                            <p className="text-sm font-semibold text-white/80">
                                No assets found.
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                                Create an asset to populate your inventory.
                            </p>

                        </div>
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1050px] text-left text-sm">

                                <thead className="bg-black/10 text-[11px] uppercase tracking-wider text-white/45">

                                <tr>

                                    <th className="px-6 py-4">
                                        Asset Tag
                                    </th>

                                    <th className="px-6 py-4">
                                        Name
                                    </th>

                                    <th className="px-6 py-4">
                                        Category
                                    </th>

                                    <th className="px-6 py-4">
                                        Manufacturer
                                    </th>

                                    <th className="px-6 py-4">
                                        Status
                                    </th>

                                    <th className="px-6 py-4">
                                        Assigned To
                                    </th>

                                    <th className="px-6 py-4">
                                        Action
                                    </th>

                                </tr>

                                </thead>

                                <tbody className="divide-y divide-white/10">

                                {assets.map((asset) => {

                                    const selectedStatus =
                                        selectedStatuses[asset.id] ??
                                        asset.status;

                                    const selectedEmployee =
                                        selectedEmployees[asset.id] ??
                                        asset.assignedTo ??
                                        "";

                                    const isUpdating =
                                        updatingAssetId === asset.id;

                                    return (
                                        <tr
                                            key={asset.id}
                                            className="group transition hover:bg-indigo-400/[0.06]"
                                        >

                                            <td className="px-6 py-5">

                                                <div className="font-bold text-white">
                                                    {asset.assetTag}
                                                </div>

                                            </td>

                                            <td className="px-6 py-5">

                                                <div className="font-medium text-white/80">
                                                    {asset.name}
                                                </div>

                                                {asset.model && (
                                                    <div className="mt-0.5 text-xs text-white/40">
                                                        {asset.model}
                                                    </div>
                                                )}

                                            </td>

                                            <td className="px-6 py-5">

                                                {asset.category ? (
                                                    <span className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/65">
                                                        {asset.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-white/30">
                                                        -
                                                    </span>
                                                )}

                                            </td>

                                            <td className="px-6 py-5 text-white/55">
                                                {asset.manufacturer ?? "-"}
                                            </td>

                                            <td className="px-6 py-5">

                                                <StatusBadge
                                                    status={asset.status}
                                                />

                                            </td>

                                            <td className="px-6 py-5">

                                                {asset.assignedTo ? (
                                                    <div className="flex items-center gap-2">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 text-xs font-bold uppercase text-indigo-200">
                                                            {asset.assignedTo.charAt(0)}
                                                        </div>

                                                        <span className="font-medium text-white/75">
                                                            {asset.assignedTo}
                                                        </span>

                                                    </div>
                                                ) : (
                                                    <span className="text-white/30">
                                                        -
                                                    </span>
                                                )}

                                            </td>

                                            <td className="px-6 py-5">

                                                <div className="flex min-w-[450px] items-center gap-2">

                                                    <select
                                                        value={
                                                            selectedStatus
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusSelection(
                                                                asset.id,
                                                                event.target
                                                                    .value as AssetStatus
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating
                                                        }
                                                        className="h-9 cursor-pointer rounded-lg border border-white/10 bg-slate-900/80 px-3 text-xs font-medium text-white/80 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-100"
                                                    >

                                                        {STATUS_OPTIONS.map(
                                                            (
                                                                option
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            )
                                                        )}

                                                    </select>

                                                    {selectedStatus ===
                                                        "ASSIGNED" && (
                                                            <select
                                                                value={
                                                                    selectedEmployee
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleEmployeeSelection(
                                                                        asset.id,
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                                className="h-9 cursor-pointer rounded-lg border border-white/10 bg-slate-900/80 px-3 text-xs font-medium text-white/80 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-100"
                                                            >

                                                                <option
                                                                    value=""
                                                                >
                                                                    Select employee
                                                                </option>

                                                                {EMPLOYEE_OPTIONS.map(
                                                                    (
                                                                        employee
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                employee.username
                                                                            }
                                                                            value={
                                                                                employee.username
                                                                            }
                                                                        >
                                                                            {
                                                                                employee.label
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}

                                                            </select>
                                                        )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateStatus(
                                                                asset
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating ||
                                                            (
                                                                selectedStatus ===
                                                                asset.status &&
                                                                selectedEmployee ===
                                                                (
                                                                    asset.assignedTo ??
                                                                    ""
                                                                )
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/25 disabled:opacity-100"
                                                    >
                                                        {isUpdating
                                                            ? "Updating..."
                                                            : "Update"}
                                                    </button>

                                                    <div className="relative">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setOpenActionMenuId((current) =>
                                                                    current === asset.id
                                                                        ? null
                                                                        : asset.id
                                                                )
                                                            }
                                                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-indigo-300/20 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-200 transition hover:border-indigo-300/40 hover:bg-indigo-500/20"
                                                        >
                                                            Actions
                                                            <svg
                                                                className={`h-4 w-4 transition-transform ${
                                                                    openActionMenuId === asset.id
                                                                        ? "rotate-180"
                                                                        : ""
                                                                }`}
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                                aria-hidden="true"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {openActionMenuId === asset.id && (
                                                            <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-indigo-300/20 bg-[#171b3a] p-1.5 shadow-2xl">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setOpenActionMenuId(null);
                                                                        setSelectedAsset(asset);
                                                                    }}
                                                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/80 transition hover:bg-indigo-500/15 hover:text-white"
                                                                >
                                                                    Details
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setOpenActionMenuId(null);
                                                                        handleEditAsset(asset);
                                                                    }}
                                                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/80 transition hover:bg-indigo-500/15 hover:text-white"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setOpenActionMenuId(null);
                                                                        handleViewHistory(asset);
                                                                    }}
                                                                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/80 transition hover:bg-indigo-500/15 hover:text-white"
                                                                >
                                                                    History
                                                                </button>
                                                            </div>
                                                        )}

                                                    </div>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </div>

            {/* STATUS HISTORY MODAL */}
            {showHistory && historyAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md">

                    <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_25px_100px_rgba(0,0,0,0.50)]">

                        <div className="flex items-start justify-between border-b border-white/10 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 px-6 py-6">

                            <div>

                                <div className="mb-2 inline-flex rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                                    Asset History
                                </div>

                                <h2 className="text-xl font-bold text-white">
                                    Status History
                                </h2>

                                <p className="mt-1 text-sm text-white/60">
                                    {historyAsset.assetTag} —{" "}
                                    {historyAsset.name}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeHistory}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl text-white/60 shadow-sm transition hover:bg-white/15 hover:text-white"
                            >
                                ×
                            </button>

                        </div>

                        <div className="max-h-[500px] overflow-y-auto px-6 py-6">

                            {historyLoading && (
                                <div className="py-12 text-center text-sm text-white/60">

                                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-300/20 border-t-indigo-400" />

                                    Loading status history...

                                </div>
                            )}

                            {historyError && (
                                <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">

                                    <span className="font-bold">
                                        !
                                    </span>

                                    <span>{historyError}</span>

                                </div>
                            )}

                            {!historyLoading &&
                                !historyError &&
                                history.length === 0 && (
                                    <div className="py-12 text-center">

                                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl text-white/40">
                                            ↻
                                        </div>

                                        <p className="text-sm font-semibold text-white/75">
                                            No status history found.
                                        </p>

                                    </div>
                                )}

                            {!historyLoading &&
                                !historyError &&
                                history.length > 0 && (
                                    <div className="overflow-hidden rounded-2xl border border-white/10">

                                        <table className="w-full text-left text-sm">

                                            <thead className="bg-white/[0.05] text-[11px] uppercase tracking-wider text-white/45">

                                            <tr>

                                                <th className="px-4 py-3">
                                                    Previous Status
                                                </th>

                                                <th className="px-4 py-3">
                                                    New Status
                                                </th>

                                                <th className="px-4 py-3">
                                                    Changed At
                                                </th>

                                            </tr>

                                            </thead>

                                            <tbody className="divide-y divide-white/10">

                                            {history.map(
                                                (entry) => (
                                                    <tr
                                                        key={
                                                            entry.id
                                                        }
                                                        className="hover:bg-indigo-400/[0.06]"
                                                    >

                                                        <td className="px-4 py-4 text-white/60">
                                                            {entry.oldStatus
                                                                ? formatStatus(
                                                                    entry.oldStatus
                                                                )
                                                                : "—"}
                                                        </td>

                                                        <td className="px-4 py-4">

                                                            <StatusBadge
                                                                status={
                                                                    entry.newStatus
                                                                }
                                                            />

                                                        </td>

                                                        <td className="px-4 py-4 text-white/50">
                                                            {formatDate(
                                                                entry.changedAt
                                                            )}
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                            </tbody>

                                        </table>

                                    </div>
                                )}

                        </div>

                        <div className="flex justify-end border-t border-white/10 bg-white/[0.03] px-6 py-4">

                            <button
                                type="button"
                                onClick={closeHistory}
                                className="cursor-pointer rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Asset Details
                                </h2>

                                <p className="mt-1 text-sm text-white/50">
                                    {selectedAsset.assetTag} — {selectedAsset.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedAsset(null)}
                                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                            >
                                Close
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Serial Number
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.serialNumber || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Condition
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.condition || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Purchase Date
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.purchaseDate || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Warranty Start Date
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.warrantyStartDate || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Warranty Expiry Date
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.warrantyExpiryDate || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Asset Expiry Date
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.assetExpiryDate || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Vendor / Supplier
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.vendor || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Purchase Price
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.purchasePrice !== null
                                        ? selectedAsset.purchasePrice.toLocaleString()
                                        : "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Invoice Number
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.invoiceNumber || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Purchase Order Number
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.purchaseOrderNumber || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Assigned Date
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.assignedDate || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Location
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.location || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Last Maintenance Date
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.lastMaintenanceDate || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-xs text-white/40">
                                    Next Maintenance Date
                                </p>
                                <p className="mt-1 text-white">
                                    {selectedAsset.nextMaintenanceDate || "—"}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* EDIT ASSET MODAL */}
            {editingAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-md">

                    <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_25px_100px_rgba(0,0,0,0.50)]">

                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-white/10 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 px-6 py-6">

                            <div>
                                <div className="mb-2 inline-flex rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                                    Edit Asset
                                </div>

                                <h2 className="text-xl font-bold text-white">
                                    Edit Asset Details
                                </h2>

                                <p className="mt-1 text-sm text-white/60">
                                    {editingAsset.assetTag} — {editingAsset.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditingAsset(null);
                                    setEditError("");
                                }}
                                disabled={updatingDetails}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl text-white/60 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                ×
                            </button>

                        </div>

                        {/* Form */}
                        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">

                            {/* Read-only Asset Information */}
                            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/50">
                                    Asset Information
                                </h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                    <div>
                                        <label className="text-xs font-medium text-white/45">
                                            Asset Tag
                                        </label>
                                        <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70">
                                            {editingAsset.assetTag}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-white/45">
                                            Name
                                        </label>
                                        <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70">
                                            {editingAsset.name}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-white/45">
                                            Status
                                        </label>
                                        <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70">
                                            {editingAsset.status}
                                        </div>
                                    </div>

                                </div>

                            </div>

                            {/* Editable Fields */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                {/* Serial Number */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Serial Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.serialNumber}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                serialNumber: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Condition
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.condition}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                condition: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Purchase Date */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.purchaseDate}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                purchaseDate: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Warranty Start */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Warranty Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.warrantyStartDate}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                warrantyStartDate: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Warranty Expiry */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Warranty Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.warrantyExpiryDate}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                warrantyExpiryDate: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Asset Expiry */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Asset Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.assetExpiryDate}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                assetExpiryDate: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Vendor */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Vendor
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.vendor}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                vendor: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Purchase Price */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Purchase Price
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editForm.purchasePrice}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                purchasePrice: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Invoice Number */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Invoice Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.invoiceNumber}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                invoiceNumber: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Purchase Order */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Purchase Order Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.purchaseOrderNumber}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                purchaseOrderNumber: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Assigned Date */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Assigned Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.assignedDate}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                assignedDate: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                location: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Last Maintenance */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Last Maintenance Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.lastMaintenanceDate}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                lastMaintenanceDate: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                                {/* Next Maintenance */}
                                <div>
                                    <label className="text-xs font-medium text-white/55">
                                        Next Maintenance Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.nextMaintenanceDate}
                                        onChange={(event) =>
                                            setEditForm((current) => ({
                                                ...current,
                                                nextMaintenanceDate: event.target.value,
                                            }))
                                        }
                                        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>

                            </div>

                            {/* Error */}
                            {editError && (
                                <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {editError}
                                </div>
                            )}

                            {/* Success */}
                            {editSuccess && (
                                <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                    {editSuccess}
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() => {
                                    setEditingAsset(null);
                                    setEditError("");
                                }}
                                disabled={updatingDetails}
                                className="rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveAssetDetails}
                                disabled={updatingDetails}
                                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updatingDetails
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </main>
    );
}

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

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function StatusBadge({
                         status,
                     }: {
    status: AssetStatus;
}) {
    const styles = {
        IN_STOCK: "bg-emerald-400/10 text-emerald-300 ring-emerald-300/20",
        ASSIGNED: "bg-blue-400/10 text-blue-300 ring-blue-300/20",
        IN_REPAIR: "bg-orange-400/10 text-orange-300 ring-orange-300/20",
        RETIRED: "bg-red-400/10 text-red-300 ring-red-300/20",
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
        >
            {formatStatus(status)}
        </span>
    );
}

function StatCard({
                      title,
                      value,
                      icon,
                      color,
                  }: {
    title: string;
    value: number;
    icon: string;
    color: "indigo" | "green" | "blue" | "orange" | "red";
}) {
    const styles = {
        indigo: {
            wrapper:
                "border-indigo-300/20 bg-indigo-400/[0.09]",
            icon:
                "bg-indigo-400/15 text-indigo-200 ring-indigo-300/20",
            value:
                "text-white",
        },
        green: {
            wrapper:
                "border-emerald-300/20 bg-emerald-400/[0.09]",
            icon:
                "bg-emerald-400/15 text-emerald-200 ring-emerald-300/20",
            value:
                "text-white",
        },
        blue: {
            wrapper:
                "border-blue-300/20 bg-blue-400/[0.09]",
            icon:
                "bg-blue-400/15 text-blue-200 ring-blue-300/20",
            value:
                "text-white",
        },
        orange: {
            wrapper:
                "border-orange-300/20 bg-orange-400/[0.09]",
            icon:
                "bg-orange-400/15 text-orange-200 ring-orange-300/20",
            value:
                "text-white",
        },
        red: {
            wrapper:
                "border-red-300/20 bg-red-400/[0.09]",
            icon:
                "bg-red-400/15 text-red-200 ring-red-300/20",
            value:
                "text-white",
        },
    };

    const style = styles[color];

    return (
        <div
            className={`rounded-3xl border px-5 py-5 shadow-[0_15px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/[0.12] hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] ${style.wrapper}`}
        >

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-white/60">
                        {title}
                    </p>

                    <p
                        className={`mt-2 text-3xl font-bold tracking-tight ${style.value}`}
                    >
                        {value}
                    </p>

                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold ring-1 ${style.icon}`}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}
