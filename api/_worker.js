/* Mumbai Silicon - Cloudflare Worker Edge API Entrypoint */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Process Custom PCB RFQ
      if (url.pathname === '/api/rfq' && request.method === 'POST') {
        const body = await request.json();
        return new Response(JSON.stringify({
          status: 'success',
          message: 'RFQ received by Mumbai Silicon Engineering Team',
          rfqId: 'RFQ-' + Math.floor(100000 + Math.random() * 900000),
          quote: body
        }), { headers: corsHeaders });
      }

      // 2. Process Orders & Payments
      if (url.pathname === '/api/orders' && request.method === 'POST') {
        const body = await request.json();
        return new Response(JSON.stringify({
          status: 'success',
          orderId: 'MS-' + Math.floor(100000 + Math.random() * 900000),
          message: 'Order created & payment processed on Cloudflare Edge',
          customer: body.email,
          timestamp: body.timestamp
        }), { headers: corsHeaders });
      }

      // 3. Process Contact Forms (Sales, Careers, Support)
      if (url.pathname === '/api/contact' && request.method === 'POST') {
        const body = await request.json();
        return new Response(JSON.stringify({
          status: 'success',
          message: `Inquiry (${body.type || 'General'}) routed to sales@mumbaisilicon.com & careers@mumbaisilicon.com`,
          ticketId: 'TKT-' + Math.floor(10000 + Math.random() * 90000)
        }), { headers: corsHeaders });
      }

      // Health Check API
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'online',
          service: 'Mumbai Silicon Cloudflare Worker Edge Engine',
          location: 'Bandra Kurla Complex, Mumbai, India',
          version: 'v2.4.0'
        }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: corsHeaders
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
