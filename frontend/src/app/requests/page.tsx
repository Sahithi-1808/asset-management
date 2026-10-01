"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RequestDashboard from "@/components/request-dashboard";
export default function RequestsPage() { const router = useRouter(); useEffect(() => { if (sessionStorage.getItem("role") !== "SYSTEM_ADMIN") router.push("/login"); }, [router]); return <RequestDashboard role="SYSTEM_ADMIN" title="Admin Asset Requests" subtitle="Manage employee asset requests, approvals, finance and fulfillment." />; }
