# Requested updates
- [x] Fix browser settings persistence and official links without deleting movies.
- [x] Add series, seasons, episodes and playback navigation.
- [x] Verify settings and episode flows on mobile and desktop.
- [x] Add shared movie saving and VIP / Shop pages; public pages and automated checks pass.
- [x] Add Admin movie file uploads using PUT, percentage progress, cancellation and confirmed Supabase saving.
- [ ] Verify successful upload and site read-back: live Worker returns 401 Wrong secret instead of the provided unauthenticated code.
- [ ] Verify authenticated admin flow: the earlier default admin login is rejected by current shared settings; user must sign in with their current admin credentials.
- [ ] Support files beyond Cloudflare's incoming request limit: user's current Worker needs multipart upload endpoints; single PUT cannot remove this external limit.