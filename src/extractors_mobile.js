const { ensureItsAbsoluteUrl } = require('./tools');

exports.extractOgranicResults = ($) => {
    const searchResults = [];

    $('#ires, .srg > div').each((index, el) => {
        const siteLinks = [];
        $(el)
            .find('hr')
            .next()
            .find('a')
            .each((i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).text(),
                    url: $(siteLinkEl).attr('href'),
                    description: null,
                });
            });

        searchResults.push({
            title: $(el)
                .find('a div[role="heading"]')
                .text(),
            url: $(el)
                .find('a')
                .first()
                .attr('href'),
            displayedUrl: $(el)
                .find('a')
                .first('span')
                .text(),
            description: $(el)
                .find('div[jsname="ao5mud"] > div > div')
                .text(),
            siteLinks,
        });
    });

    return searchResults;
};

exports.extractPaidResults = ($) => {
    const ads = [];

    $('.ads-ad').each((index, el) => {
        const siteLinks = [];
        $(el)
            .find('hr')
            .next()
            .find('a')
            .each((i, siteLinkEl) => {
                siteLinks.push({
                    title: $(siteLinkEl).text(),
                    url: $(siteLinkEl).attr('href'),
                    description: null,
                });
            });

        ads.push({
            title: $(el)
                .find('a div[role="heading"]')
                .text(),
            url: $(el)
                .find('a')
                .first()
                .attr('href'),
            displayedUrl: $(el)
                .find('a')
                .first('span')
                .text(),
            description: $(el)
                .find('hr')
                .first()
                .next()
                .text(),
            siteLinks,
        });
    });

    return ads;
};

exports.extractPaidProducts = ($) => {
    const products = [];

    $('.shopping-carousel-container .pla-unit-container').each((i, el) => {
        const headingEl = $(el).find('[role="heading"]');
        const siblingEls = headingEl.nextAll();
        const displayedUrlEl = siblingEls.last();
        const prices = [];

        siblingEls.each((index, siblingEl) => {
            if (siblingEl !== displayedUrlEl[0]) prices.push($(siblingEl).text());
        });

        products.push({
            title: headingEl.text(),
            url: $(el).find('a').attr('href'),
            displayedUrl: $(el).find('.a').text(),
            prices,
        });
    });

    return products;
};

exports.extractTotalResults = () => {
    return 'N/A';
};

exports.extractRelatedQueries = ($, hostname) => {
    const related = [];

    $('div[data-hveid="CA0QAA"] a').each((index, el) => {
        related.push({
            title: $(el).text(),
            url: ensureItsAbsoluteUrl($(el).attr('href'), hostname),
        });
    });

    return related;
};
