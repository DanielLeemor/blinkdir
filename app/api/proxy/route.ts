import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    try {
        // Simple validation to prevent SSRF abuse (basic level)
        // In production, you'd want a strict allowlist or deeper validation
        if (!url.startsWith('http')) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'BlinkDir-Bot/1.0', // Polite identification
            },
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            console.error(`Proxy fetch failed for ${url}: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: `Target failed: ${response.statusText}`, details: response.status },
                { status: response.status }
            );
        }

        // Try to parse JSON, if it's HTML, fail gracefully
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
            console.error(`Proxy received non-JSON for ${url}: ${contentType}`);
            return NextResponse.json({ error: 'Target returned non-JSON data (likely HTML)' }, { status: 406 });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    try {
        // Validation
        if (!url.startsWith('http')) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        // Get the body from the incoming request
        const body = await request.json();

        // Forward the POST request to the Blink action endpoint
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'BlinkDir-Bot/1.0',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error(`Proxy POST failed for ${url}: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: `Target failed: ${response.statusText}`, details: response.status },
                { status: response.status }
            );
        }

        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
            console.error(`Proxy received non-JSON for ${url}: ${contentType}`);
            return NextResponse.json({ error: 'Target returned non-JSON data' }, { status: 406 });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Proxy POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
