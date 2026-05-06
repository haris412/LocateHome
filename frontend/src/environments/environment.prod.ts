export const environment = {
  production: true,
  apiUrl: 'https://soletechs.net/property.api', // local SSR test — change to real URL before deploying
  /** Region for `s3://…` URLs (match your S3 bucket region). */
  awsS3Region: 'eu-north-1',
  listingCountryCode: 'PK',
  googleMapsKey: 'AIzaSyCQhyzoeFIoSD3XYRnHxxwmnaWrBqBv-Io',
  geonames: {
    searchUrl: 'http://api.geonames.org/searchJSON',
    username: 'demo',
    userAgent: 'LocateHome/1.0'
  },
  overpass: {
    interpreterUrl: 'https://overpass-api.de/api/interpreter'
  }
};
