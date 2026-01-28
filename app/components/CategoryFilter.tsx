
"use client";

import { CATEGORIES } from '@/lib/types';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CategoryFilter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentCategory = searchParams.get('category') || 'all';

    const selectCategory = (slug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug === 'all') {
            params.delete('category');
        } else {
            params.set('category', slug);
        }
        params.delete('offset'); // Reset pagination
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
                onClick={() => selectCategory('all')}
                className={cn(
                    "filter-btn",
                    currentCategory === 'all' && "active"
                )}
            >
                All
            </button>

            {CATEGORIES.map((cat) => (
                <button
                    key={cat.slug}
                    onClick={() => selectCategory(cat.slug)}
                    className={cn(
                        "filter-btn",
                        currentCategory === cat.slug && "active"
                    )}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}
