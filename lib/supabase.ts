
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper for standard API responses
export function successResponse(data: any, status = 200) {
    return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 500) {
    return NextResponse.json({ error: message }, { status });
}
