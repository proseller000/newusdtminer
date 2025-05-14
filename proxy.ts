import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxN8xgy-v94DO7fbdrLzHxwyyNR2wMAVl0-p5vetFlajVHPEcM_sNYQAXaalHvtCzwr/exec';

serve(async (req: Request) => {
  // Define CORS headers manually
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight (OPTIONS) requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  if (req.method === "GET" && url.pathname === "/") {
    return serveFile(req, "./index.html");
  }

  if (req.method === "POST" && url.pathname === "/api") {
    try {
      const body = await req.json();
      console.log(`Received request for action: ${body.action}`, body);

      const response = await fetch(GOOGLE_SHEETS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(`Google Apps Script response for action ${body.action}:`, data);

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error(`Proxy error for action:`, error);
      return new Response(
        JSON.stringify({ status: "error", message: `Proxy error: ${error.message}` }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  return new Response("Not Found", { status: 404 });
}, { port: 3000 });

console.log("Proxy running on http://localhost:3000");
