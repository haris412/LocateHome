export const environment = {
  production: true,
  /** Backend is under /property.api (not site root). */
  apiUrl: 'https://soletechs.net/property.api',
  /** Region for `s3://…` URLs (match your S3 bucket region). */
  awsS3Region: 'eu-north-1',
  listingCountryCode: 'PK',
  geonames: {
    searchUrl: 'http://api.geonames.org/searchJSON',
    username: 'demo',
    userAgent: 'LocateHome/1.0'
  },
  overpass: {
    interpreterUrl: 'https://overpass-api.de/api/interpreter'
  }
};
