
"use client";

import { useState, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
// Using standard debounce approach manually to avoid heavy lodash dependency if not needed, 
// or imply it's handled. For MVP, simple timeout is fine.

export default function SearchBar() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Initialize with URL param
    const [term, setTerm] = useState(searchParams.get('search') || '');

    // Debounced update to URL
    const handleSearch = useCallback((value: string) => {
        setTerm(value); // Update input immediately

        // Debounce URL update
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set('search', value);
            } else {
                params.delete('search');
            }
            // Reset pagination on new search
            params.delete('offset');

            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchParams, pathname, router]);

    return (
        <div className="search-container">
            <div className="search-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 21L16.65 16.65" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <input
                type="text"
                className="search-input"
                placeholder="Search for blinks, actions, utilities..."
                value={term}
                onChange={(e) => {
                    setTerm(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const params = new URLSearchParams(searchParams.toString());
                        if (term) params.set('search', term);
                        else params.delete('search');
                        params.delete('offset');
                        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                    }
                }}
            />
        </div>
    );
}
