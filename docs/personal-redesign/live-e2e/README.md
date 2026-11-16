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

Raw MCP transcripts, snapshots, screenshots, session recordings, and `final-playwright-trace.zip` remain in this directory locally and are excluded from Git. The trace can be opened with Playwright Trace Viewer. The initial session includes retried test selectors and two transient `ERR_NETWORK_CHANGED` requests; the independent production crawl found no application errors. No production credentials are recorded.

## Final refinement pass

The public walkthrough was repeated against the deployed refinement: active biography contents, Rooibok’s corrected website link, Kakebe’s team listing, work filters, article search/detail, global search, persisted reading settings, gallery keyboard controls, contact UI, and mobile navigation. The populated-search Escape check exposed a browser-native clear action; the fix is covered by `reader-keyboard-verification.json` and passes again on production at 1440px and 390px. The final app revision is `39ab77ad4634c2679c3f7646c752934eacbd3ce3`; its visible browser reports zero console errors.

Authenticated admin save, structured editing, navigation, and archive/restore operations use isolated demo data. The production browser’s admin tab remains available for the owner to sign in; these tests do not obtain or mint a production session.

[Open the final local Playwright trace](final-playwright-trace.zip). The final login checks cover responsive layout, required fields, password visibility, and noindex metadata; production credentials were not entered by the agent.
