
import { NextRequest } from 'next/server';
import { supabase, successResponse, errorResponse } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return errorResponse('Unauthorized', 401);
    }

    const { data: blinks, error } = await supabase
        .from('blinks')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        return errorResponse('Failed to fetch pending blinks', 500);
    }

    return successResponse({ blinks: blinks || [], total: blinks?.length || 0 });
}
