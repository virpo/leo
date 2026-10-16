# 🪶 Deployment

- Source: `github.com/virpo/leo`, private by default.
- Hosting: Vercel project `echt1/leo`.
- Public fallback: https://leo-gamma-one.vercel.app/
- Intended domain: https://leo.virpo.sk/

The app is static and has no API keys, server, database or runtime speech dependency. Build with `npm ci && npm run build`. Publish with `vercel deploy --prod --scope echt1`. Git integration can also deploy pushes to `main` after the repository connection is established.

## DNS handoff

`virpo.sk` uses Exohosting nameservers. Vercel has accepted ownership and attached `leo.virpo.sk` to this project. DNS still resolves to Exohosting’s wildcard address, `92.240.253.18`.

Add this record at Exohosting:

| Type | Name | Value |
| --- | --- | --- |
| CNAME | leo | 0113d66e83a25067.vercel-dns-017.com. |

If an explicit `leo` A or AAAA record exists, replace only that conflicting record. Keep root-domain records, email and nameservers unchanged. A specific `leo` CNAME takes precedence over the existing wildcard.

Then run `vercel domains verify leo.virpo.sk --project leo --scope echt1`. Vercel provisions HTTPS after DNS is valid. Verify the final hostname with normal TLS validation and repeat the browser checks against it. Do not bypass certificate warnings.

Official reference: [Vercel custom-domain setup](https://vercel.com/docs/domains/set-up-custom-domain).
