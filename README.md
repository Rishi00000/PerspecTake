# PerspecTake

**Your perspective. Your take. Your originality.**

PerspecTake is an MCP-powered originality coach for LinkedIn creators. It
compares a post idea with a small local reference collection and a sample
creator's post history, explains generic framing, and helps turn a personal
insight into a more distinctive angle.

The demo uses deterministic local analysis and sample data. It does not connect
to LinkedIn, require credentials, or claim to prove that an idea has never been
published.

## Run locally

Install the root dependencies and start the MCP server:

```bash
npm install
npm run dev
```

In another terminal, run the widget development server:

```bash
npm run widget
```

Build the MCP server and widget separately with `npm run build` and
`npm run widget:build`.

## Try it in NitroStudio

Open the project in [NitroStudio](https://nitrostack.ai/studio), then invoke
`open_perspectake` to launch the idea form. Analyze an idea, provide a personal
insight in the results widget, then copy or save the refined angle.

### MCP tools

- `open_perspectake` opens the creator workflow.
- `analyze_idea_originality` compares an idea against sample reference content
  and the sample creator's previous posts.
- `refine_idea_angle` uses the creator's supplied insight to produce a
  more-specific angle without inventing personal experience.
- `get_creator_context` returns the sample profile and content history.
- `save_idea` keeps a refined idea in the current server process.

### MCP resources and prompt

- `creator://profile` — sample creator profile.
- `creator://content-history` — sample creator's previous posts.
- `originality_evaluation` — reusable originality evaluation prompt.

The creator profile and reference collection are in [fixtures/creator-profile.json](./fixtures/creator-profile.json)
and [fixtures/reference-posts.json](./fixtures/reference-posts.json).

## MCP protocol version (optional)

The server runs in `auto` mode by default. Override the wire revision with
`NITRO_MCP_PROTOCOL_VERSION` if needed:

```bash
# default (when unset): serve both modern and legacy statelessly
NITRO_MCP_PROTOCOL_VERSION=auto

# new stateless spec only (strict mode)
NITRO_MCP_PROTOCOL_VERSION=2026-07-28

# legacy 2025 sessionful wire
NITRO_MCP_PROTOCOL_VERSION=2025-06-18
```

See [.env.example](./.env.example) for details.

For framework documentation, visit <https://docs.nitrostack.ai>.
