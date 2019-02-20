# Google search scraper

Crawl unlimited number of queries from [Google search](https://www.google.com) results for the country and language of your choice.

## Contents

<!-- toc -->

- [Why](#why)
- [Input](#input)
- [Output](#output)
- [Proxies](#proxies)
- [Notes](#notes)

<!-- tocstop -->

## Why

Typical use cases for Google search crawling, among thousands of others, are:

<ul>
    <li>Monitor how your website performs in SEO.</li>
    <li>Analyze advertisements for a given set of keywords.</li>
    <li>Monitor your competition in both organic and paid results.</li>
    <li>Build a URL list for certain keywords.</li>
</ul>

## Input

This actor currently supports only Google text search and not other types, such as image or news search.

Queries can be provided as a list of strings or full Google search URLs. Additionally, you can configure country and
location, but these settings only apply to entered queries and not to full Google search URLs.

For more information on input, see the <a href="?section=input-schema">specification</a>.

## Output

By default, each result item contains search results, ads and additional info for one search results page:

```json
[{
  "searchQuery": {
    "term": "Hotels in Prague",
    "page": 0,
    "type": "SEARCH",
    "countryCode": "cz",
    "languageCode": "en",
    "locationUule": null,
    "resultsPerPage": "10"
  },
  "url": "http://www.google.com/search?gl=cz&hl=en&num=10&q=Hotels%20in%20Prague",
  "hasNextPage": false,
  "resultsTotal": 138000000078,
  "relatedQueries": [
    {
      "title": "cheap hotels in prague",
      "url": "https://www.google.com/search?hl=en&gl=CZ&q=cheap+hotels+in+prague&sa=X&sqi=2&ved=2ahUKEwjem6jG9cTgAhVoxlQKHeE4BuwQ1QIoAHoECAoQAQ"
    },
    {
      "title": "best hotels in prague old town",
      "url": "https://www.google.com/search?hl=en&gl=CZ&q=best+hotels+in+prague+old+town&sa=X&sqi=2&ved=2ahUKEwjem6jG9cTgAhVoxlQKHeE4BuwQ1QIoAXoECAoQAg"
    },
    ...
  ],
  "paidResults": [
    {
      "title": "2280 Hotels in Prague | Best Price Guarantee | booking.com‎Book apartments and moreMore than just hotels",
      "url": "https://www.booking.com/go.html?slc=h3;aid=303948;label=",
      "displayedUrl": "www.booking.com/",
      "description": "Book your Hotel in Prague online. No reservation costs. Great rates. Bed and Breakfasts. Support in 42 Languages. Hotels. Motels. Read Real Guest Reviews. 24/7 Customer Service. 34+ Million Real Reviews. Secure Booking. Apartments. Save 10% with Genius. Types: Hotels, Apartments, Villas.£0 - £45 Hotels - up to £45.00/day - Book Now · More£45 - £90 Hotels - up to £90.00/dayBook Now£130 - £180 Hotels - up to £180.00/dayBook Now£90 - £130 Hotels - up to £130.00/dayBook Nowup to £45.00/dayup to £90.00/dayup to £180.00/dayup to £130.00/day",
      "siteLinks": [
        {
          "title": "Book apartments and more",
          "url": "https://www.booking.com/go.html?slc=h3;aid=303948;label=",
          "description": "Bookings instantly confirmed!Instant confirmation, 24/7 support"
        },
        {
          "title": "More than just hotels",
          "url": "https://www.booking.com/go.html?slc=h2;aid=303948;label=",
          "description": "Search, book, stay – get started!Hotels when and where you need them"
        }
      ]
    },
    {
      "title": "Hotels In Prague | Hotels.com™ Official Site‎",
      "displayedUrl": "www.hotels.com/Prague/Hotel",
      "description": "Hotels In Prague Book Now! Collect 10 Nights and Get 1 Free. Budget Hotels. Guest Reviews. Last Minute Hotel Deals. Luxury Hotels. Exclusive Deals. Price Guarantee. Photos & Reviews. Travel Guides. Earn Free Hotel Nights. No Cancellation Fees. Types: Hotel, Apartment, Hostel.",
      "siteLinks": []
    },
    ...
  ],
  "paidProducts": [],
  "organicResults": [
    {
      "title": "30 Best Prague Hotels, Czech Republic (From $11) - Booking.com",
      "url": "https://www.booking.com/city/cz/prague.html",
      "displayedUrl": "https://www.booking.com › Czech Republic",
      "description": "Great savings on hotels in Prague, Czech Republic online. Good availability and great rates. Read hotel reviews and choose the best hotel deal for your stay.",
      "siteLinks": []
    },
    {
      "title": "The 30 best hotels & places to stay in Prague, Czech Republic ...",
      "url": "https://www.booking.com/city/cz/prague.en-gb.html",
      "displayedUrl": "https://www.booking.com › Czech Republic",
      "description": "Great savings on hotels in Prague, Czech Republic online. Good availability and great rates. Read hotel reviews and choose the best hotel deal for your stay.",
      "siteLinks": []
    },
    ...
  ],
  "customData": {
    "pageTitle": "Hotels in Prague - Google Search"
  }
},
```

If you are interested in organic results only, then you can use a combination of query parameters `fields=searchQuery,organicResults`
and `unwind=organicResults` to obtain a plain array of organic results. The original URL of a dataset is in the form

```
https://api.apify.com/v2/datasets/[DATASET_ID]/items?format=[FORMAT]
```

where the format is one of `csv`, `html`, `xlsx`, `xml`, `rss` and `json`. By adding new parameters

```
https://api.apify.com/v2/datasets/[DATASET_ID]/items?format=[FORMAT]&fields=searchQuery,organicResults&unwind=organicResults
```

you obtain the following result:

```json
[
  {
    "searchQuery": {
      "term": "Restaurants in Prague",
      "page": 0,
      "type": "SEARCH",
      "countryCode": "us",
      "languageCode": "en",
      "locationUule": null,
      "resultsPerPage": "10"
    },
    "title": "THE 10 BEST Restaurants in Prague 2019 - TripAdvisor",
    "url": "https://www.tripadvisor.com/Restaurants-g274707-Prague_Bohemia.html",
    "displayedUrl": "https://www.tripadvisor.com/Restaurants-g274707-Prague_Bohemia.html",
    "description": "Best Dining in Prague, Bohemia: See 617486 TripAdvisor traveler reviews of 6232 Prague restaurants and search by cuisine, price, location, and more.",
    "siteLinks": []
  },
  {
    "searchQuery": {
      "term": "Restaurants in Prague",
      "page": 0,
      "type": "SEARCH",
      "countryCode": "us",
      "languageCode": "en",
      "locationUule": null,
      "resultsPerPage": "10"
    },
    "title": "The 11 Best Restaurants in Prague | Elite Traveler",
    "url": "https://www.elitetraveler.com/finest-dining/restaurant-guide/the-11-best-restaurants-in-prague",
    "displayedUrl": "https://www.elitetraveler.com/finest-dining/restaurant.../the-11-best-restaurants-in-prag...",
    "description": "Jan 16, 2018 - With the regional fare certainly a highlight of dining in Prague, a great number of superb international eateries have touched down to become ...",
    "siteLinks": []
  },
  ...
]
```

## Proxies

This actor requires access to [Google SERP proxy](https://www.apify.com/docs/proxy#google-serp).
Every user at Apify platform has a limited number of queries each month for free, as you can see in your
[account](https://my.apify.com/account). If you need more queries, please contact [Apify support](https://www.apify.com/contact)
to get your limits increased.

## Notes

<ul>
    <li>
        This actor uses special proxies to avoid ban which may result in a low speed of crawling especially for subsequent pages.
    </li>
    <li>
        If you need to scrape the first 100 results then you can decrease a duration of the crawl more than ten times by setting
        `resultsPerPage=100` instead of crawling 10 pages each with 10 results.
    </li>
</ul>
