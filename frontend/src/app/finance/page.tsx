"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RequestDashboard from "@/components/request-dashboard";
export default function FinancePage() { const router = useRouter(); useEffect(() => { if (sessionStorage.getItem("role") !== "FINANCE") router.push("/login"); }, [router]); return <RequestDashboard role="FINANCE" title="Finance Dashboard" subtitle="Review requests that require financial approval." />; }
