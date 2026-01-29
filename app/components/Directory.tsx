"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BlinkCard from "./BlinkCard";
import { Blink } from "@/lib/types";
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';

const ITEMS_PER_PAGE = 12;

export default function Directory() {
    const searchParams = useSearchParams();
    const [blinks, setBlinks] = useState<Blink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const paramsString = searchParams.toString();

    // Reset page when search/category filters change
    useEffect(() => {
        setPage(1);
    }, [paramsString]);

    useEffect(() => {
        const fetchBlinks = async () => {
            // Only show full loading state (skeletons) if we have no data yet
            if (blinks.length === 0) {
                setLoading(true);
            }
            setError(null);

            try {
                const currentParams = new URLSearchParams(paramsString);
                const offset = (page - 1) * ITEMS_PER_PAGE;

                currentParams.set('limit', ITEMS_PER_PAGE.toString());
                currentParams.set('offset', offset.toString());

                const res = await fetch(`/api/blinks?${currentParams.toString()}`);

                if (!res.ok) {
                    throw new Error('Failed to fetch blinks');
                }

                const data = await res.json();

                if (data.blinks) {
                    setBlinks(data.blinks);
                    setTotal(data.total || 0);
                }
            } catch (err) {
                console.error("Failed to fetch blinks", err);
                setError(err instanceof Error ? err.message : 'An error occurred while loading blinks.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlinks();
        // Note: blinks.length intentionally NOT in deps to avoid re-fetch loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsString, page]);

    if (!loading && !error && blinks.length === 0) {
        return (
            <section id="directory" className="section pt-0 min-h-[500px]">
                <div className="container">
                    <div className="flex flex-col items-center mb-12">
                        <SearchBar />
                        <CategoryFilter />
                    </div>
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2 text-white">No Blinks Found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="directory" className="section pt-0 min-h-[500px]">
                <div className="container">
                    <div className="flex flex-col items-center mb-12">
                        <SearchBar />
                        <CategoryFilter />
                    </div>
                    <div className="text-center py-20 bg-red-500/10 rounded-xl border border-red-500/20">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-xl font-bold mb-2 text-red-400">Error Loading Blinks</h3>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="directory" className="section pt-0 min-h-[500px]">
            <div className="container">
                <div className="flex flex-col items-center mb-12">
                    <SearchBar />
                    <CategoryFilter />
                </div>

                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-xl font-semibold text-white">
                        {total} Blinks Found
                    </h2>
                </div>

                {loading && blinks.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card h-[380px] overflow-hidden border border-white/5 bg-[#12121a]">
                                <div className="aspect-video bg-white/5" />
                                <div className="p-5 space-y-4">
                                    <div className="h-4 bg-white/5 rounded w-1/4" />
                                    <div className="h-6 bg-white/5 rounded w-3/4" />
                                    <div className="space-y-2">
                                        <div className="h-3 bg-white/5 rounded w-full" />
                                        <div className="h-3 bg-white/5 rounded w-2/3" />
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between">
                                        <div className="h-3 bg-white/5 rounded w-16" />
                                        <div className="h-3 bg-white/5 rounded w-10" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blinks.map((blink) => (
                            <BlinkCard key={blink.id} blink={blink} />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {total > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button
                            onClick={() => {
                                setPage(p => Math.max(1, p - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={page === 1 || loading}
                            className="filter-btn disabled:opacity-50 disabled:cursor-not-allowed hover:text-white"
                        >
                            Previous
                        </button>

                        <span className="text-sm font-medium text-gray-400 px-4">
                            Page <span className="text-white">{page}</span> of <span className="text-white">{Math.ceil(total / ITEMS_PER_PAGE)}</span>
                        </span>

                        <button
                            onClick={() => {
                                setPage(p => p + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={page >= Math.ceil(total / ITEMS_PER_PAGE) || loading}
                            className="filter-btn disabled:opacity-50 disabled:cursor-not-allowed hover:text-white"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
