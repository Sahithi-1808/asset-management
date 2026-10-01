"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RequestDashboard from "@/components/request-dashboard";
export default function ApprovalsPage() { const router = useRouter(); useEffect(() => { if (sessionStorage.getItem("role") !== "HIGHER_AUTHORITY") router.push("/login"); }, [router]); return <RequestDashboard role="HIGHER_AUTHORITY" title="Higher Authority Approvals" subtitle="Review and approve or reject requests assigned to you." />; }
