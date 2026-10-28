# 14 — Uiverse Originals and Finds

Two kinds of content that aren't captures of other people's sites.

## Uiverse Originals

Interactive pieces made here: widgets, loaders, generative backgrounds, hero templates. They run
live on their detail page, their code is the file itself, and they're free to use under MIT. They
are first-party, so unlike captures they can show code (docs/07 §5.1).

- **The piece:** `public/craft/<slug>.html`. One self-contained file: inline CSS and JS, no
  requests, no inline `on…=` handlers, and a `prefers-reduced-motion` rule if anything moves. The
  first comment names it and carries the licence line. `src/lib/craft.test.ts` checks all of this.
- **The record:** an entry in `src/content/craft.json`. It holds the title and description in
  English and Arabic, the taxonomy (category, industry, style, component type), the palette, and
  how to take the poster.
- **The poster:** `npm run craft:posters` photographs each piece for its feed card, after its wait,
  hover, click or typing, and writes `public/craft/posters/<slug>.jpg`.

To add one: write the HTML, add its record, run `npm run craft:posters -- <slug>`, check it at
`/component/o-<slug>` (or `/screen/o-<slug>` for a hero), then run `npm test`.

Pieces are served from `/craft/*` with their own headers (`next.config.ts`). Only this site may
frame them, and they're sandboxed (scripts only: no storage, cookies or forms) even when opened on
their own. They aren't allowed to make any request.

## Finds

Work by other designers, shown with their permission. Nothing is collected from the web.

1. A creator fills in `/finds/submit`: the work's link, an image link, their name and page, and
   tags. They also confirm the work is theirs and that Uiverse may show it.
2. The submission reaches the operator's inbox the same way takedown requests do (`lib/inbox.ts`:
   `TAKEDOWN_WEBHOOK_URL` and/or the Resend takedown email). In development it's saved to
   `.finds/submissions.jsonl`.
3. To approve it, run the `npm run finds:add -- …` line at the end of the message. It downloads the
   image, keeps a copy at most 1200px wide in `public/finds/`, and adds the record to
   `src/content/finds.json`.
4. Commit those two files and deploy.

To remove a find, delete its record and its image. Reply to the creator either way: the submission
email's reply-to is their address.
