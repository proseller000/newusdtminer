import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { cors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxN8xgy-v94DO7fbdrLzHxwyyNR2wMAVl0-p5vetFlajVHPEcM_sNYQAXaalHvtCzwr/exec';

serve(async (req: Request) => {
  // Handle CORS
  const corsHeaders = cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    headers: ['Content-Type'],
  });

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Handle POST requests to /api
  if (req.method === 'POST' && new URL(req.url).pathname === '/api') {
    try {
      const body = await req.json();
      console.log(`Received request for action: ${body.action}`, body);

      const response = await fetch(GOOGLE_SHEETS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(`Google Apps Script response for action ${body.action}:`, data);

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error(`Proxy error for action:`, error);
      return new Response(
        JSON.stringify({ status: 'error', message: `Proxy error: ${error.message}` }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // Return 404 for unhandled routes
  return new Response('Not Found', { status: 404 });
}, { port: 3000 });

console.log('Proxy running on http://localhost:3000');