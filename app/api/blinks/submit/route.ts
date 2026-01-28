
import { NextRequest } from 'next/server';
import { supabase, successResponse, errorResponse } from '@/lib/supabase';
import { blinkSubmissionSchema, validateBlinkUrl } from '@/lib/validation';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
    try {
        // 0. Rate Limiting Protection
        const { success } = await rateLimit(request);
        if (!success) {
            return errorResponse('Too many submissions. Please try again later.', 429);
        }

        const body = await request.json();

        // 1. Zod Validation
        const validationResult = blinkSubmissionSchema.safeParse(body);

        if (!validationResult.success) {
            return errorResponse((validationResult.error as any).errors[0].message, 400);
        }

        const { url, name, description, category, creator_name, creator_twitter, creator_email } = validationResult.data;

        // 2. Check if already exists
        const { data: existing } = await supabase
            .from('blinks')
            .select('id')
            .eq('url', url)
            .single();

        if (existing) {
            return errorResponse('This Blink URL has already been submitted', 409);
        }

        // 3. Validate Action URL (Fetch metadata)
        const actionValidation = await validateBlinkUrl(url);
        if (!actionValidation.isValid) {
            return errorResponse(`Invalid Blink URL: ${actionValidation.error}`, 400);
        }

        // 4. Generate Screenshot
        let screenshotUrl = actionValidation.metadata?.icon || '/placeholder.png';

        if (process.env.SCREENSHOT_API_KEY) {
            const encodedUrl = encodeURIComponent(url);
            // Generate a direct link to the image (cached by ScreenshotOne)
            // We use standard Open Graph resolution (1200x630)
            screenshotUrl = `https://api.screenshotone.com/take?access_key=${process.env.SCREENSHOT_API_KEY}&url=${encodedUrl}&full_page=false&viewport_width=1200&viewport_height=630&device_scale_factor=1&format=jpg&image_quality=80&block_ads=true&block_cookie_banners=true&block_trackers=true&wait_for_selector=body`;
        }

        // 5. Insert into DB
        const { data: newBlink, error: insertError } = await supabase
            .from('blinks')
            .insert({
                url,
                name,
                description,
                category,
                creator_name,
                creator_twitter,
                creator_email,
                icon_url: actionValidation.metadata?.icon,
                screenshot_url: screenshotUrl,
                status: 'pending', // Default status
                source: 'submission',
                views: 0,
                clicks: 0
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return errorResponse('Failed to submit Blink', 500);
        }

        return successResponse({
            success: true,
            message: 'Blink submitted successfully! It is now pending review.',
            blink: newBlink
        }, 201);

    } catch (error) {
        console.error('Submit error:', error);
        return errorResponse('Internal server error', 500);
    }
}
