"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function SearchBar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [term, setTerm] = useState(searchParams.get('search') || '');

    // Properly debounced search with useEffect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (term) {
                params.set('search', term);
            } else {
                params.delete('search');
            }
            params.delete('offset');
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [term, searchParams, pathname, router]);

    return (
        <div className="search-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search for blinks, actions, utilities..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        // Immediate search on Enter
                        const params = new URLSearchParams(searchParams.toString());
                        if (term) params.set('search', term);
                        else params.delete('search');
                        params.delete('offset');
                        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                    }
                }}
                aria-label="Search for blinks"
                role="searchbox"
            />
            <div className="search-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
        </div>
    );
}
