
import { NextRequest } from 'next/server';
import { supabase, successResponse, errorResponse } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    const { error } = await supabase
        .from('blinks')
        .update({
            status: 'rejected',
            rejection_reason: reason || 'Violation of terms'
        })
        .eq('id', id);

    if (error) {
        return errorResponse('Failed to reject blink', 500);
    }

    return successResponse({ success: true, message: 'Blink rejected' });
}
