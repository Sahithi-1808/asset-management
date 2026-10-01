"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RequestDashboard from "@/components/request-dashboard";
export default function HRPage() { const router = useRouter(); useEffect(() => { if (sessionStorage.getItem("role") !== "HR") router.push("/login"); }, [router]); return <RequestDashboard role="HR" title="HR Dashboard" subtitle="Review employee asset requests and track fulfillment and closure." />; }
