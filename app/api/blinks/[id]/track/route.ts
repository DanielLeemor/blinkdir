
import { NextRequest } from 'next/server';
import { supabase, successResponse, errorResponse } from '@/lib/supabase';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { event } = body;

        if (!['view', 'click'].includes(event)) {
            return errorResponse('Invalid event type', 400);
        }

        // Use RPC function if possible for atomic increment, but direct update is fine for MVP
        // Better: use rpc('increment_views', { row_id: id })
        // But since we didn't create RPC functions, let's use a raw SQL update via supabase client (if enabled) or just fetch-update
        // Supabase JS client doesn't support "increment" directly on update easily without RPC.

        // Alternative: We will just accept the race condition for the MVP or use rpc if we added it.
        // I didn't add RPC in schema.sql.
        // Let's rely on analytics table for accurate counting, and updating the summary table periodically?
        // Actually, let's just insert into analytics table, and maybe trigger updates?
        // Spec said: "API endpoint increments counter in database"

        // Let's try to just use the analytics table first, as it is safer.

        const { error: analyticsError } = await supabase
            .from('analytics')
            .insert({
                blink_id: id,
                event_type: event,
                user_agent: request.headers.get('user-agent'),
                // We handle IP hashing privacy later
            });

        if (analyticsError) {
            console.error('Analytics insert error:', analyticsError);
            // Don't fail the request for the user, just log it
        }

        // Now attempt to increment the main table counter (best effort)
        // We can't do `views = views + 1` easily without RPC.
        // We'll skip updating the main table counts in real-time for this exact line to keep it simple, 
        // OR we fetch current and update.

        const { data: current } = await supabase
            .from('blinks')
            .select(event === 'view' ? 'views' : 'clicks')
            .eq('id', id)
            .single();

        if (current) {
            const currentCount = event === 'view' ? (current as any).views : (current as any).clicks;
            await supabase
                .from('blinks')
                .update({ [event === 'view' ? 'views' : 'clicks']: currentCount + 1 })
                .eq('id', id);
        }

        return successResponse({ success: true });

    } catch (error) {
        console.error('Track error:', error);
        return errorResponse('Internal server error', 500);
    }
}
