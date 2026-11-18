export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM movies ORDER BY created_at DESC").all();
  return Response.json(results);
}
export async function onRequestPost({ request, env }) {
  const m = await request.json();
  const id = Date.now().toString();
  await env.DB.prepare("INSERT INTO movies (id,title,description,poster_url,video_url,category,created_at) VALUES (?,?,?,?,?,?,?)")
    .bind(id, m.title, m.description, m.poster_url, m.video_url, m.category, new Date().toISOString()).run();
  return Response.json({ ok: true, id });
}
