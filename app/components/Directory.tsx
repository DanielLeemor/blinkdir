
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BlinkCard from './BlinkCard';
import { Blink } from '@/lib/types';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';

// Client component for the directory grid
export default function Directory() {
    const searchParams = useSearchParams();
    const [blinks, setBlinks] = useState<Blink[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Fetch logic
    useEffect(() => {
        const fetchBlinks = async () => {
            setLoading(true);
            try {
                const query = searchParams.toString();
                const res = await fetch(`/api/blinks?${query}`);
                const data = await res.json();
                if (data.blinks) {
                    setBlinks(data.blinks);
                    setTotal(data.total);
                }
            } catch (err) {
                console.error("Failed to fetch blinks", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlinks();
    }, [searchParams]);

    return (
        <section id="directory" className="section pt-0 min-h-[500px]">
            <div className="container">

                {/* Filters & Search */}
                <div className="flex flex-col items-center mb-12">
                    <SearchBar />
                    <CategoryFilter />
                </div>

                {/* Results Info */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-xl font-semibold">
                        {loading ? 'Searching...' : `${total} Blinks Found`}
                    </h2>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white/5 h-[350px] rounded-xl border border-white/5"></div>
                        ))}
                    </div>
                ) : blinks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blinks.map((blink) => (
                            <BlinkCard key={blink.id} blink={blink} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">No Blinks Found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
