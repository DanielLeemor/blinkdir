
"use client";

import { useEffect, useState } from "react";
import { Blink } from "@/lib/types";

export default function AdminDashboard() {
    const [pendingBlinks, setPendingBlinks] = useState<Blink[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/blinks/pending");
            if (res.ok) {
                const data = await res.json();
                setPendingBlinks(data.blinks || []);
            }
        } catch (error) {
            console.error("Failed to fetch pending blinks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/blinks/${id}/${action}`, {
                method: "POST",
                body: JSON.stringify(action === 'reject' ? { reason: 'Admin rejected' } : {}),
            });

            if (res.ok) {
                // Remove from list
                setPendingBlinks(prev => prev.filter(b => b.id !== id));
            }
        } catch (error) {
            alert("Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen p-8 pt-24 bg-[#0a0a0f]">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <span className="text-gray-400 text-sm">Pending</span>
                            <div className="text-xl font-bold">{pendingBlinks.length}</div>
                        </div>
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-semibold">Pending Submissions</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">Blink</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Source</th>
                                    <th className="p-4">Submitted</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
                                ) : pendingBlinks.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No pending submissions</td></tr>
                                ) : (
                                    pendingBlinks.map((blink) => (
                                        <tr key={blink.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {blink.icon_url && <img src={blink.icon_url} className="w-8 h-8 rounded" alt="" />}
                                                    <div>
                                                        <div className="font-medium text-white">{blink.name}</div>
                                                        <a href={blink.url} target="_blank" className="text-xs text-blue-400 hover:underline">{blink.url}</a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-300">
                                                <span className="px-2 py-1 rounded bg-white/10 capitalize">{blink.category}</span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-400">
                                                {blink.source}
                                            </td>
                                            <td className="p-4 text-sm text-gray-400">
                                                {new Date(blink.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleAction(blink.id, 'reject')}
                                                    disabled={actionLoading === blink.id}
                                                    className="px-3 py-1 text-sm text-red-400 hover:bg-red-500/10 rounded border border-red-500/20"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAction(blink.id, 'approve')}
                                                    disabled={actionLoading === blink.id}
                                                    className="px-3 py-1 text-sm bg-green-500 text-white hover:bg-green-600 rounded"
                                                >
                                                    {actionLoading === blink.id ? '...' : 'Approve'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
