const appConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/dashboard',
    unAuthenticatedEntryPath: '/lazy-login',
    tourPath: '/',
    locale: 'en',
    enableMock: false,
    liveApiUrl: `${appLocalizerWhiteboard?.apiUrl}/lazytasks/api/v1`,
    liveSiteUrl: `${appLocalizerWhiteboard?.homeUrl}`,
    localApiUrl: 'http://localhost:9000',
}

export default appConfig
