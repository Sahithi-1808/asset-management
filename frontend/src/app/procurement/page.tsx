"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8084/api/v1";

type AssetRequest = {
    id: string;
    requestNumber: string;
    requesterUsername: string;
    employeeUsername: string;
    assetId: string;
    assetName: string | null;
    assetTag: string | null;
    quantity: number;
    priority: string;
    businessJustification: string;
    requiredFrom: string | null;
    requiredTo: string | null;
    location: string | null;
    status: string;
    approverUsername: string | null;
    approvalComment: string | null;
    approvedAt: string | null;
    requiresFinanceApproval: boolean;
    financeUsername: string | null;
    financeComment: string | null;
    financeApprovedAt: string | null;
    assignedUsername: string | null;
    fulfilledAt: string | null;
    closedBy: string | null;
    closedAt: string | null;
    closureNote: string | null;
    createdAt: string;
    updatedAt: string;
};

type ProcurementData = {
    id: string;
    requestId: string;
    vendorName: string | null;
    vendorContact: string | null;
    quotationNumber: string | null;
    quotationAmount: number | null;
    currency: string | null;
    purchaseOrderNumber: string | null;
    expectedDeliveryDate: string | null;
    status: string;
    remarks: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};

export default function ProcurementPage() {
    const [requests, setRequests] = useState<AssetRequest[]>([]);
    const [selectedRequest, setSelectedRequest] =
        useState<AssetRequest | null>(null);

    const [requestId, setRequestId] = useState("");
    const [procurement, setProcurement] =
        useState<ProcurementData | null>(null);

    const [vendorName, setVendorName] = useState("");
    const [vendorContact, setVendorContact] = useState("");
    const [quotationNumber, setQuotationNumber] = useState("");
    const [quotationAmount, setQuotationAmount] = useState("");
    const [currency, setCurrency] = useState("INR");
    const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
    const [remarks, setRemarks] = useState("");

    const [loadingRequests, setLoadingRequests] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const getToken = () => {
        if (typeof window === "undefined") {
            return null;
        }

        return sessionStorage.getItem("token");
    };

    const getHeaders = () => {
        const token = getToken();

        return {
            "Content-Type": "application/json",
            ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                }
                : {}),
        };
    };

    /*
     * Load Asset Requests visible to Procurement.
     */
    const loadRequests = async () => {
        setLoadingRequests(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE}/asset-requests`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Unable to load asset requests (${response.status}).`
                );
            }

            setRequests(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(
                err?.message ||
                "Failed to load asset requests."
            );
        } finally {
            setLoadingRequests(false);
        }
    };

    /*
     * Load automatically when Procurement page opens.
     */
    useEffect(() => {
        loadRequests();
    }, []);

    /*
     * Load procurement record for selected Asset Request.
     */
    const loadProcurement = async (
        assetRequest: AssetRequest
    ) => {
        setSelectedRequest(assetRequest);
        setRequestId(assetRequest.id);

        setLoading(true);
        setError("");
        setMessage("");
        setProcurement(null);

        try {
            const response = await fetch(
                `${API_BASE}/asset-requests/${assetRequest.id}/procurement`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            const data = await response.json().catch(() => null);

            /*
             * Backend may return either:
             * 404
             * or an error message containing
             * "Procurement record was not found"
             *
             * Both cases mean that this is a new
             * procurement request.
             */
            const errorMessage =
                data?.message ||
                data?.error ||
                "";

            if (
                response.status === 404 ||
                errorMessage
                    .toLowerCase()
                    .includes(
                        "procurement record was not found"
                    )
            ) {
                clearProcurementForm();

                setMessage(
                    "This asset request is ready for procurement. Create the procurement record below."
                );

                return;
            }

            if (!response.ok) {
                throw new Error(
                    errorMessage ||
                    `Unable to load procurement record (${response.status}).`
                );
            }

            setProcurement(data);

            setVendorName(data.vendorName || "");
            setVendorContact(data.vendorContact || "");
            setQuotationNumber(data.quotationNumber || "");

            setQuotationAmount(
                data.quotationAmount !== null &&
                data.quotationAmount !== undefined
                    ? String(data.quotationAmount)
                    : ""
            );

            setCurrency(data.currency || "INR");

            setPurchaseOrderNumber(
                data.purchaseOrderNumber || ""
            );

            setExpectedDeliveryDate(
                data.expectedDeliveryDate || ""
            );

            setRemarks(data.remarks || "");

            setMessage(
                "Procurement record loaded successfully."
            );
        } catch (err: any) {
            setError(
                err?.message ||
                "Failed to load procurement record."
            );
        } finally {
            setLoading(false);
        }
    };

    const clearProcurementForm = () => {
        setProcurement(null);
        setVendorName("");
        setVendorContact("");
        setQuotationNumber("");
        setQuotationAmount("");
        setCurrency("INR");
        setPurchaseOrderNumber("");
        setExpectedDeliveryDate("");
        setRemarks("");
    };

    const createProcurement = async () => {
        if (!requestId.trim()) {
            setError("Please select an Asset Request.");
            return;
        }

        setActionLoading("create");
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_BASE}/asset-requests/${requestId}/procurement`,
                {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        vendorName: vendorName || null,
                        vendorContact: vendorContact || null,
                        quotationNumber:
                            quotationNumber || null,
                        quotationAmount:
                            quotationAmount
                                ? Number(quotationAmount)
                                : null,
                        currency: currency || null,
                        purchaseOrderNumber:
                            purchaseOrderNumber
                                ? purchaseOrderNumber.trim()
                                : null,
                        expectedDeliveryDate:
                            expectedDeliveryDate || null,
                        status: "PENDING",
                        remarks: remarks || null,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Unable to create procurement record (${response.status}).`
                );
            }

            setProcurement(data);

            /*
             * Keep the form synchronized with the
             * persisted backend response.
             */
            setVendorName(data.vendorName || "");
            setVendorContact(data.vendorContact || "");
            setQuotationNumber(data.quotationNumber || "");

            setQuotationAmount(
                data.quotationAmount !== null &&
                data.quotationAmount !== undefined
                    ? String(data.quotationAmount)
                    : ""
            );

            setCurrency(data.currency || "INR");

            setPurchaseOrderNumber(
                data.purchaseOrderNumber || ""
            );

            setExpectedDeliveryDate(
                data.expectedDeliveryDate || ""
            );

            setRemarks(data.remarks || "");

            setMessage(
                "Procurement record created successfully."
            );

            await loadRequests();
        } catch (err: any) {
            setError(
                err?.message ||
                "Failed to create procurement record."
            );
        } finally {
            setActionLoading("");
        }
    };

    const updateProcurement = async () => {
        if (!requestId.trim()) {
            setError("Please select an Asset Request.");
            return;
        }

        setActionLoading("update");
        setError("");
        setMessage("");

        try {
            console.log("========== FRONTEND PROCUREMENT UPDATE ==========");
            console.log("requestId:", requestId);
            console.log("purchaseOrderNumber state:", purchaseOrderNumber);
            console.log("purchaseOrderNumber trimmed:", purchaseOrderNumber.trim());
            console.log("===============================================");
            const response = await fetch(
                `${API_BASE}/asset-requests/${requestId}/procurement`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        vendorName: vendorName || null,
                        vendorContact: vendorContact || null,
                        quotationNumber:
                            quotationNumber || null,
                        quotationAmount:
                            quotationAmount
                                ? Number(quotationAmount)
                                : null,
                        currency: currency || null,
                        purchaseOrderNumber:
                            purchaseOrderNumber
                                ? purchaseOrderNumber.trim()
                                : null,
                        expectedDeliveryDate:
                            expectedDeliveryDate || null,
                        remarks: remarks || null,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Unable to update procurement record (${response.status}).`
                );
            }

            setProcurement(data);

            setVendorName(data.vendorName || "");
            setVendorContact(data.vendorContact || "");
            setQuotationNumber(data.quotationNumber || "");

            setQuotationAmount(
                data.quotationAmount !== null &&
                data.quotationAmount !== undefined
                    ? String(data.quotationAmount)
                    : ""
            );

            setCurrency(data.currency || "INR");

            setPurchaseOrderNumber(
                data.purchaseOrderNumber || ""
            );

            setExpectedDeliveryDate(
                data.expectedDeliveryDate || ""
            );

            setRemarks(data.remarks || "");

            setMessage(
                "Procurement details updated successfully."
            );
        } catch (err: any) {
            setError(
                err?.message ||
                "Failed to update procurement record."
            );
        } finally {
            setActionLoading("");
        }
    };

    /*
     * Perform procurement workflow actions.
     *
     * For START and PURCHASE-ORDER:
     * first persist the current form values using PUT.
     *
     * This guarantees that purchaseOrderNumber is stored
     * in the database before the purchase-order action
     * validates it.
     */
    const performAction = async (
        action: "start" | "purchase-order" | "order" | "receive"
    ) => {
        if (!requestId.trim()) {
            setError("Please select an Asset Request.");
            return;
        }

        /*
         * START and PURCHASE ORDER require the current
         * procurement form to be persisted first.
         */
        if (
            action === "start" ||
            action === "purchase-order"
        ) {
            if (!purchaseOrderNumber.trim()) {
                setError(
                    "Please enter a Purchase Order Number before continuing."
                );
                return;
            }

            setActionLoading(action);
            setError("");
            setMessage("");

            try {
                /*
                 * Step 1:
                 * Save current procurement details.
                 */
                const updateResponse = await fetch(
                    `${API_BASE}/asset-requests/${requestId}/procurement`,
                    {
                        method: "PUT",
                        headers: getHeaders(),
                        body: JSON.stringify({
                            vendorName:
                                vendorName || null,
                            vendorContact:
                                vendorContact || null,
                            quotationNumber:
                                quotationNumber || null,
                            quotationAmount:
                                quotationAmount
                                    ? Number(
                                        quotationAmount
                                    )
                                    : null,
                            currency:
                                currency || null,
                            purchaseOrderNumber:
                                purchaseOrderNumber.trim(),
                            expectedDeliveryDate:
                                expectedDeliveryDate ||
                                null,
                            remarks:
                                remarks || null,
                        }),
                    }
                );

                const updateData =
                    await updateResponse
                        .json()
                        .catch(() => null);

                if (!updateResponse.ok) {
                    throw new Error(
                        updateData?.message ||
                        updateData?.error ||
                        `Unable to save procurement details (${updateResponse.status}).`
                    );
                }

                /*
                 * Update local procurement state with
                 * the persisted backend response.
                 */
                setProcurement(updateData);

                /*
                 * Step 2:
                 * Perform the requested workflow action.
                 */
                const response = await fetch(
                    `${API_BASE}/asset-requests/${requestId}/procurement/${action}`,
                    {
                        method: "POST",
                        headers: getHeaders(),
                    }
                );

                const data =
                    await response
                        .json()
                        .catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        data?.error ||
                        `Action failed (${response.status}).`
                    );
                }

                setProcurement(data);

                /*
                 * Keep the PO number and other fields
                 * synchronized with the backend response.
                 */
                setVendorName(
                    data.vendorName || ""
                );

                setVendorContact(
                    data.vendorContact || ""
                );

                setQuotationNumber(
                    data.quotationNumber || ""
                );

                setQuotationAmount(
                    data.quotationAmount !== null &&
                    data.quotationAmount !== undefined
                        ? String(data.quotationAmount)
                        : ""
                );

                setCurrency(
                    data.currency || "INR"
                );

                setPurchaseOrderNumber(
                    data.purchaseOrderNumber || ""
                );

                setExpectedDeliveryDate(
                    data.expectedDeliveryDate || ""
                );

                setRemarks(
                    data.remarks || ""
                );

                setMessage(
                    action === "start"
                        ? "Procurement started successfully."
                        : "Purchase order created successfully."
                );

                /*
                 * Refresh parent Asset Request list.
                 */
                await loadRequests();
            } catch (err: any) {
                setError(
                    err?.message ||
                    "Procurement action failed."
                );
            } finally {
                setActionLoading("");
            }

            return;
        }

        /*
         * ORDER and RECEIVE do not require the form
         * to be saved again.
         */
        setActionLoading(action);
        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_BASE}/asset-requests/${requestId}/procurement/${action}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                }
            );

            const data =
                await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Action failed (${response.status}).`
                );
            }

            setProcurement(data);

            setVendorName(
                data.vendorName || ""
            );

            setVendorContact(
                data.vendorContact || ""
            );

            setQuotationNumber(
                data.quotationNumber || ""
            );

            setQuotationAmount(
                data.quotationAmount !== null &&
                data.quotationAmount !== undefined
                    ? String(data.quotationAmount)
                    : ""
            );

            setCurrency(
                data.currency || "INR"
            );

            setPurchaseOrderNumber(
                data.purchaseOrderNumber || ""
            );

            setExpectedDeliveryDate(
                data.expectedDeliveryDate || ""
            );

            setRemarks(
                data.remarks || ""
            );

            setMessage(
                action === "order"
                    ? "Order placed successfully."
                    : "Asset received successfully."
            );

            /*
             * Refresh parent Asset Request list.
             */
            await loadRequests();
        } catch (err: any) {
            setError(
                err?.message ||
                "Procurement action failed."
            );
        } finally {
            setActionLoading("");
        }
    };

    const isStatus = (status: string) =>
        procurement?.status === status;

    const canStart = isStatus("PENDING");

    const canCreatePO =
        isStatus("QUOTATION_RECEIVED");

    const canOrder =
        isStatus("PO_CREATED");

    const canReceive =
        isStatus("ORDERED");

    const inputClass =
        "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Procurement
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Manage asset procurement requests.
                    </p>
                </div>

                {/* Procurement Requests */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Procurement Requests
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Select an asset request that is ready for procurement.
                            </p>
                        </div>

                        <button
                            onClick={loadRequests}
                            disabled={loadingRequests}
                            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-black hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loadingRequests
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>
                    </div>

                    {loadingRequests &&
                        requests.length === 0 && (
                            <div className="mt-6 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-black">
                                Loading procurement requests...
                            </div>
                        )}

                    {!loadingRequests &&
                        requests.length === 0 && (
                            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                <p className="text-sm font-medium text-black">
                                    No procurement requests found.
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                    Requests will appear here after they reach PROCUREMENT_PENDING.
                                </p>
                            </div>
                        )}

                    {requests.length > 0 && (
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                <tr className="border-b border-slate-200 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Request
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Asset
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Employee
                                    </th>

                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Action
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {requests.map((request) => {
                                    const isSelected =
                                        selectedRequest?.id ===
                                        request.id;

                                    return (
                                        <tr
                                            key={request.id}
                                            className={`border-b border-slate-100 last:border-0 ${
                                                isSelected
                                                    ? "bg-blue-50"
                                                    : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-black">
                                                    {request.requestNumber}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    Qty:{" "}
                                                    {request.quantity}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="font-medium text-black">
                                                    {request.assetName ||
                                                        "Unknown Asset"}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    {request.assetTag ||
                                                        "-"}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-black">
                                                {
                                                    request.employeeUsername
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    {request.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() =>
                                                        loadProcurement(
                                                            request
                                                        )
                                                    }
                                                    disabled={
                                                        loading &&
                                                        isSelected
                                                    }
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-black hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {loading &&
                                                    isSelected
                                                        ? "Loading..."
                                                        : "Manage"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Messages */}
                {message && (
                    <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Selected Asset Request */}
                {selectedRequest && (
                    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Selected Asset Request
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {
                                        selectedRequest.requestNumber
                                    }{" "}
                                    ·{" "}
                                    {
                                        selectedRequest.assetName
                                    }
                                </p>
                            </div>

                            <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                                {selectedRequest.status}
                            </span>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Request
                                </p>

                                <p className="mt-1 text-sm font-semibold text-black">
                                    {
                                        selectedRequest.requestNumber
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Asset
                                </p>

                                <p className="mt-1 text-sm text-black">
                                    {
                                        selectedRequest.assetName ||
                                        "-"
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Asset Tag
                                </p>

                                <p className="mt-1 text-sm text-black">
                                    {
                                        selectedRequest.assetTag ||
                                        "-"
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Employee
                                </p>

                                <p className="mt-1 text-sm text-black">
                                    {
                                        selectedRequest.employeeUsername
                                    }
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Procurement Details */}
                {selectedRequest && (
                    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Procurement Details
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Vendor, quotation and purchase order
                                    information.
                                </p>
                            </div>

                            {procurement && (
                                <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                                    {procurement.status}
                                </span>
                            )}
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            {/* Vendor */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Vendor Name
                                </label>

                                <input
                                    value={vendorName}
                                    onChange={(e) =>
                                        setVendorName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Dell Technologies"
                                    className={inputClass}
                                />
                            </div>

                            {/* Vendor Contact */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Vendor Contact
                                </label>

                                <input
                                    value={vendorContact}
                                    onChange={(e) =>
                                        setVendorContact(
                                            e.target.value
                                        )
                                    }
                                    placeholder="vendor@example.com"
                                    className={inputClass}
                                />
                            </div>

                            {/* Quotation */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Quotation Number
                                </label>

                                <input
                                    value={quotationNumber}
                                    onChange={(e) =>
                                        setQuotationNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="QT-1001"
                                    className={inputClass}
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Quotation Amount
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    value={quotationAmount}
                                    onChange={(e) =>
                                        setQuotationAmount(
                                            e.target.value
                                        )
                                    }
                                    placeholder="75000"
                                    className={inputClass}
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Currency
                                </label>

                                <input
                                    value={currency}
                                    onChange={(e) =>
                                        setCurrency(
                                            e.target.value
                                        )
                                    }
                                    placeholder="INR"
                                    className={`${inputClass} uppercase`}
                                />
                            </div>

                            {/* PO */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Purchase Order Number
                                </label>

                                <input
                                    value={purchaseOrderNumber}
                                    onChange={(e) =>
                                        setPurchaseOrderNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="PO-1001"
                                    className={inputClass}
                                />
                            </div>

                            {/* Delivery */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Expected Delivery Date
                                </label>

                                <input
                                    type="date"
                                    value={expectedDeliveryDate}
                                    onChange={(e) =>
                                        setExpectedDeliveryDate(
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Remarks
                                </label>

                                <input
                                    value={remarks}
                                    onChange={(e) =>
                                        setRemarks(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Procurement remarks"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Save */}
                        <div className="mt-6 flex flex-wrap gap-3">

                            {!procurement && (
                                <button
                                    onClick={
                                        createProcurement
                                    }
                                    disabled={
                                        actionLoading ===
                                        "create"
                                    }
                                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-black hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {actionLoading ===
                                    "create"
                                        ? "Creating..."
                                        : "Create Procurement"}
                                </button>
                            )}

                            {procurement && (
                                <button
                                    onClick={
                                        updateProcurement
                                    }
                                    disabled={
                                        actionLoading ===
                                        "update"
                                    }
                                    className="rounded-lg bg-slate-200 px-5 py-3 text-sm font-semibold text-black hover:bg-slate-300 disabled:opacity-50"
                                >
                                    {actionLoading ===
                                    "update"
                                        ? "Updating..."
                                        : "Save Changes"}
                                </button>
                            )}
                        </div>
                    </section>
                )}

                {/* Workflow */}
                {procurement && (
                    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Procurement Workflow
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Progress the procurement request through
                                its lifecycle.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-4">

                            {/* Start */}
                            <button
                                onClick={() =>
                                    performAction("start")
                                }
                                disabled={
                                    !canStart ||
                                    actionLoading !== ""
                                }
                                className={`rounded-xl border p-5 text-left transition ${
                                    canStart
                                        ? "border-blue-200 bg-blue-50 text-black hover:bg-blue-100"
                                        : "cursor-not-allowed border-slate-200 bg-slate-50 text-black opacity-50"
                                }`}
                            >
                                <div className="text-sm font-semibold text-black">
                                    1. Start Procurement
                                </div>

                                <div className="mt-2 text-xs text-black">
                                    PENDING → QUOTATION_RECEIVED
                                </div>

                                {actionLoading ===
                                    "start" && (
                                        <div className="mt-3 text-xs font-medium text-black">
                                            Processing...
                                        </div>
                                    )}
                            </button>

                            {/* PO */}
                            <button
                                onClick={() =>
                                    performAction(
                                        "purchase-order"
                                    )
                                }
                                disabled={
                                    !canCreatePO ||
                                    actionLoading !== ""
                                }
                                className={`rounded-xl border p-5 text-left transition ${
                                    canCreatePO
                                        ? "border-blue-200 bg-blue-50 text-black hover:bg-blue-100"
                                        : "cursor-not-allowed border-slate-200 bg-slate-50 text-black opacity-50"
                                }`}
                            >
                                <div className="text-sm font-semibold text-black">
                                    2. Create Purchase Order
                                </div>

                                <div className="mt-2 text-xs text-black">
                                    QUOTATION_RECEIVED → PO_CREATED
                                </div>

                                {actionLoading ===
                                    "purchase-order" && (
                                        <div className="mt-3 text-xs font-medium text-black">
                                            Processing...
                                        </div>
                                    )}
                            </button>

                            {/* Order */}
                            <button
                                onClick={() =>
                                    performAction("order")
                                }
                                disabled={
                                    !canOrder ||
                                    actionLoading !== ""
                                }
                                className={`rounded-xl border p-5 text-left transition ${
                                    canOrder
                                        ? "border-blue-200 bg-blue-50 text-black hover:bg-blue-100"
                                        : "cursor-not-allowed border-slate-200 bg-slate-50 text-black opacity-50"
                                }`}
                            >
                                <div className="text-sm font-semibold text-black">
                                    3. Place Order
                                </div>

                                <div className="mt-2 text-xs text-black">
                                    PO_CREATED → ORDERED
                                </div>

                                {actionLoading === "order" && (
                                    <div className="mt-3 text-xs font-medium text-black">
                                        Processing...
                                    </div>
                                )}
                            </button>

                            {/* Receive */}
                            <button
                                onClick={() =>
                                    performAction("receive")
                                }
                                disabled={
                                    !canReceive ||
                                    actionLoading !== ""
                                }
                                className={`rounded-xl border p-5 text-left transition ${
                                    canReceive
                                        ? "border-green-200 bg-green-50 text-black hover:bg-green-100"
                                        : "cursor-not-allowed border-slate-200 bg-slate-50 text-black opacity-50"
                                }`}
                            >
                                <div className="text-sm font-semibold text-black">
                                    4. Receive Asset
                                </div>

                                <div className="mt-2 text-xs text-black">
                                    ORDERED → RECEIVED
                                </div>

                                {actionLoading ===
                                    "receive" && (
                                        <div className="mt-3 text-xs font-medium text-black">
                                            Processing...
                                        </div>
                                    )}
                            </button>
                        </div>
                    </section>
                )}

                {/* Record Information */}
                {procurement && (
                    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="text-lg font-semibold text-slate-900">
                            Record Information
                        </h2>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Procurement ID
                                </p>

                                <p className="mt-1 break-all text-sm text-black">
                                    {procurement.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Asset Request ID
                                </p>

                                <p className="mt-1 break-all text-sm text-black">
                                    {procurement.requestId}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Created By
                                </p>

                                <p className="mt-1 text-sm text-black">
                                    {procurement.createdBy}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Status
                                </p>

                                <p className="mt-1 text-sm font-semibold text-black">
                                    {procurement.status}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}