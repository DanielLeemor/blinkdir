
import { NextRequest } from 'next/server';
import { supabase, successResponse, errorResponse } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate UUID format roughly
        if (!id || id.length < 30) {
            return errorResponse('Invalid ID', 400);
        }

        const { data: blink, error } = await supabase
            .from('blinks')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !blink) {
            return errorResponse('Blink not found', 404);
        }

        return successResponse(blink);

    } catch (error) {
        console.error('Error fetching blink:', error);
        return errorResponse('Internal server error', 500);
    }
}
