
import { NextRequest } from 'next/server';
import { supabase, successResponse, errorResponse } from '@/lib/supabase';

export const revalidate = 60; // Cache for 60 seconds (ISR)

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const featured = searchParams.get('featured') === 'true';

        let query = supabase
            .from('blinks')
            .select('*', { count: 'exact' })
            .eq('status', 'approved'); // Only show approved blinks publicy

        // Filter by category
        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        // Filter by search term (name or description)
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Filter by featured
        if (featured) {
            query = query.eq('featured', true);
        }

        // Sorting: Featured first (Premium then Basic), then by views/newest
        // Note: Complex sorting is easier with multiple queries or SQL functions, 
        // but for MVP we'll sort by featured desc, then created_at desc
        query = query
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: blinks, error, count } = await query;

        if (error) {
            console.error('Supabase error fetching blinks:', error);
            return errorResponse('Failed to fetch blinks', 500);
        }

        return successResponse({
            blinks: blinks || [],
            total: count || 0,
            hasMore: (count || 0) > offset + limit
        });

    } catch (error) {
        console.error('Unexpected error in GET /api/blinks:', error);
        return errorResponse('Internal server error', 500);
    }
}
