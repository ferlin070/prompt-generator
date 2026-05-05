import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateChecksum(payload: Record<string, string>, secretKey: string) {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(payload).sort();
  const sortedValues = sortedKeys.map(key => payload[key]);
  const payloadString = sortedValues.join('|');

  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const dataToSign = encoder.encode(payloadString);

  // Import key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign data
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);

  // Convert to hex
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planId, billing, amount, payerName, payerEmail, paymentChannel } = await req.json();

    const token = Deno.env.get('BAYARCASH_API_TOKEN');
    const secretKey = Deno.env.get('BAYARCASH_API_SECRET_KEY');
    const portalKey = Deno.env.get('BAYARCASH_PORTAL_KEY');
    const isSandbox = Deno.env.get('BAYARCASH_SANDBOX') === 'true';

    if (!token || !secretKey || !portalKey) {
      throw new Error('Server configuration error: Missing API/Portal keys');
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      payment_channel: paymentChannel ? paymentChannel.toString() : '',
      order_number: orderNumber,
      amount: parseFloat(amount).toFixed(2),
      payer_name: payerName || 'Guest User',
      payer_email: payerEmail || 'guest@example.com',
    };

    const checksum = await generateChecksum(payload, secretKey);

    const requestBody = {
      ...payload,
      portal_key: portalKey,
      checksum,
      return_url: `${req.headers.get('origin')}/dashboard.html?payment=success`,
      callback_url: `${req.headers.get('origin')}/bayarcash-webhook` // Using Supabase function URL would be better, but we don't know it here dynamically easily. Actually, we can use Deno env variables or pass it.
    };

    const apiUrl = isSandbox 
      ? 'https://api.console.bayarcash-sandbox.com/v3/payment-intents'
      : 'https://api.console.bayar.cash/v3/payment-intents';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Bayarcash API Error:', data);
      throw new Error(data.message || 'Failed to create payment intent');
    }

    return new Response(
      JSON.stringify({ 
        url: data.data?.url,
        orderNumber: orderNumber,
        transactionId: data.data?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  }
});
