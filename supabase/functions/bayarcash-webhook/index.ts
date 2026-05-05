import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyChecksum(payload: Record<string, string>, receivedChecksum: string, secretKey: string) {
  const sortedKeys = Object.keys(payload).sort();
  const sortedValues = sortedKeys.map(key => payload[key]);
  const payloadString = sortedValues.join('|');

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const dataToSign = encoder.encode(payloadString);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
  const hashArray = Array.from(new Uint8Array(signature));
  const expectedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return expectedChecksum === receivedChecksum;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    const secretKey = Deno.env.get('BAYARCASH_API_SECRET_KEY');

    if (!secretKey) {
      throw new Error('Server configuration error: Missing Secret Key');
    }

    // Verify Transaction Callback Data
    const payload = {
      record_type: callbackData.record_type,
      transaction_id: callbackData.transaction_id,
      exchange_reference_number: callbackData.exchange_reference_number,
      exchange_transaction_id: callbackData.exchange_transaction_id,
      order_number: callbackData.order_number,
      currency: callbackData.currency,
      amount: callbackData.amount,
      payer_name: callbackData.payer_name,
      payer_email: callbackData.payer_email,
      payer_bank_name: callbackData.payer_bank_name,
      status: callbackData.status,
      status_description: callbackData.status_description,
      datetime: callbackData.datetime,
    };

    const isValid = await verifyChecksum(payload, callbackData.checksum, secretKey);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid checksum' }), { status: 401 });
    }

    // 1 = Successful, 2 = Pending, 3 = Failed
    if (callbackData.status === '1') {
      // TODO: Update user's subscription in Supabase using order_number or payer_email
      // This requires setting up Supabase Client with service_role key to bypass RLS.
      console.log(`Payment successful for order ${callbackData.order_number}`);
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
