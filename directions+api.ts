
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
const OSRM_API_URL = 'http://router.project-osrm.org/route/v1/foot';

async function geocode(query: string): Promise<{ lat: string, lon: string } | null> {
    // Check if query is already coords "lat,lon"
    if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(query)) {
        const [lat, lon] = query.split(',');
        return { lat, lon };
    }

    try {
        const response = await fetch(`${NOMINATIM_API_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`, {
            headers: {
                'User-Agent': 'VisionMate/1.0' // Nominatim requires User-Agent
            }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon };
        }
        return null;
    } catch (e) {
        console.error('Geocoding error:', e);
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const originQuery = url.searchParams.get('origin');
        const destQuery = url.searchParams.get('destination');

        if (!originQuery || !destQuery) {
            return Response.json({ error: 'Missing origin or destination' }, { status: 400 });
        }

        const origin = await geocode(originQuery);
        const dest = await geocode(destQuery);

        if (!origin || !dest) {
            return Response.json({ error: 'Could not find location coordinates' }, { status: 404 });
        }

        // Call OSRM
        const osrmUrl = `${OSRM_API_URL}/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?steps=true&overview=false`;
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.code !== 'Ok') {
            return Response.json({ error: 'Routing failed' }, { status: 400 });
        }

        // Transform OSRM response to match what app expects (Google-like structure)
        // App expects: routes[0].legs[0].steps[{ html_instructions: "Turn left..." }]
        const route = data.routes[0];
        const dummyLeg = {
            steps: route.legs[0].steps.map((step: any) => ({
                html_instructions: `${step.maneuver.type} ${step.maneuver.modifier ? step.maneuver.modifier : ''} on ${step.name || 'path'}`
            })),
            distance: { text: `${(route.distance / 1000).toFixed(1)} km` },
            duration: { text: `${Math.round(route.duration / 60)} mins` }
        };

        return Response.json({
            status: 'OK',
            routes: [{ legs: [dummyLeg] }]
        });

    } catch (error) {
        console.error('Directions API Handler Error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
