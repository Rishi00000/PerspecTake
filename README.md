# PerspecTake

> An MCP-powered originality coach helping LinkedIn creators find original
> angles for their content.

![Model Context Protocol](https://img.shields.io/badge/Model%20Context%20Protocol-MCP-blue)
![Built with NitroStack](https://img.shields.io/badge/Built%20with-NitroStack-0A66FF)
![Status](https://img.shields.io/badge/status-live-brightgreen)

PerspecTake is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)
server built with [NitroStack](https://nitrostack.ai). It helps LinkedIn
creators evaluate content ideas, spot generic or repetitive framing, and
develop more distinctive angles grounded in their own experience.

## Table of Contents

- [Overview](#overview)
- [What is MCP?](#what-is-mcp)
- [Features](#features)
- [Live Demo](#live-demo)
- [Getting Started](#getting-started)
- [Connect to an MCP Client](#connect-to-an-mcp-client)
- [Deploy Your Own MCP App](#deploy-your-own-mcp-app)
- [Explore More MCP Apps](#explore-more-mcp-apps)
- [FAQ](#faq)
- [Keywords](#keywords)
- [License](#license)

## Overview

PerspecTake is designed for individual LinkedIn creators, students, and
early-career professionals building a personal brand. Enter an idea along with
your niche and audience to see how its framing compares with a sample reference
collection and a creator's previous posts.

The originality assessment highlights common phrasing, related content, and
possible repetition. Then, a follow-up question helps you contribute a personal
experience or insight. PerspecTake uses that input to suggest a more
distinctive angle without inventing personal experiences or evidence.

The demo uses deterministic analysis and local sample data. It does not connect
to LinkedIn or require LinkedIn credentials. Its comparisons reflect only the
available sample material and cannot prove an idea has never been published.
Ideas saved with the demo are kept in memory for the current server process.

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that lets AI
applications connect to external tools and data sources. An MCP server can
provide tools, resources, and prompts that an MCP-compatible client can use.

PerspecTake uses NitroStack to define and serve its MCP capabilities. Learn
more about MCP at [modelcontextprotocol.io](https://modelcontextprotocol.io/)
and NitroStack at [nitrostack.ai](https://nitrostack.ai).

## Features

- **Originality assessment** — evaluate an idea's framing, topic saturation,
  and overlap with a creator's sample post history.
- **Personalized angle refinement** — use the creator's own supplied insight
  to make an idea more specific without fabricating experiences.
- **Creator context** — retrieve a sample creator profile and previous posts.
- **MCP tools, resources, and prompt** — use the workflow from NitroStudio or
  another compatible client.
- **Interactive widgets** — enter an idea, review results, refine an angle,
  and copy or save it.
- **Local sample data** — try the demo without LinkedIn credentials or API
  access.

### MCP capabilities

**Tools**

- `open_perspectake` — open the idea form.
- `analyze_idea_originality` — compare an idea with the sample reference
  collection and creator history.
- `refine_idea_angle` — build a more distinctive angle from the creator's
  personal insight.
- `get_creator_context` — retrieve the sample creator profile and post
  history.
- `save_idea` — save an idea in memory for the current server process.

**Resources**

- `creator://profile` — sample creator profile.
- `creator://content-history` — sample creator's previous posts.

**Prompt**

- `originality_evaluation` — reusable prompt for evaluating a LinkedIn idea.

## Live Demo

- **[Chat](https://nitrochat-perspectake-chat-6ae727-y-r-rishidhar-reddy-fronthyre.app.nitrocloud.ai)**
- **[MCP](https://perspectake-1-6ae7264b-y-r-rishidhar-reddy-fronthyre.app.nitrocloud.ai/sse)**

Connect an MCP-compatible client to the endpoint above to try the hosted
application. For the interactive widget experience, open the project in
[NitroStudio](https://nitrostack.ai/studio).

## Getting Started

### Prerequisites

- Node.js and npm
- An MCP-compatible client, such as NitroStudio

### Installation

```bash
git clone https://github.com/Rishi00000/PerspecTake.git
cd PerspecTake
npm install
```

### Run the MCP server

Start the server in development mode:

```bash
npm run dev
```

Or build and start it:

```bash
npm start
```

### Run the widget app

In another terminal, start the widget development server:

```bash
npm run widget
```

Build the MCP server and widgets with:

```bash
npm run build
npm run widget:build
```

No LinkedIn API credentials are required. The sample creator and reference
content are in [`fixtures/creator-profile.json`](./fixtures/creator-profile.json)
and [`fixtures/reference-posts.json`](./fixtures/reference-posts.json).

## Connect to an MCP Client

For a client that supports remote MCP servers, add the hosted endpoint to its
MCP server configuration. A typical configuration looks like:

```json
{
  "mcpServers": {
    "perspectake": {
      "url": "https://perspectake-1-6ae7264b-y-r-rishidhar-reddy-fronthyre.app.nitrocloud.ai"
    }
  }
}
```

Client configuration formats vary. Restart or reload the client after updating
its configuration, then select PerspecTake's tools from the MCP server.

To try the full widget workflow, use NitroStudio and invoke
`open_perspectake`. Enter a content idea, review its analysis, answer the
follow-up with your own insight, then copy or save the refined angle.

## Deploy Your Own MCP App

PerspecTake is built with [NitroStack](https://nitrostack.ai). Use the
NitroStack CLI and documentation to configure and deploy your own instance:

- [NitroStack](https://nitrostack.ai)
- [NitroStack documentation](https://docs.nitrostack.ai)

Configure deployment through the NitroStack project settings. Do not commit
secrets or credentials to the repository.

## Explore More MCP Apps

- Discover and share MCP projects on [r/mcptothemoon](https://www.reddit.com/r/mcptothemoon/).
- Browse MCP apps on [NitroStack](https://nitrostack.ai/apps).

## FAQ

### What does PerspecTake do?

It evaluates LinkedIn content ideas against sample reference content and a
creator's sample post history, then helps develop an angle using the creator's
own experience or insight.

### Does it connect to LinkedIn?

No. The demo uses local sample data and does not publish to LinkedIn or require
LinkedIn API credentials.

### Does an originality assessment prove an idea is unique?

No. It is based only on the sample reference collection and creator history
available to the demo. It cannot prove that an idea has never been published.

### Which clients can use PerspecTake?

Any client that supports the MCP transport and configuration format used by
the server may connect. NitroStudio is recommended for trying the interactive
widgets.

### Are saved ideas permanent?

No. In the demo, saved ideas are kept in memory and are lost when the server
process stops.

## Keywords

`PerspecTake` · `LinkedIn originality coach` · `MCP` · `Model Context Protocol`
· `MCP server` · `NitroStack` · `creator tools` · `content originality`
· `LinkedIn content ideas` · `AI tools`

## License

MIT © 2026

---

Built with the Model Context Protocol and [NitroStack](https://nitrostack.ai).
