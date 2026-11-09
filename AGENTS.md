<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- All app data (movies, users, payments, settings) goes through `src/lib/store.ts` (`useDB`/`update`); it is localStorage-backed until the user's own Supabase is connected, so swap the storage there rather than in pages.
- Series reuse the existing content model and detail route with nested seasons and episodes, preserving existing movie IDs and playback access rules.
- Define form wrapper components at module scope so state updates do not remount inputs or discard focus.
- Upgrade legacy contact settings once using a version marker; later admin edits must survive refresh without being overwritten by defaults.
- Movie file uploads stream directly from the browser via XMLHttpRequest PUT; only the confirmed returned URL is sent through saveMovie to Supabase, avoiding app-server file body limits.
- Server function modules keep privileged helpers in vj.server.ts and dynamically load them inside handlers to preserve the client/server boundary.
- Admin operations validate Supabase Auth tokens and the caller's own protected user_roles row before loading privileged data; never store or accept legacy admin passwords in browser storage.
