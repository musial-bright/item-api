export const changelog = [
  {
    version: '1.4.0',
    features: [
      {
        title: 'Item Storage',
        description:
          "CRUD endpoints ('/item/:name' and '/item/:name/:id') for user-scoped, named item collection storage, with filtering, ordering and pagination support.",
      },
      {
        title: 'My Item Storage',
        description:
          "Simplified single-item-per-name CRUD endpoint ('/my-item/:name') scoped to the current user, for lightweight per-user key/value style storage.",
      },
      {
        title: 'Signed File Upload URLs',
        description:
          "Endpoint ('/upload-file-url') to generate signed S3 upload (and, for public paths, download) URLs.",
      },
      {
        title: 'Health Check',
        description:
          "Endpoint ('/health-check') reporting service availability and the current API version.",
      },
      {
        title: 'Service Info',
        description:
          "Endpoint ('/info') exposing service name, version, copyright and changelog.",
      },
    ],
  },
]

export const getLatestVersion = () => changelog[0].version
