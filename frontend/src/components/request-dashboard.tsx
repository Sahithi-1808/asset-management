"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:8084/api/v1";

type Role = "SYSTEM_ADMIN" | "HR" | "MANAGER" | "FINANCE" | "HIGHER_AUTHORITY" | "EMPLOYEE";
type RequestStatus =
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "REJECTED"
    | "FINANCE_PENDING"
    | "FINANCE_APPROVED"
    | "FINANCE_REJECTED"
    | "PROCUREMENT_PENDING"
    | "PROCUREMENT_IN_PROGRESS"
    | "PURCHASE_ORDER_CREATED"
    | "HIGHER_AUTHORITY_PENDING"
    | "HIGHER_AUTHORITY_APPROVED"
    | "HIGHER_AUTHORITY_REJECTED"
    | "ORDERED"
    | "RECEIVING_PENDING"
    | "RECEIVED"
    | "FULFILLMENT_PENDING"
    | "ASSIGNED"
    | "FULFILLED"
    | "CLOSED";

type Asset = {
    id: string;
    assetTag: string;
    name: string;
    category: string | null;
    manufacturer: string | null;
    model: string | null;
    status: string;
    assignedTo: string | null;
};

type Employee = {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: Role;
    managerUsername: string | null;
};

type RequestItem = {
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
    status: RequestStatus;
    approverUsername: string;
    approvalComment: string | null;
    approvedAt: string | null;
    requiresFinanceApproval: boolean;
    financeUsername: string | null;
    financeComment: string | null;
    financeApprovedAt: string | null
    purchaseOrderCreated: boolean;
    assignedUsername: string | null;
    fulfilledAt: string | null;
    closedBy: string | null;
    closedAt: string | null;
    closureNote: string | null;
    createdAt: string;
    updatedAt: string;
};

type HistoryItem = {
    id: string;
    action: string;
    fromStatus: RequestStatus | null;
    toStatus: RequestStatus | null;
    actorUsername: string;
    comment: string | null;
    createdAt: string;
};

type Props = {
    role: Role;
    title: string;
    subtitle: string;
};

const STATUS_LABEL: Record<RequestStatus, string> = {
    PENDING_APPROVAL: "Pending Approval",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    FINANCE_PENDING: "Finance Pending",
    FINANCE_APPROVED: "Finance Approved",
    FINANCE_REJECTED: "Finance Rejected",
    PROCUREMENT_PENDING: "Procurement Pending",
    PROCUREMENT_IN_PROGRESS: "Procurement In Progress",
    PURCHASE_ORDER_CREATED: "Purchase Order Created",
    HIGHER_AUTHORITY_PENDING: "Higher Authority Pending",
    HIGHER_AUTHORITY_APPROVED: "Higher Authority Approved",
    HIGHER_AUTHORITY_REJECTED: "Higher Authority Rejected",
    ORDERED: "Ordered",
    RECEIVING_PENDING: "Receiving Pending",
    RECEIVED: "Received",
    FULFILLMENT_PENDING: "Fulfillment Pending",
    ASSIGNED: "Assigned",
    FULFILLED: "Fulfilled",
    CLOSED: "Closed",
};

const statusClass: Record<RequestStatus, string> = {
    PENDING_APPROVAL: "bg-amber-50 text-amber-700 ring-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    REJECTED: "bg-red-50 text-red-700 ring-red-200",
    FINANCE_PENDING: "bg-violet-50 text-violet-700 ring-violet-200",
    FINANCE_APPROVED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    FINANCE_REJECTED: "bg-red-50 text-red-700 ring-red-200",
    PROCUREMENT_PENDING: "bg-orange-50 text-orange-700 ring-orange-200",
    PROCUREMENT_IN_PROGRESS: "bg-orange-50 text-orange-700 ring-orange-200",
    PURCHASE_ORDER_CREATED: "bg-amber-50 text-amber-700 ring-amber-200",
    HIGHER_AUTHORITY_PENDING: "bg-purple-50 text-purple-700 ring-purple-200",
    HIGHER_AUTHORITY_APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    HIGHER_AUTHORITY_REJECTED: "bg-red-50 text-red-700 ring-red-200",
    ORDERED: "bg-blue-50 text-blue-700 ring-blue-200",
    RECEIVING_PENDING: "bg-blue-50 text-blue-700 ring-blue-200",
    RECEIVED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    FULFILLMENT_PENDING: "bg-blue-50 text-blue-700 ring-blue-200",
    ASSIGNED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    FULFILLED: "bg-green-50 text-green-700 ring-green-200",
    CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
};

function statusLabel(status: RequestStatus) {
    return STATUS_LABEL[status] ?? status;
}

function formatDate(value: string | null) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default function RequestDashboard({ role, title, subtitle }: Props) {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"ALL" | RequestStatus>("ALL");
    const [showCreate, setShowCreate] = useState(false);
    const [step, setStep] = useState(1);
    const [approverSearch, setApproverSearch] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [createError, setCreateError] = useState("");
    const [creating, setCreating] = useState(false);
    const [approvalComment, setApprovalComment] = useState("");
    const [showFulfillModal, setShowFulfillModal] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState("");

    const [form, setForm] = useState({
        employeeUsername: "",
        assetId: "",
        quantity: 1,
        priority: "High",
        businessJustification: "",
        requiredFrom: "",
        requiredTo: "",
        location: "Hyderabad Office",
        approverUsername: "",
        requiresFinanceApproval: false,
    });

    function getAuthHeaders(): HeadersInit {
        if (typeof window === "undefined") {
            return {};
        }

        const token = window.sessionStorage.getItem("token");

        if (!token) {
            return {};
        }

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    async function load() {
        setLoading(true);
        setError("");
        try {
            const [requestResponse, assetResponse, employeeResponse] =
                await Promise.all([
                    fetch(`${API}/asset-requests`, {
                        headers: getAuthHeaders(),
                    }),
                    fetch(`${API}/assets`, {
                        headers: getAuthHeaders(),
                    }),
                    fetch(`${API}/employees`, {
                        headers: getAuthHeaders(),
                    }),
                ]);
            if (!requestResponse.ok) throw new Error("Unable to load asset requests.");
            if (!assetResponse.ok) throw new Error("Unable to load assets.");
            if (!employeeResponse.ok) throw new Error("Unable to load employees.");
            setRequests(await requestResponse.json());
            setAssets(await assetResponse.json());
            setEmployees(await employeeResponse.json());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to load request data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {

        const timer = window.setTimeout(() => {
            void load();
        }, 0);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    const counts = useMemo(() => {
        const result: Record<string, number> = {};
        requests.forEach((request) => {
            result[request.status] = (result[request.status] ?? 0) + 1;
        });
        return result;
    }, [requests]);

    const filteredRequests = useMemo(() => {
        const q = search.trim().toLowerCase();
        return requests.filter((request) => {
            const matchesStatus = filter === "ALL" || request.status === filter;
            const matchesSearch = !q || [
                request.requestNumber,
                request.employeeUsername,
                request.assetName,
                request.assetTag,
                request.status,
            ].some((value) => value?.toLowerCase().includes(q));
            return matchesStatus && matchesSearch;
        });
    }, [requests, search, filter]);

    const canCreate = role !== "FINANCE" && role !== "HIGHER_AUTHORITY";

    function openCreate() {
        setCreateError("");
        setStep(1);
        setApproverSearch("");

        setForm({
            employeeUsername: role === "EMPLOYEE" ? username : "",
            assetId: "",
            quantity: 1,
            priority: "High",
            businessJustification: "",
            requiredFrom: "",
            requiredTo: "",
            location: "Hyderabad Office",
            approverUsername: "",
            requiresFinanceApproval: false,
        });
        setShowCreate(true);
    }

    function nextStep() {
        setCreateError("");

        if (step === 1 && role !== "EMPLOYEE" && !form.employeeUsername) {
            setCreateError("Select the employee for this request.");
            return;
        }

        if (step === 2 && !form.assetId) {
            setCreateError("Select an asset.");
            return;
        }

        if (step === 3 && !form.businessJustification.trim()) {
            setCreateError("Enter the business justification.");
            return;
        }

        if (step === 4 && !form.approverUsername) {
            setCreateError("Select an approver.");
            return;
        }

        if (step === 5 && !form.approverUsername) {
            setCreateError("Please select an approver.");
            return;
        }

        if (step < 6) {
            setStep((value) => value + 1);
        }
    }

    async function submitRequest(event?: FormEvent) {
        event?.preventDefault();
        setCreating(true);
        setCreateError("");
        try {
            const response = await fetch(`${API}/asset-requests`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ...form,
                    employeeUsername: form.employeeUsername || username,
                    requiredFrom: form.requiredFrom || null,
                    requiredTo: form.requiredTo || null,
                    location: form.location || null,
                }),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                setCreateError(data?.message ?? "Unable to create asset request.");
                return;
            }
            setShowCreate(false);
            await load();
        } catch {
            setCreateError("Unable to connect to the Asset Management API.");
        } finally {
            setCreating(false);
        }
    }

    async function action(path: string, body: unknown = {}) {
        try {
            const response = await fetch(`${API}/asset-requests/${path}`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(body),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                alert(data?.message ?? "Unable to complete the action.");
                return;
            }
            await load();
            if (selectedRequest?.id === data?.id) setSelectedRequest(data);
        } catch {
            alert("Unable to connect to the Asset Management API.");
        }
    }

    async function openHistory(request: RequestItem) {
        setSelectedRequest(request);
        setShowHistory(true);
        try {
            const response = await fetch(`${API}/asset-requests/${request.id}/history`,  {
                headers: getAuthHeaders(),
            });
            setHistory(response.ok ? await response.json() : []);
        } catch {
            setHistory([]);
        }
    }

    function approve(request: RequestItem) {
        const comment = window.prompt("Approval comment (optional):", "") ?? "";
        action(`${request.id}/approve`, { comment });
    }

    function reject(request: RequestItem, finance = false) {
        const comment = window.prompt("Reason for rejection:", "") ?? "";
        if (!comment.trim()) return;
        action(finance ? `${request.id}/finance/reject` : `${request.id}/reject`, { comment });
    }

    function financeApprove(request: RequestItem) {
        const comment = window.prompt("Finance approval comment (optional):", "") ?? "";
        action(`${request.id}/finance/approve`, { comment });
    }

    async function procurementFinanceApprove(request: RequestItem) {
        const budgetValue = window.prompt("Enter the budget amount:", "");
        if (budgetValue === null) return;

        const approvedBudgetValue = window.prompt(
            "Enter the approved budget amount:",
            budgetValue
        );

        if (approvedBudgetValue === null) return;

        const budgetAmount = Number(budgetValue);
        const approvedBudget = Number(approvedBudgetValue);

        if (
            !Number.isFinite(budgetAmount) ||
            budgetAmount < 0 ||
            !Number.isFinite(approvedBudget) ||
            approvedBudget < 0
        ) {
            alert("Please enter valid non-negative budget amounts.");
            return;
        }

        const comment =
            window.prompt(
                "Finance budget approval comment (optional):",
                ""
            ) ?? "";

        try {
            const response = await fetch(
                `${API}/asset-requests/${request.id}/procurement/finance/approve`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        budgetAmount,
                        approvedBudget,
                        financeDecision: "APPROVED",
                        financeComment: comment,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                alert(
                    data?.message ??
                    "Unable to approve the procurement budget."
                );
                return;
            }

            await load();
        } catch {
            alert("Unable to connect to the Asset Management API.");
        }
    }

    async function procurementFinanceReject(request: RequestItem) {
        const comment =
            window.prompt(
                "Reason for rejecting the procurement budget:",
                ""
            ) ?? "";

        if (!comment.trim()) return;

        try {
            const response = await fetch(
                `${API}/asset-requests/${request.id}/procurement/finance/reject`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        financeDecision: "REJECTED",
                        financeComment: comment,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                alert(
                    data?.message ??
                    "Unable to reject the procurement budget."
                );
                return;
            }

            await load();
        } catch {
            alert("Unable to connect to the Asset Management API.");
        }
    }

    function higherAuthorityFinalApprove(request: RequestItem) {
        const comment =
            window.prompt(
                "Final approval comment (optional):",
                ""
            ) ?? "";

        action(
            `${request.id}/higher-authority/final-approve`,
            { comment }
        );
    }

    function higherAuthorityFinalReject(request: RequestItem) {
        const comment =
            window.prompt(
                "Reason for final rejection:",
                ""
            ) ?? "";

        if (!comment.trim()) return;

        action(
            `${request.id}/higher-authority/final-reject`,
            { comment }
        );
    }

    function fulfill(request: RequestItem) {
        const availableAssets = assets.filter(
            (asset) => asset.status === "IN_STOCK"
        );

        if (availableAssets.length === 0) {
            setError("No available assets are currently in stock for fulfillment.");
            return;
        }

        setSelectedRequest(request);
        setSelectedAssetId("");
        setShowFulfillModal(true);
    }

    function submitFulfillment() {
        if (!selectedRequest) {
            return;
        }

        if (!selectedAssetId) {
            setError("Please select an available asset.");
            return;
        }

        void action(
            `${selectedRequest.id}/fulfill`,
            {
                assignedUsername: selectedRequest.employeeUsername,
                assetId: selectedAssetId,
            }
        );

        setShowFulfillModal(false);
        setSelectedAssetId("");
        setSelectedRequest(null);
    }

    function closeRequest(request: RequestItem) {
        const note = window.prompt("Closure note (optional):", "Request completed successfully.") ?? "";
        action(`${request.id}/close`, { closureNote: note });
    }

    function openRequestDetails(request: RequestItem) {
        setApprovalComment("");
        setSelectedRequest(request);
        setShowHistory(false);
    }

    const approvers = employees.filter((employee) =>
        ["HR", "MANAGER", "HIGHER_AUTHORITY"].includes(employee.role)
    );

    const filteredApprovers = approvers.filter((employee) => {
        const query = approverSearch.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            employee.fullName.toLowerCase().includes(query) ||
            employee.username.toLowerCase().includes(query) ||
            employee.email.toLowerCase().includes(query) ||
            employee.role.toLowerCase().includes(query)
        );
    });

    const selectedApprover = approvers.find(
        (employee) => employee.username === form.approverUsername
    );

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/40 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">
                <header className="mb-7 rounded-3xl border border-white/70 bg-white/90 px-6 py-5 shadow-[0_12px_40px_rgba(79,70,229,0.08)] backdrop-blur sm:px-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Asset Requests</div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {canCreate && <button onClick={openCreate} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700">+ Create Asset Request</button>}
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>
                </header>

                {error && <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

                <div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    <Stat title="Total Requests" value={requests.length} />
                    <Stat title="Pending Approval" value={counts.PENDING_APPROVAL ?? 0} />
                    <Stat title="Approved" value={counts.APPROVED ?? 0} />
                    <Stat title="Finance Pending" value={counts.FINANCE_PENDING ?? 0} />
                    <Stat title="Fulfilled" value={counts.FULFILLED ?? 0} />
                    <Stat title="Closed" value={counts.CLOSED ?? 0} />
                </div>

                <section className="overflow-visible rounded-3xl border border-white/70 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.07)]">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Asset Requests</h2>
                            <p className="mt-1 text-sm text-slate-500">Approval, finance, fulfillment and closure workflow.</p>
                        </div>
                        <div className="flex gap-2">
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search request, employee or asset..." className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-indigo-500 focus:bg-white" />
                            <select value={filter} onChange={(e) => setFilter(e.target.value as "ALL" | RequestStatus)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                                <option value="ALL">All Statuses</option>
                                {Object.keys(STATUS_LABEL).map((status) => <option key={status} value={status}>{STATUS_LABEL[status as RequestStatus]}</option>)}
                            </select>
                        </div>
                    </div>

                    {loading ? <div className="px-6 py-16 text-center text-sm text-slate-500">Loading requests...</div> : filteredRequests.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500">No requests found.</div> : (
                        <div className="overflow-x-visible">
                            <table className="w-full min-w-[1050px] text-left">
                                <thead><tr className="border-b border-slate-200 bg-slate-50/80">
                                    {['Request ID','Employee','Asset','Qty','Status','Date','Action'].map((head) => <th key={head} className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{head}</th>)}
                                </tr></thead>
                                <tbody>
                                    {filteredRequests.map((request) => <RequestRow
                                        key={request.id}
                                        request={request}
                                        onDetails={() => openRequestDetails(request)}
                                        onHistory={() => openHistory(request)}
                                        onApprove={() => approve(request)}
                                        onReject={() => reject(request)}
                                        onFinanceApprove={() => financeApprove(request)}
                                        onFinanceReject={() => reject(request, true)}
                                        onProcurementFinanceApprove={() =>
                                            void procurementFinanceApprove(request)
                                        }
                                        onProcurementFinanceReject={() =>
                                            void procurementFinanceReject(request)
                                        }
                                        onHigherAuthorityFinalApprove={() =>
                                            higherAuthorityFinalApprove(request)
                                        }
                                        onHigherAuthorityFinalReject={() =>
                                            higherAuthorityFinalReject(request)
                                        }
                                        onFulfill={() => fulfill(request)}
                                        onClose={() => closeRequest(request)}
                                        role={role}
                                    />)}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {showCreate && (
                    <Modal title="Create Asset Request" onClose={() => !creating && setShowCreate(false)}>
                        <div className="mb-6 flex items-center gap-2">
                            {["Admin","Asset","Details","Approver","Approval","Review",].map((label, index) => <div key={label} className="flex flex-1 items-center gap-2"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= index + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{index + 1}</div><span className="hidden text-xs font-semibold text-slate-500 sm:block">{label}</span>{index < 5 && <div className="h-px flex-1 bg-slate-200" />}</div>)}
                        </div>
                        {step === 1 && <div className="space-y-5"><div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4"><p className="text-xs font-semibold uppercase text-indigo-600">Requester</p><p className="mt-1 font-bold text-slate-900">{username}</p><p className="text-sm text-slate-500">Role: {role}</p></div>{role !== 'EMPLOYEE' && <Select label="Request for employee" value={form.employeeUsername} onChange={(value) => setForm({ ...form, employeeUsername: value })}><option value="" className="bg-white text-slate-900">
                            Select employee
                        </option>{employees.filter((e) => e.role === 'EMPLOYEE').map((employee) => <option key={employee.username} value={employee.username} className="bg-white text-slate-900">{employee.fullName} ({employee.username})</option>)}</Select>}</div>}
                        {step === 2 && <div className="space-y-4"><p className="text-sm text-slate-500">Select the asset associated with this request.</p>{assets.map((asset) => <button type="button" key={asset.id} onClick={() => setForm({ ...form, assetId: asset.id })} className={`w-full rounded-2xl border p-4 text-left transition ${form.assetId === asset.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-200'}`}><div className="flex items-center justify-between"><div><p className="font-bold text-slate-900">{asset.name}</p><p className="text-xs text-slate-500">{asset.assetTag} · {asset.category ?? 'Uncategorized'} · {asset.model ?? 'No model'}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${asset.status === 'IN_STOCK' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{asset.status.replaceAll('_',' ')}</span></div></button>)}</div>}
                        {step === 3 && <div className="grid gap-5 sm:grid-cols-2"><Field label="Quantity" type="number" min={1} value={String(form.quantity)} onChange={(value) => setForm({ ...form, quantity: Math.max(1, Number(value)) })} /><Select label="Priority" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })}><option className="bg-white text-slate-900">High</option>
                            <option className="bg-white text-slate-900">Medium</option>
                            <option className="bg-white text-slate-900">Low</option></Select><Field label="Required From" type="date" value={form.requiredFrom} onChange={(value) => setForm({ ...form, requiredFrom: value })} /><Field label="Required To" type="date" value={form.requiredTo} onChange={(value) => setForm({ ...form, requiredTo: value })} /><Field label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} /><label className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.requiresFinanceApproval} onChange={(e) => setForm({ ...form, requiresFinanceApproval: e.target.checked })} /> Requires Finance Approval</label><label className="sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Business Justification</span><textarea value={form.businessJustification} onChange={(e) => setForm({ ...form, businessJustification: e.target.value })} rows={4} placeholder="Laptop required for project work..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white" /></label></div>}
                        {step === 4 && (
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Select Approver
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Select the person who will approve this asset request.
                                    </p>
                                </div>

                                {/* Search */}
                                <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
            </span>

                                    <input
                                        type="text"
                                        value={approverSearch}
                                        onChange={(e) => setApproverSearch(e.target.value)}
                                        placeholder="Search by name, Admin ID or role..."
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Search Results */}
                                <div>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Available Approvers
                                    </p>

                                    {filteredApprovers.length === 0 ? (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
                                            <p className="text-sm font-semibold text-slate-600">
                                                No approvers found.
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Try another name, Admin ID or role.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredApprovers.map((employee) => {
                                                const initials = employee.fullName
                                                    .split(" ")
                                                    .map((part) => part.charAt(0))
                                                    .slice(0, 2)
                                                    .join("")
                                                    .toUpperCase();

                                                const selected =
                                                    form.approverUsername === employee.username;

                                                return (
                                                    <button
                                                        type="button"
                                                        key={employee.username}
                                                        onClick={() =>
                                                            setForm({
                                                                ...form,
                                                                approverUsername: employee.username,
                                                            })
                                                        }
                                                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                                                            selected
                                                                ? "border-indigo-400 bg-indigo-50 shadow-sm ring-2 ring-indigo-100"
                                                                : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                                                        }`}
                                                    >
                                                        {/* Avatar */}
                                                        <div
                                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                                selected
                                                                    ? "bg-indigo-600 text-white"
                                                                    : "bg-indigo-50 text-indigo-600"
                                                            }`}
                                                        >
                                                            {initials}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-slate-900">
                                                                {employee.fullName}
                                                            </p>

                                                            <p className="mt-1 text-xs font-medium text-slate-500">
                                                                Admin ID: {employee.username}
                                                            </p>

                                                            <p className="truncate text-xs text-slate-400">
                                                                {employee.email}
                                                            </p>
                                                        </div>

                                                        {/* Role */}
                                                        <div className="hidden shrink-0 sm:block">
                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                            employee.role === "HIGHER_AUTHORITY"
                                                ? "bg-purple-50 text-purple-700"
                                                : employee.role === "MANAGER"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-emerald-50 text-emerald-700"
                                        }`}
                                    >
                                        {employee.role.replaceAll("_", " ")}
                                    </span>
                                                        </div>

                                                        {showFulfillModal && selectedRequest && (
                                                            <Modal
                                                                title="Select Asset for Fulfillment"
                                                                onClose={() => {
                                                                    setShowFulfillModal(false);
                                                                    setSelectedAssetId("");
                                                                }}
                                                            >
                                                                <div className="space-y-5">
                                                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                                                                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                                                                            Employee
                                                                        </p>

                                                                        <p className="mt-1 text-sm font-bold text-slate-900">
                                                                            {selectedRequest.employeeUsername}
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                            Select an available inventory asset to fulfill this request.
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <p className="mb-3 text-sm font-bold text-slate-900">
                                                                            Available Assets
                                                                        </p>

                                                                        <div className="space-y-3">
                                                                            {assets
                                                                                .filter((asset) => asset.status === "IN_STOCK")
                                                                                .map((asset) => {
                                                                                    const selected = selectedAssetId === asset.id;

                                                                                    return (
                                                                                        <button
                                                                                            key={asset.id}
                                                                                            type="button"
                                                                                            onClick={() => setSelectedAssetId(asset.id)}
                                                                                            className={`w-full rounded-2xl border p-4 text-left transition ${
                                                                                                selected
                                                                                                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                                                                                                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                                                                                            }`}
                                                                                        >
                                                                                            <div className="flex items-center justify-between gap-4">
                                                                                                <div>
                                                                                                    <p className="font-bold text-slate-900">
                                                                                                        {asset.name}
                                                                                                    </p>

                                                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                                                        {asset.assetTag}
                                                                                                        {" · "}
                                                                                                        {asset.category ?? "Uncategorized"}
                                                                                                        {" · "}
                                                                                                        {asset.model ?? "No model"}
                                                                                                    </p>
                                                                                                </div>

                                                                                                <div className="flex items-center gap-3">
                                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                                IN STOCK
                                            </span>

                                                                                                    {selected && (
                                                                                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                                                    ✓
                                                </span>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </button>
                                                                                    );
                                                                                })}

                                                                            {assets.filter(
                                                                                (asset) => asset.status === "IN_STOCK"
                                                                            ).length === 0 && (
                                                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
                                                                                    <p className="text-sm font-semibold text-slate-600">
                                                                                        No available assets
                                                                                    </p>

                                                                                    <p className="mt-1 text-xs text-slate-400">
                                                                                        There are currently no assets in stock.
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {error && (
                                                                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                                                            {error}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setShowFulfillModal(false);
                                                                                setSelectedAssetId("");
                                                                            }}
                                                                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                                        >
                                                                            Cancel
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            disabled={!selectedAssetId}
                                                                            onClick={submitFulfillment}
                                                                            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                            Assign Asset
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </Modal>
                                                        )}

                                                        {/* Selected */}
                                                        {selected && (
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                                                                ✓
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Approver Card
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Review the selected approver before continuing.
                                    </p>
                                </div>

                                {selectedApprover ? (
                                    <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                                        <p className="mb-5 text-sm font-bold text-slate-900">
                                            Selected Approver
                                        </p>

                                        <div className="flex items-center gap-5">
                                            {/* Avatar */}
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                                                {selectedApprover.fullName
                                                    .split(" ")
                                                    .map((part) => part.charAt(0))
                                                    .slice(0, 2)
                                                    .join("")
                                                    .toUpperCase()}
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-lg font-bold text-slate-900">
                                                    {selectedApprover.fullName}
                                                </h4>

                                                <div className="mt-3 space-y-1">
                                                    <p className="text-sm text-slate-500">
                                                        Admin ID:{" "}
                                                        <span className="font-semibold text-indigo-700">
                                    {selectedApprover.username}
                                </span>
                                                    </p>

                                                    <p className="text-sm text-slate-500">
                                                        Email:{" "}
                                                        <span className="font-semibold text-indigo-700">
                                    {selectedApprover.email}
                                </span>
                                                    </p>

                                                    <p className="text-sm text-slate-500">
                                                        Role:{" "}
                                                        <span className="font-semibold text-indigo-700">
                                    {selectedApprover.role.replaceAll("_", " ")}
                                </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 border-t border-slate-100 pt-5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setApproverSearch("");
                                                    setStep(4);
                                                }}
                                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Change Approver
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                                        No approver has been selected.
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 6 && <div className="space-y-4"><Review label="Requester" value={form.employeeUsername || username} /><Review label="Asset" value={assets.find((a) => a.id === form.assetId)?.name ?? '-'} /><Review label="Quantity" value={String(form.quantity)} /><Review label="Priority" value={form.priority} /><Review label="Higher Authority" value={form.approverUsername} /><Review label="Finance Approval" value={form.requiresFinanceApproval ? 'Required' : 'Not Required'} /><Review label="Justification" value={form.businessJustification} /></div>}
                        {createError && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{createError}</div>}
                        <div className="mt-7 flex justify-between border-t border-slate-100 pt-5"><button type="button" onClick={() => step === 1 ? setShowCreate(false) : setStep((v) => v - 1)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">{step === 1 ? 'Cancel' : 'Back'}</button>{step < 6 ? <button type="button" onClick={nextStep} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white">Next →</button> : <button type="button" disabled={creating} onClick={() => submitRequest()} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{creating ? 'Submitting...' : 'Submit Request'}</button>}</div>
                    </Modal>
                )}

                {selectedRequest && !showHistory && (
                    <Modal
                        title={`Asset Request - ${selectedRequest.requestNumber}`}
                        onClose={() => {
                            setSelectedRequest(null);
                            setApprovalComment("");
                        }}
                    >
                        <div className="space-y-5">

                            {/* Requested By */}
                            <div className="grid gap-4 sm:grid-cols-2">

                                {/* Requested By */}
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-indigo-600">
                                        Requested By
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                                            {selectedRequest.requesterUsername
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>

                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {selectedRequest.requesterUsername}
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Requester
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Request For */}
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-indigo-600">
                                        Request For
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                            {selectedRequest.employeeUsername
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </div>

                                        <div>
                                            <p className="font-bold text-slate-900">
                                                {selectedRequest.employeeUsername}
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Employee
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            {/* Asset */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Asset
                                </p>

                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-slate-900">
                                            {selectedRequest.assetName ?? "-"}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {selectedRequest.assetTag ?? "-"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                                        Qty: {selectedRequest.quantity}
                                    </div>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Request Details
                                </p>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Review
                                        label="Priority"
                                        value={selectedRequest.priority}
                                    />

                                    <Review
                                        label="Required From"
                                        value={formatDate(selectedRequest.requiredFrom)}
                                    />

                                    <Review
                                        label="Required To"
                                        value={formatDate(selectedRequest.requiredTo)}
                                    />

                                    <Review
                                        label="Location"
                                        value={selectedRequest.location ?? "-"}
                                    />
                                </div>
                            </div>

                            {/* Business Justification */}
                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Business Justification
                                </p>

                                <p className="text-sm font-medium leading-6 text-slate-700">
                                    {selectedRequest.businessJustification || "-"}
                                </p>
                            </div>

                            {/* Additional Request Information */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Review
                                    label="Finance Approval"
                                    value={
                                        selectedRequest.requiresFinanceApproval
                                            ? "Required"
                                            : "Not Required"
                                    }
                                />

                                <Review
                                    label="Approver"
                                    value={selectedRequest.approverUsername}
                                />
                            </div>

                            {/* Approval section */}
                            {selectedRequest.status === "PENDING_APPROVAL" &&
                                ["HR", "MANAGER", "HIGHER_AUTHORITY", "SYSTEM_ADMIN"].includes(
                                    role
                                ) && (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Approval Comment
                                            </label>

                                            <textarea
                                                value={approvalComment}
                                                onChange={(e) =>
                                                    setApprovalComment(e.target.value)
                                                }
                                                rows={3}
                                                placeholder="Add your comment (optional)..."
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div className="flex gap-3 border-t border-slate-100 pt-5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const comment = approvalComment.trim();

                                                    if (!comment) {
                                                        const confirmed = window.confirm(
                                                            "Reject this request without a reason?"
                                                        );

                                                        if (!confirmed) {
                                                            return;
                                                        }
                                                    }

                                                    void action(
                                                        `${selectedRequest.id}/reject`,
                                                        { comment }
                                                    );

                                                    setSelectedRequest(null);
                                                    setApprovalComment("");
                                                }}
                                                className="flex-1 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                                            >
                                                ⊘ Reject
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const comment = approvalComment.trim();

                                                    void action(
                                                        `${selectedRequest.id}/approve`,
                                                        { comment }
                                                    );

                                                    setSelectedRequest(null);
                                                    setApprovalComment("");
                                                }}
                                                className="flex-1 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
                                            >
                                                ✓ Approve
                                            </button>
                                        </div>
                                    </>
                                )}

                            {/* Existing request */}
                            {selectedRequest.status !== "PENDING_APPROVAL" && (
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                    <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
                            statusClass[selectedRequest.status]
                        }`}
                    >
                        {statusLabel(selectedRequest.status)}
                    </span>

                                    <button
                                        type="button"
                                        onClick={() => openHistory(selectedRequest)}
                                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        View History
                                    </button>
                                </div>
                            )}

                            {/* History for pending request */}
                            {selectedRequest.status === "PENDING_APPROVAL" && (
                                <div className="flex justify-end border-t border-slate-100 pt-5">
                                    <button
                                        type="button"
                                        onClick={() => openHistory(selectedRequest)}
                                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        View History
                                    </button>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}

                {showHistory && selectedRequest && <Modal title={`${selectedRequest.requestNumber} · History`} onClose={() => { setShowHistory(false); setSelectedRequest(null); }}><div className="space-y-4">{history.map((item) => <div key={item.id} className="flex gap-3"><div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" /><div><p className="font-semibold text-slate-900">{item.action.replaceAll('_',' ')}</p><p className="text-xs text-slate-400">{formatDate(item.createdAt)} · {item.actorUsername}</p>{item.comment && <p className="mt-1 text-sm text-slate-600">{item.comment}</p>}</div></div>)}{history.length === 0 && <p className="text-sm text-slate-500">No history available.</p>}</div></Modal>}
            </div>
        </main>
    );
}

function Stat({ title, value }: { title: string; value: number }) { return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>; }

type RequestActionsProps = {
    request: RequestItem;
    role: Role;
    onDetails: () => void;
    onHistory: () => void;
    onApprove: () => void;
    onReject: () => void;
    onFinanceApprove: () => void;
    onFinanceReject: () => void;

    onProcurementFinanceApprove: () => void;
    onProcurementFinanceReject: () => void;

    onHigherAuthorityFinalApprove: () => void;
    onHigherAuthorityFinalReject: () => void;

    onFulfill: () => void;
    onClose: () => void;
};

function RequestRow({
                        request,
                        onDetails,
                        onHistory,
                        onApprove,
                        onReject,
                        onFinanceApprove,
                        onFinanceReject,
                        onProcurementFinanceApprove,
                        onProcurementFinanceReject,
                        onHigherAuthorityFinalApprove,
                        onHigherAuthorityFinalReject,
                        onFulfill,
                        onClose,
                        role,
                    }: RequestActionsProps) {
    return (
        <tr className="border-b border-slate-100 hover:bg-indigo-50/30">
            <td className="px-5 py-5">
                <button
                    onClick={onDetails}
                    className="font-bold text-indigo-600 hover:underline"
                >
                    {request.requestNumber}
                </button>
            </td>

            <td className="px-5 py-5 text-sm font-semibold text-slate-700">
                {request.employeeUsername}
            </td>

            <td className="px-5 py-5">
                <p className="text-sm font-semibold text-slate-800">
                    {request.assetName ?? "-"}
                </p>

                <p className="text-xs text-slate-400">
                    {request.assetTag ?? "-"}
                </p>
            </td>

            <td className="px-5 py-5 text-sm font-semibold text-slate-700">
                {request.quantity}
            </td>

            <td className="px-5 py-5">
                <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${
                        statusClass[request.status]
                    }`}
                >
                    {statusLabel(request.status)}
                </span>
            </td>

            <td className="px-5 py-5 text-sm text-slate-500">
                {formatDate(request.createdAt)}
            </td>

            <td className="px-5 py-5">
                <Actions
                    request={request}
                    role={role}
                    onDetails={onDetails}
                    onHistory={onHistory}
                    onApprove={onApprove}
                    onReject={onReject}
                    onFinanceApprove={onFinanceApprove}
                    onFinanceReject={onFinanceReject}
                    onProcurementFinanceApprove={onProcurementFinanceApprove}
                    onProcurementFinanceReject={onProcurementFinanceReject}
                    onHigherAuthorityFinalApprove={onHigherAuthorityFinalApprove}
                    onHigherAuthorityFinalReject={onHigherAuthorityFinalReject}
                    onFulfill={onFulfill}
                    onClose={onClose}
                />
            </td>
        </tr>
    );
}

function Actions({
                     request,
                     role,
                     onDetails,
                     onHistory,
                     onApprove,
                     onReject,
                     onFinanceApprove,
                     onFinanceReject,
                     onProcurementFinanceApprove,
                     onProcurementFinanceReject,
                     onHigherAuthorityFinalApprove,
                     onHigherAuthorityFinalReject,
                     onFulfill,
                     onClose,
                 }: RequestActionsProps) {
    const [open, setOpen] = useState(false);

    const options: { label: string; action: () => void }[] = [
        {
            label: "View Details",
            action: onDetails,
        },
        {
            label: "View History",
            action: onHistory,
        },
    ];

    if (
        request.status === "PENDING_APPROVAL" &&
        (role === "HIGHER_AUTHORITY" || role === "SYSTEM_ADMIN")
    ) {
        options.push(
            {
                label: "Approve",
                action: onApprove,
            },
            {
                label: "Reject",
                action: onReject,
            }
        );
    }

    if (
        request.status === "FINANCE_PENDING" &&
        (role === "FINANCE" || role === "SYSTEM_ADMIN")
    ) {
        if (request.purchaseOrderCreated) {
            options.push(
                {
                    label: "Review Budget & Approve",
                    action: onProcurementFinanceApprove,
                },
                {
                    label: "Reject Budget",
                    action: onProcurementFinanceReject,
                }
            );
        } else {
            options.push(
                {
                    label: "Finance Approve",
                    action: onFinanceApprove,
                },
                {
                    label: "Finance Reject",
                    action: onFinanceReject,
                }
            );
        }
    }

    if (
        request.status === "HIGHER_AUTHORITY_PENDING" &&
        (role === "HIGHER_AUTHORITY" || role === "SYSTEM_ADMIN")
    ) {
        options.push(
            {
                label: "Final Approve",
                action: onHigherAuthorityFinalApprove,
            },
            {
                label: "Final Reject",
                action: onHigherAuthorityFinalReject,
            }
        );
    }

    if (
        request.status === "FULFILLMENT_PENDING" &&
        ["HR", "SYSTEM_ADMIN", "MANAGER"].includes(role)
    ) {
        options.push({
            label: "Fulfill Request",
            action: onFulfill,
        });
    }

    if (
        request.status === "FULFILLED" &&
        ["HR", "SYSTEM_ADMIN", "MANAGER"].includes(role)
    ) {
        options.push({
            label: "Mark as Closed",
            action: onClose,
        });
    }

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setOpen(!open)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
                Actions ▾
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    {options.map((option) => (
                        <button
                            key={option.label}
                            onClick={() => {
                                setOpen(false);
                                option.action();
                            }}
                            className="block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ActionButtons({
                           request,
                           role,
                           onApprove,
                           onReject,
                           onFinanceApprove,
                           onFinanceReject,
                           onFulfill,
                           onClose,
                       }: Omit<RequestActionsProps, "onDetails" | "onHistory">) {
    return (
        <>
            {request.status === "PENDING_APPROVAL" &&
                (role === "HIGHER_AUTHORITY" || role === "SYSTEM_ADMIN") && (
                    <>
                        <button
                            onClick={onReject}
                            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                        >
                            Reject
                        </button>

                        <button
                            onClick={onApprove}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Approve
                        </button>
                    </>
                )}

            {request.status === "FINANCE_PENDING" &&
                (role === "FINANCE" || role === "SYSTEM_ADMIN") && (
                    <>
                        <button
                            onClick={onFinanceReject}
                            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                        >
                            Reject
                        </button>

                        <button
                            onClick={onFinanceApprove}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Finance Approve
                        </button>
                    </>
                )}

            {request.status === "FULFILLMENT_PENDING" &&
                ["HR", "SYSTEM_ADMIN", "MANAGER"].includes(role) && (
                    <button
                        onClick={onFulfill}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Fulfill
                    </button>
                )}

            {request.status === "FULFILLED" &&
                ["HR", "SYSTEM_ADMIN", "MANAGER"].includes(role) && (
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Mark as Closed
                    </button>
                )}
        </>
    );
}

function Modal({
                   title,
                   onClose,
                   children,
               }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 hover:bg-slate-200"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Field({
                   label,
                   value,
                   onChange,
                   type = "text",
                   min,
               }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    min?: number;
}) {
    return (
        <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </span>

            <input
                type={type}
                min={min}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
            />
        </label>
    );
}

function Select({
                    label,
                    value,
                    onChange,
                    children,
                }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </span>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
            >
                {children}
            </select>
        </label>
    );
}

function Review({
                    label,
                    value,
                }: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
                {value || "-"}
            </p>
        </div>
    );
}