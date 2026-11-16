# Personal archive release

Release scope: personal portfolio redesign, original BD identity, global public search, reading preferences, repaired gallery image routing, and the Google ProfilePage structured-data correction.

The production update uses the existing `myportfolio` compose project at `/opt/myportfolio`. Only the app service is rebuilt/recreated. PostgreSQL, Redis, uploaded files, and editorial records remain in their existing volumes. Seeding is explicitly disabled for this update. There are no new database migrations.

## Validation

- TypeScript and ESLint pass.
- 194 tests pass, including malformed-session rejection, private-content search exclusion, and uppercase image routing.
- The production build is checked before deployment.
- The earlier browser pass covers 30 responsive pages, nine interaction checks, and the admin rich-text editors; production smoke checks are recorded after deployment.

## Recovery point

Before the update, database and upload archives were created and their gzip integrity checked at:

`/opt/myportfolio-backups/20261116T150941Z`

The previous image is retained as:

`bodo-portfolio:rollback-20261116T150941Z`

The recovery directory also contains the previous Git revision and private environment/compose configuration. Those private files remain on the server.

Rollback uses the saved image and the existing volumes, without rebuilding or restoring the database. Database restoration should only be needed if a separate data problem is established; the current release does not alter the schema or seed editorial content.

## Search Console

After the deployed `/about` markup is verified, run the live URL in Google's Rich Results Test and select **Validate fix** in the Search Console Profile page report. A code deployment alone does not make Google re-crawl or close its report immediately.
