export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  /** Region for `s3://…` URLs (matches bucket, e.g. locatehome.s3.eu-north-1.amazonaws.com). */
  awsS3Region: 'eu-north-1',
  listingCountryCode: 'PK',
  geonames: {
    searchUrl: 'http://api.geonames.org/searchJSON',
    username: 'harissaeed',
    userAgent: 'LocateHome/1.0'
  },
  overpass: {
    interpreterUrl: 'https://overpass-api.de/api/interpreter'
  }
};
