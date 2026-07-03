"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) return setError(data.error || "Login failed");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 m-4 rounded-2xl shadow-md md:p8 w-96 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
            Admin Login
          </h1>
          <p className="text-sm text-gray-600">
            Use your admin credentials to log in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <Button
            type="submit"
            className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition cursor-pointer "
          >
            Login
          </Button>
          {error && <p className="text-red-500">{error}</p>}
        </form>

        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          <p className="mb-3">Need read-only access?</p>
          <Button asChild variant="outline" className="w-full cursor-pointer">
            <Link href="/guest">Continue as guest</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
