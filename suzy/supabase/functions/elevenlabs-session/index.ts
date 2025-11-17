import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    // Allow passing agentId from client, fallback to secret for convenience
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }
    const agentIdFromBody = body?.agentId as string | undefined;

    const AGENT_ID = agentIdFromBody || Deno.env.get("AGENT_ID") || Deno.env.get("VOICE_ID"); // VOICE_ID fallback for legacy setups

    if (!ELEVENLABS_API_KEY) {
      throw new Error("Missing ELEVENLABS_API_KEY");
    }
    if (!AGENT_ID) {
      throw new Error("Missing ElevenLabs Agent ID");
    }

    // Get signed URL from ElevenLabs Conversational Agent
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${AGENT_ID}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("ElevenLabs API error:", response.status, error);
      throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ signedUrl: data.signed_url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
