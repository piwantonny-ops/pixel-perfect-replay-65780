<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All app data (movies, users, payments, settings) goes through `src/lib/store.ts` (`useDB`/`update`); it is localStorage-backed until the user's own Supabase is connected, so swap the storage there rather than in pages.
- Series reuse the existing content model and detail route with nested seasons and episodes, preserving existing movie IDs and playback access rules.
- Define form wrapper components at module scope so state updates do not remount inputs or discard focus.
- Upgrade legacy contact settings once using a version marker; later admin edits must survive refresh without being overwritten by defaults.
