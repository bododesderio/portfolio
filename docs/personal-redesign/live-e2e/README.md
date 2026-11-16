# Visible Playwright MCP walkthrough

The browser walkthrough uses the locally installed `@playwright/mcp` 0.0.85 server, launched in headed Chrome on the shared display. Tools are called through its JSON-RPC stdio transport. It is a real MCP session; the separate responsive crawl uses the Python Playwright client.

The first live release at https://bododesderio.com was checked for:

- Home and About navigation, life history, interests, and a named `Person` in `ProfilePage.mainEntity`.
- Work status filters and a project detail page.
- Writing topic filters, search, and an article detail page.
- Global search, database-backed project results, and an empty-result state.
- Large text, wide layout, dark appearance, persistence after reload, and reset.
- Escape dismissal and restored keyboard focus.
- Photograph categories, arrow navigation, Escape, and restored focus.
- Required contact fields and a simulated successful submission that clears the form. The browser intercepts this POST; no message or email is sent.
- Mobile navigation, search, and layout fit at 390px.

The subsequent admin pass uses an isolated local database with demo records. The production admin is never populated with QA fixtures. The recorded checks cover 30 admin route/layout combinations, authenticated work search, filters, published-editor persistence, actual timeline field shapes, unsaved edits across collapse/filtering, mobile drawer focus, and mobile inbox navigation.

Reports: [initial live checks](../production-verification.json), [admin checks](../admin-verification.json), [refinement checks](../refinement-verification.json), and [MCP summary](report.json).

Raw MCP transcripts, snapshots, screenshots, session recordings, and `playwright-trace.zip` remain in this directory locally and are excluded from Git. The trace can be opened with Playwright Trace Viewer. The initial session includes retried test selectors and two transient `ERR_NETWORK_CHANGED` requests; the independent production crawl found no application errors. No production credentials are recorded.
