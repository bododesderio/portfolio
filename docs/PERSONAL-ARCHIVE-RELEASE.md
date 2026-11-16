# Personal archive release

Release scope: personal portfolio redesign, original BD identity, global public search, reading preferences, repaired gallery image routing, and the Google ProfilePage structured-data correction.

The production update uses the existing `myportfolio` compose project at `/opt/myportfolio`. Only the app service is rebuilt/recreated. PostgreSQL, Redis, uploaded files, and editorial records remain in their existing volumes. Seeding is explicitly disabled for this update. There are no new database migrations.

## Validation

- TypeScript and ESLint pass.
- 198 tests pass, including malformed-session rejection, private-content search exclusion, and uppercase image routing.
- The full production build passes before deployment.
- The first production pass covers 30 responsive layouts with zero failures, validates ProfilePage → Person, checks anonymous admin rejection, image optimization, and visible content without JavaScript. The second pass covers 30 admin layouts, six public refinements, editor persistence, keyboard behavior, timeline fields, and inbox selection. See the JSON reports in `docs/personal-redesign/`.

## Recovery point

Before the update, database and upload archives were created and their gzip integrity checked at:

`/opt/myportfolio-backups/20261116T150941Z`

The previous image is retained as:

`bodo-portfolio:rollback-20261116T150941Z`

The recovery directory also contains the previous Git revision and private environment/compose configuration. Those private files remain on the server.

Rollback uses the saved image and the existing volumes, without rebuilding or restoring the database. Database restoration should only be needed if a separate data problem is established; the current release does not alter the schema or seed editorial content.

## Search Console

After the deployed `/about` markup is verified, run the live URL in Google's Rich Results Test and select **Validate fix** in the Search Console Profile page report. A code deployment alone does not make Google re-crawl or close its report immediately.

## Editing studio refinement

The second release adds the admin studio, separate analytics page, searchable work/writing lists, a responsive inbox, focused editors, safe structured-field handling, and active public section navigation. Rooibok’s website and Kakebe’s team listing are linked through a targeted CMS update. There are still no new migrations and production seeding remains disabled.

The original personal archive app revision is `c56e5e90479a592baa891ad675f4ea4d25fc7bf4`. The final refinement revision and production walkthrough are recorded after deployment.

The editing-studio recovery point is `/opt/myportfolio-backups/20261116T172640Z-studio`. Its database and upload archives passed gzip integrity checks, and the pre-studio image is retained through the recovery override. The existing editorial/message/subscriber/media record counts matched the pre-deployment baseline after the requested URL/profile changes.
