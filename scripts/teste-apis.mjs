import crypto from 'node:crypto';
const env = process.env;

// ---------- SHOPEE ----------
async function shopee(campos) {
  const query = `{ productOfferV2(keyword: "barraca camping", limit: 5) { nodes { ${campos} } } }`;
  const payload = JSON.stringify({ query });
  const ts = Math.floor(Date.now() / 1000);
  const sig = crypto.createHash('sha256').update(env.SHOPEE_APP_ID + ts + payload + env.SHOPEE_SECRET).digest('hex');
  const r = await fetch('https://open-api.affiliate.shopee.com.br/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `SHA256 Credential=${env.SHOPEE_APP_ID}, Timestamp=${ts}, Signature=${sig}` },
    body: payload,
  });
  return { status: r.status, corpo: await r.json().catch(() => null) };
}
if (env.SHOPEE_APP_ID && env.SHOPEE_SECRET) {
  const completos = 'itemId productName priceMin priceMax priceDiscountRate ratingStar sales imageUrl offerLink';
  let res = await shopee(completos);
  if (res.corpo?.errors) {
    console.log('[shopee] erro com campos completos:', JSON.stringify(res.corpo.errors).slice(0, 400));
    res = await shopee('itemId productName priceMin offerLink');
  }
  const nodes = res.corpo?.data?.productOfferV2?.nodes || [];
  console.log(`[shopee] status=${res.status} produtos=${nodes.length}`);
  if (res.corpo?.errors) console.log('[shopee] erros:', JSON.stringify(res.corpo.errors).slice(0, 400));
  for (const n of nodes.slice(0, 3)) console.log('[shopee] exemplo:', JSON.stringify({ ...n, offerLink: n.offerLink ? 'OK' : null }).slice(0, 300));
} else console.log('[shopee] chaves não cadastradas');

// ---------- MERCADO LIVRE ----------
if (env.ML_CLIENT_ID && env.ML_CLIENT_SECRET && env.ML_CODE) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code', client_id: env.ML_CLIENT_ID, client_secret: env.ML_CLIENT_SECRET,
    code: env.ML_CODE.trim(), redirect_uri: 'https://ingridbuchignani-debug.github.io/ofertas/',
  });
  const t = await fetch('https://api.mercadolibre.com/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body });
  const tj = await t.json().catch(() => ({}));
  console.log(`[ml] token status=${t.status} ok=${!!tj.access_token} ${tj.access_token ? '' : JSON.stringify(tj).slice(0, 200)}`);
  if (tj.access_token) {
    const h = { Authorization: `Bearer ${tj.access_token}` };
    for (const [nome, url] of [
      ['sites-search', 'https://api.mercadolibre.com/sites/MLB/search?q=barraca%20camping&limit=5'],
      ['products-search', 'https://api.mercadolibre.com/products/search?status=active&site_id=MLB&q=barraca%20camping&limit=5'],
      ['trends', 'https://api.mercadolibre.com/trends/MLB'],
    ]) {
      const r = await fetch(url, { headers: h });
      const txt = await r.text();
      console.log(`[ml] ${nome} status=${r.status} inicio=${txt.slice(0, 250).replace(/\s+/g, ' ')}`);
    }
  }
} else console.log('[ml] chaves não cadastradas');
