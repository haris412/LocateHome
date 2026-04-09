import { environment } from '../../../../environments/environment';

const FALLBACK_LISTING_IMAGE = 'assets/images/listings/featured-1.png';

function encodeS3ObjectKey(key: string): string {
  return key
    .split('/')
    .filter(seg => seg.length > 0)
    .map(seg => encodeURIComponent(seg))
    .join('/');
}

/**
 * Parses only the legacy `s3://bucket/key` form from backends that store that scheme.
 * Does **not** apply to HTTPS URLs like `https://bucket.s3.eu-north-1.amazonaws.com/key` — those are handled in {@link resolvePropertyImageUrlForDisplay} first.
 */
function parseS3ColonUri(value: string): { bucket: string; key: string } | null {
  if (!value.toLowerCase().startsWith('s3://')) {
    return null;
  }
  const rest = value.slice(5);
  const i = rest.indexOf('/');
  if (i <= 0) {
    return null;
  }
  const bucket = rest.slice(0, i);
  const key = rest.slice(i + 1);
  if (!bucket || !key) {
    return null;
  }
  return { bucket, key };
}

function isLikelyS3HttpsHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h.includes('amazonaws.com') || h.includes('.s3.') || h === 's3.amazonaws.com';
}

/**
 * Turns API `images[].url` values into something `<img src>` can load.
 *
 * Typical GET /api/properties value (used as-is):
 * `https://locatehome.s3.eu-north-1.amazonaws.com/properties/images/….png`
 *
 * Legacy `s3://locatehome/properties/…` → rewritten to HTTPS via {@link environment.awsS3Region}.
 *
 * Empty → local fallback. `assets/…` and site paths → unchanged.
 */
export function resolvePropertyImageUrlForDisplay(raw: string | null | undefined): string {
  const u = raw?.trim() ?? '';
  if (!u) {
    return FALLBACK_LISTING_IMAGE;
  }
  if (u.startsWith('assets/')) {
    return u;
  }
  if (u.startsWith('/assets/') || u.startsWith('/')) {
    return u;
  }

  // API returns full HTTPS URLs (virtual-hosted S3, CDN, presigned, etc.) — use directly.
  if (/^https?:\/\//i.test(u)) {
    try {
      const parsed = new URL(u);
      if (isLikelyS3HttpsHost(parsed.hostname)) {
        return u;
      }
    } catch {
      return u;
    }
    return u;
  }

  // Only if the value is `s3://bucket/key`, build an HTTPS URL.
  const s3 = parseS3ColonUri(u);
  if (s3) {
    const region = environment.awsS3Region ?? 'eu-north-1';
    const key = encodeS3ObjectKey(s3.key);
    return `https://${s3.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  return u;
}
