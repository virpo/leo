# 🪶 Deployment

- Source: `github.com/virpo/leo`, public and MIT licensed. Asset exceptions are listed in `NOTICE.md`.
- Hosting: Netlify project `leo-virpo`, team `virpo` (Pumpkings).
- Project ID: `fd834e3a-3d17-4016-9957-8d171ce7a691`.
- Public fallback: https://leo-virpo.netlify.app/
- Production domain: https://leo.virpo.io/

The app is static and has no API keys, server, database or runtime speech dependency. Build with `npm ci && npm run build`. Publish with `netlify deploy --prod --dir dist --no-build`.

The source is pushed to `main`. Automatic deploy-on-push is not connected. CLI production deployment to the authenticated Netlify account works.

The per-project Powered by Netlify badge is disabled (`built_with_badge_enabled: false`). Keep third-party promotional overlays out of the child-facing museum view.

2026-10-18 release: application source `510c15b`, six machines and 100 narration files. The public hostname passes all four browser suites in Chrome and WebKit. The final metadata update is deployed separately from the application bundle; both describe the same six-machine release.

Vercel project `echt1/leo` was the initial host. Its account is not connected to the `virpo` GitHub identity. After the first commit, Vercel blocked deployment with “The deployment was blocked because the commit author doesn’t have permission to create deployments for this project.” GitHub integration separately reports “You need to add a Login Connection to your GitHub account first. (400)”. No author identity or access policy was changed. The site was published through the existing authenticated Netlify account instead.

## DNS handoff

Peter corrected the hostname from `.sk` to `.io`. The mistaken `.sk` assignment was removed without changing Exohosting DNS. `virpo.io` uses Namecheap BasicDNS nameservers. Netlify has accepted `leo.virpo.io` as the custom domain. On 2026-10-18, authoritative DNS, Cloudflare and Google all resolved the correct CNAME below. HTTPS was still pending, with curl reporting `SSL: no alternative certificate subject name matches target host name 'leo.virpo.io'`. One certificate-provisioning request was sent to Netlify. Do not repeatedly request issuance or bypass TLS warnings.

The configured record at Namecheap, in `virpo.io` → Advanced DNS:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | leo | leo-virpo.netlify.app |

Keep root-domain records, other subdomains, email and nameservers unchanged. Use Automatic TTL. The earlier Vercel CNAME recommendation is obsolete for this site.

Update, 2026-10-18 at 23:04 CEST: https://leo.virpo.io/ returns HTTP 200 with normal TLS validation and HSTS. The earlier certificate-provisioning issue is resolved. No further DNS or certificate requests are needed. Repeat the browser checks against the final hostname after each release. Do not bypass certificate warnings.

Official references: [Namecheap CNAME setup](https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/), [Netlify CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/).
