const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
async function tenta(nome, url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'pt-BR,pt;q=0.9' } });
    const t = await r.text();
    const cards = (t.match(/poly-card|ui-search-layout__item/g) || []).length;
    const precos = (t.match(/andes-money-amount--previous/g) || []).length;
    const json = t.trim().startsWith('{');
    console.log(`[${nome}] status=${r.status} tamanho=${t.length} cards=${cards} precosAntigos=${precos} json=${json}`);
    console.log(`[${nome}] inicio: ${t.slice(0, 300).replace(/\s+/g, ' ')}`);
  } catch (e) { console.log(`[${nome}] ERRO ${e.message}`); }
}
await tenta('api-search', 'https://api.mercadolibre.com/sites/MLB/search?q=barraca%20camping&limit=5');
await tenta('pagina-busca', 'https://lista.mercadolivre.com.br/barraca-camping');
await tenta('pagina-ofertas', 'https://www.mercadolivre.com.br/ofertas');
