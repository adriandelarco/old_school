const Apify = require('apify');
const vm = require('vm');
const _ = require('underscore');
const queryString = require('query-string');
const { REQUIRED_PROXY_GROUP } = require('./consts');
const {
    DEFAULT_GOOGLE_SEARCH_DOMAIN_COUNTRY_CODE,
    COUNTRY_CODE_TO_GOOGLE_SEARCH_DOMAIN,
} = require('./consts');

const extractLineItems = str => str
    .split('\n')
    .map(item => item.trim())
    .filter(item => !!item);

exports.createSerpRequest = (url, page) => {
    if (url.startsWith('https://')) url = url.replace('https://', 'http://');

    return {
        url,
        userData: {
            page,
        },
    };
};

exports.getInitialRequests = ({
    queries,
    searchUrls,
    mobileResults,
    countryCode,
    languageCode,
    locationUule,
    resultsPerPage,
}) => {
    const requestsFromQueries = extractLineItems(queries)
        .map((query) => {
            const domain = COUNTRY_CODE_TO_GOOGLE_SEARCH_DOMAIN[countryCode]
                || COUNTRY_CODE_TO_GOOGLE_SEARCH_DOMAIN[DEFAULT_GOOGLE_SEARCH_DOMAIN_COUNTRY_CODE];
            const qs = { q: query };

            if (countryCode) qs.gl = countryCode;
            if (languageCode) qs.hl = languageCode;
            if (locationUule) qs.uule = locationUule;
            if (resultsPerPage) qs.num = resultsPerPage;
            if (mobileResults) qs.xmobile = 1;

            return exports.createSerpRequest(`http://www.${domain}/search?${queryString.stringify(qs)}`, 0);
        });

    const requestsFromSearchUrls = searchUrls.map(request => exports.createSerpRequest(request.url, 0));

    return requestsFromQueries.concat(requestsFromSearchUrls);
};

exports.executeCustomDataFunction = async (funcString, params) => {
    let func;
    try {
        func = vm.runInNewContext(funcString);
    } catch (err) {
        Apify.utils.log.exception(err, 'Cannot compile custom data function!');
        throw err;
    }

    if (!_.isFunction(func)) throw new Error('Custom data function is not a function!'); // This should not happen...

    return func(params);
};

exports.getInfoStringFromResults = (results) => {
    return _
        .chain({
            organicResults: results.organicResults.length,
            paidResults: results.paidResults.length,
            paidProducts: results.paidProducts.length,
        })
        .mapObject((val, key) => `${key}: ${val}`)
        .toArray()
        .join(', ')
        .value();
};

exports.logAsciiArt = () => {
    console.log(`
 _______  _______  _______  _______  _______ _________ _        _______
(  ____ \\(  ____ \\(  ____ )(  ___  )(  ____ )\\__   __/( (    /|(  ____ \\
| (    \\/| (    \\/| (    )|| (   ) || (    )|   ) (   |  \\  ( || (    \\/
| (_____ | |      | (____)|| (___) || (____)|   | |   |   \\ | || |
(_____  )| |      |     __)|  ___  ||  _____)   | |   | (\\ \\) || | ____
      ) || |      | (\\ (   | (   ) || (         | |   | | \\   || | \\_  )
/\\____) || (____/\\| ) \\ \\__| )   ( || )      ___) (___| )  \\  || (___) |
\\_______)(_______/|/   \\__/|/     \\||/       \\_______/|/    )_)(_______)

 _______  _______  _______  _______  _        _______     _______  _______  _______
(  ____ \\(  ___  )(  ___  )(  ____ \\( \\      (  ____ \\   (  ____ \\(  ___  )(       )
| (    \\/| (   ) || (   ) || (    \\/| (      | (    \\/   | (    \\/| (   ) || () () |
| |      | |   | || |   | || |      | |      | (__       | |      | |   | || || || |
| | ____ | |   | || |   | || | ____ | |      |  __)      | |      | |   | || |(_)| |
| | \\_  )| |   | || |   | || | \\_  )| |      | (         | |      | |   | || |   | |
| (___) || (___) || (___) || (___) || (____/\\| (____/\\ _ | (____/\\| (___) || )   ( |
(_______)(_______)(_______)(_______)(_______/(_______/(_)(_______/(_______)|/     \\|\n`);
};

exports.createDebugInfo = (request, response) => {
    let statusCode = null;
    if (response) statusCode = _.isFunction(response.status) ? response.status() : response.statusCode;

    return {
        requestId: request.id,
        url: request.url,
        method: request.method,
        retryCount: request.retryCount,
        errorMessages: request.errorMessages,
        statusCode,
        durationSecs: (request.userData.finishedAt - request.userData.startedAt) / 1000,
    };
};

exports.ensureAccessToSerpProxy = async () => {
    const userInfo = await Apify.client.users.getUser();
    // Has access to group and nonzero limit.
    const hasGroupAllowed = userInfo.proxy.groups.filter(group => group.name === REQUIRED_PROXY_GROUP).length > 0;
    const hasNonzeroLimit = userInfo.limits.monthlyGoogleSerpRequests > 0;
    if (!hasGroupAllowed || !hasNonzeroLimit) {
        Apify.utils.log.error(`You need access to ${REQUIRED_PROXY_GROUP} to be able to use this actor.
       Please contact support at support@apify.com to get access.`);
        process.exit(1);
    }
    // Check that SERP limit was not reached.
    if (userInfo.limits.isGoogleSerpBanned) {
        Apify.utils.log.error(`You have reached your ${REQUIRED_PROXY_GROUP} proxy group limit for number of queries.
       Please contact support at support@apify.com to increase the limit.`);
        process.exit(1);
    }
};

exports.ensureItsAbsoluteUrl = (maybeUrl, hostname) => {
    return maybeUrl.startsWith('/')
        ? `https://${hostname}${maybeUrl}`
        : maybeUrl;
};
