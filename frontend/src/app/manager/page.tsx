"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RequestDashboard from "@/components/request-dashboard";
export default function ManagerPage() { const router = useRouter(); useEffect(() => { if (sessionStorage.getItem("role") !== "MANAGER") router.push("/login"); }, [router]); return <RequestDashboard role="MANAGER" title="Manager Dashboard" subtitle="Review requests raised by employees reporting to you." />; }
