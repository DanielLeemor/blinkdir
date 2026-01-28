
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

    const { error } = await supabase
        .from('blinks')
        .update({
            status: 'approved',
            approved_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        return errorResponse('Failed to approve blink', 500);
    }

    return successResponse({ success: true, message: 'Blink approved' });
}
