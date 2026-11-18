export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const file = form.get("file");
  const key = Date.now() + "-" + file.name;
  await env.R2.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  return Response.json({ url: "/r2/" + key });
}
