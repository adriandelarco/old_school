const Apify = require('apify');
const url = require('url');
const { REQUIRED_PROXY_GROUP } = require('./consts');
const extractors = require('./extractors');
const {
    getInitialRequests, executeCustomDataFunction, getInfoStringFromResults, createSerpRequest,
    logAsciiArt, createDebugInfo, ensureAccessToSerpProxy,
} = require('./tools');

Apify.main(async () => {
    const input = await Apify.getValue('INPUT');
    const { maxConcurrency, maxPagesPerQuery, customDataFunction, deviceType, saveHtml } = input;

    // Check that user have access to SERP proxy.
    await ensureAccessToSerpProxy();
    logAsciiArt();

    // Create initial request list and queue.
    const initialRequests = getInitialRequests(input);
    if (!initialRequests.length) throw new Error('At least one search query or search URL must be provided in input!');
    const requestList = await Apify.openRequestList('initial-requests', initialRequests);
    const requestQueue = await Apify.openRequestQueue();

    // Create crawler.
    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        maxConcurrency,
        requestFunction: ({ request, autoscaledPool }) => {
            const parsedUrl = url.parse(request.url, true);
            request.userData.startedAt = new Date();
            Apify.utils.log.info(`Querying "${parsedUrl.query.q}" page number ${request.userData.page} ...`);
            return crawler._defaultRequestFunction({ request, autoscaledPool }); // eslint-disable-line
        },
        useApifyProxy: true,
        apifyProxyGroups: [REQUIRED_PROXY_GROUP],
        handlePageTimeoutSecs: 60,
        requestTimeoutSecs: 180,
        handlePageFunction: async ({ request, response, html, $ }) => {
            request.userData.finishedAt = new Date();

            const parsedUrl = url.parse(request.url, true);

            // Compose the dataset item.
            const data = {
                '#debug': createDebugInfo(request, response),
                '#error': false,
                searchQuery: {
                    term: parsedUrl.query.q,
                    device: deviceType,
                    page: request.userData.page,
                    type: 'SEARCH',
                    countryCode: parsedUrl.query.gl || null,
                    languageCode: parsedUrl.query.hl || null,
                    locationUule: parsedUrl.query.uule || null,
                    resultsPerPage: parsedUrl.query.num || null,
                },
                url: request.url,
                hasNextPage: false,
                resultsTotal: extractors.extractTotalResults($),
                relatedQueries: extractors.extractRelatedQueries($, parsedUrl.host),
                paidResults: extractors.extractPaidResults($),
                paidProducts: extractors.extractPaidProducts($),
                organicResults: extractors.extractOgranicResults($),
                customData: customDataFunction
                    ? await executeCustomDataFunction(customDataFunction, { input, $, request, response, html })
                    : null,
            };

            if (saveHtml) data.html = html;

            await Apify.pushData(data);

            // Enqueue new page.
            const nextPageUrl = $('#pnnext').attr('href');
            if (nextPageUrl) {
                data.hasNextPage = true;
                if (request.userData.page < maxPagesPerQuery - 1 && maxPagesPerQuery) {
                    await requestQueue.addRequest(createSerpRequest(`http://${parsedUrl.host}${nextPageUrl}`, request.userData.page + 1));
                } else {
                    Apify.utils.log.info(`Not enqueueing next page for query "${parsedUrl.query.q}" as "maxPagesPerQuery" have been reached.`);
                }
            }

            // Log some nice info for user.
            Apify.utils.log.info(`Finished query "${parsedUrl.query.q}" page number ${request.userData.page} (${getInfoStringFromResults(data)})`);
        },
        handleFailedRequestFunction: async ({ request }) => {
            await Apify.pushData({
                '#debug': createDebugInfo(request),
                '#error': true,
            });
        },
    });

    // Run the crawler.
    await crawler.run();

    Apify.utils.log.info('Done - all queries have been finished.');
});
