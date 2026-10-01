"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function Welcome() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        if (!username.trim() || !password) {
            setError("Enter your username and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8084/api/v1/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password,
                    }),
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Invalid username or password.");
                } else {
                    setError(
                        data?.message || "Unable to sign in. Please try again."
                    );
                }

                return;
            }

            /*
             * Save the logged-in user information.
             * The employee dashboard uses these values
             * to determine which employee is logged in.
             */
            sessionStorage.setItem(
                "username",
                data.username
            );

            sessionStorage.setItem(
                "role",
                data.role
            );

            sessionStorage.setItem(
                "token",
                data.token
            );

            if (data.role === "SYSTEM_ADMIN") {
                router.push("/dashboard");
                return;
            }

            if (data.role === "EMPLOYEE") {
                router.push("/employee");
                return;
            }

            if (data.role === "HR") {
                router.push("/hr");
                return;
            }

            if (data.role === "MANAGER") {
                router.push("/manager");
                return;
            }

            if (data.role === "FINANCE") {
                router.push("/finance");
                return;
            }

            if (data.role === "HIGHER_AUTHORITY") {
                router.push("/approvals");
                return;
            }

            if (data.role === "PROCUREMENT") {
                router.push("/procurement");
                return;
            }

            /*
             * Unknown role
             */
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("role");

            setError(
                "You are not authorized to access Asset Management."
            );
        } catch {
            setError(
                "Unable to connect to the Asset Management server."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-12">

            {/* Decorative background shapes */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />

            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/30 blur-3xl" />

            <div className="relative z-10 w-full max-w-[440px]">

                {/* Brand */}
                <div className="mb-8 text-center">

                    <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-900">
                        Asset Management
                    </h1>

                    <p className="mt-2 text-[14px] text-slate-500">
                        Manage your organization's assets with ease
                    </p>

                </div>

                {/* Login Card */}
                <section className="rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_25px_70px_rgba(79,70,229,0.12)] backdrop-blur">

                    {/* Card heading */}
                    <div className="mb-7">

                        <div className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[12px] font-semibold text-indigo-600">
                            Secure Access
                        </div>

                        <h2 className="text-[21px] font-bold text-slate-900">
                            Welcome back
                        </h2>

                        <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                            Sign in using your Asset Management account.
                        </p>

                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-2 block text-[13px] font-semibold text-slate-700"
                            >
                                Username
                            </label>

                            <div className="relative">

                                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M20 21a8 8 0 0 0-16 0" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>

                                <input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(event.target.value)
                                    }
                                    placeholder="Enter your username"
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                />

                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-[13px] font-semibold text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <rect
                                            x="3"
                                            y="11"
                                            width="18"
                                            height="10"
                                            rx="2"
                                        />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>

                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                />

                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">

                                <svg
                                    className="mt-0.5 shrink-0"
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 8v4" />
                                    <path d="M12 16h.01" />
                                </svg>

                                <span>{error}</span>

                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-[14px] font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            <span className="relative z-10">
                                {loading ? "Signing in..." : "Sign in"}
                            </span>

                            {!loading && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-200 transition-transform group-hover:translate-x-1">
                                    →
                                </span>
                            )}
                        </button>

                    </form>

                    {/* Security note */}
                    <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-[12px] text-slate-400">

                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect
                                x="3"
                                y="11"
                                width="18"
                                height="10"
                                rx="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>

                        Secure Asset Management access

                    </div>

                </section>

                {/* Footer */}
                <p className="mt-7 text-center text-[12px] text-slate-400">
                    Asset Management
                </p>

            </div>
        </main>
    );
}