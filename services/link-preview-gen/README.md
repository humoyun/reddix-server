# 5 Tips For Web Scraping Without Getting Blocked or Blacklisted

Web scraping can be difficult, particularly when most popular sites actively try to prevent developers from scraping their websites using a variety of techniques such as IP address detection, HTTP request header checking, CAPTCHAs, javascript checks, and more. On the other hand, there are many analogous strategies that developers can use to avoid these blocks as well, allowing them to build web scrapers that are nearly impossible to detect. Here are a few quick tips on how to crawl a website without getting blocked:

## 1. IP Rotation
The number one way sites detect web scrapers is by examining their IP address, thus most of web scraping without getting blocked is using a number of different IP addresses to avoid any one IP address from getting banned. To avoid sending all of your requests through the same IP address, you can use an IP rotation service like Scraper API or other proxy services in order to route your requests through a series of different IP addresses. This will allow you to scrape the majority of websites without issue.

For sites using more advanced proxy blacklists, you may need to try using residential or mobile proxies, if you are not familiar with what this means you can check out our article on different types of proxies here. Ultimately, the number of IP addresses in the world is fixed, and the vast majority of people surfing the internet only get 1 (the IP address given to them by their internet service provider for their home internet), therefore having say 1 million IP addresses will allow you to surf as much as 1 million ordinary internet users without arousing suspicion. This is by far the most common way that sites block web crawlers, so if you are getting blocked getting more IP addresses is the first thing you should try.

## 2. Set a Real User Agent
User Agents are a special type of HTTP header that will tell the website you are visiting exactly what browser you are using. Some websites will examine User Agents and block requests from User Agents that don’t belong to a major browser. Most web scrapers don’t bother setting the User Agent, and are therefore easily detected by checking for missing User Agents. Don’t be one of these developers! Remember to set a popular User Agent for your web crawler (you can find a list of popular User Agents here). For advanced users, you can also set your User Agent to the Googlebot User Agent since most websites want to be listed on Google and therefore let Googlebot through. It’s important to remember to keep the User Agents you use relatively up to date, every new update to Google Chrome, Safari, Firefox, etc. has a completely different user agent, so if you go years without changing the user agent on your crawlers, they will become more and more suspicious. It may also be smart to rotate between a number of different user agents so that there isn’t a sudden spike in requests from one exact user agent to a site (this would also be fairly easy to detect).

## 3. Set Other Request Headers
Real web browsers will have a whole host of headers set, any of which can be checked by careful websites to block your web scraper. In order to make your scraper appear to be a real browser, you can navigate to https://httpbin.org/anything, and simply copy the headers that you see there (they are the headers that your current web browser is using). Things like “Accept”, “Accept-Encoding”, “Accept-Language”, and “Upgrade-Insecure-Requests” being set will make your requests look like they are coming from a real browser so you won’t get your web scraping blocked. For example, the headers from the latest Google Chrome is:

“Accept”: “text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,

image/apng,*/*;q=0.8,application/signed-exchange;v=b3″,

“Accept-Encoding”: “gzip”,

“Accept-Language”: “en-US,en;q=0.9,es;q=0.8”,

“Upgrade-Insecure-Requests”: “1”,

“User-Agent”: “Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36”

By rotating through a series of IP addresses and setting proper HTTP request headers (especially User Agents), you should be able to avoid being detected by 99% of websites.

## 4. Set Random Intervals In Between Your Requests
It is easy to detect a web scraper that sends exactly one request each second 24 hours a day! No real person would ever use a website like that, and an obvious pattern like this is easily detectable. Use randomized delays (anywhere between 2-10 seconds for example) in order to build a web scraper that can avoid being blocked. Also, remember to be polite, if you send requests too fast you can crash the website for everyone, if you detect that your requests are getting slower and slower, you may want to send requests more slowly so you don’t overload the web server (you’ll definitely want to do this to help frameworks like Scrapy avoid being banned).

For especially polite crawlers, you can check a site’s robots.txt (this will be located at http://example.com/robots.txt or http://www.example.com/robots.txt), often they will have a line that says crawl-delay that will tell you how many seconds you should wait in between requests you send to the site so that you don’t cause any issues with heavy server traffic.

## 5. Set a Referrer
The Referer header is an http request header that lets the site know what site you are arriving from. Generally it’s a good idea to set this so that it looks like you’re arriving from Google, you can do this with the header:

“Referer”: “https://www.google.com/”

You can also change this up for websites in different countries, for example if you are trying to scrape a site in the UK, you might want to use “https://www.google.co.uk/” instead of “https://www.google.com/”. You can also look up the most common referers to any site using a tool like https://www.similarweb.com, often this will be a social media site like Youtube or Facebook. By setting this header, it makes your request look even more authentic, as it appears to be traffic from a site that the webmaster would be expecting a lot of traffic to come from during normal usage.

For more advanced users scraping particularly difficult to scrape sites, we’ve added these 5 advanced web scraping tips.

## 6. Use a Headless Browser
The trickiest websites to scrape may detect subtle tells like web fonts, extensions, browser cookies, and javascript execution in order to determine whether or not the request is coming from a real user. In order to scrape these websites you may need to deploy your own headless browser (or have Scraper API do it for you!).

Tools like Selenium and Puppeteer will allow you to write a program to control a real web browser that is identical to what a real user would use in order to completely avoid detection. While this is quite a bit of work to make Selenium undetectable or Puppeteer undetectable, this is the most effective way to scrape websites that would otherwise give you quite some difficulty. Note that you should only use these tools for web scraping if absolutely necessary, these programmatically controllable browsers are extremely CPU and memory intensive and can sometimes crash. There is no need to use these tools for the vast majority of sites (where a simple GET request will do), so only reach for these tools if you are getting blocked for not using a real browser!

## 7. Avoid Honeypot Traps
A lot of sites will try to detect web crawlers by putting in invisible links that only a robot would follow. You need to detect whether a link has the “display: none” or “visibility: hidden” CSS properties set, and if they do avoid following that link, otherwise a site will be able to correctly identify you as a programmatic scraper, fingerprint the properties of your requests, and block you quite easily. Honeypots are one of the easiest ways for smart webmasters to detect crawlers, so make sure that you are performing this check on each page that you scrape. Advanced webmasters may also just set the color to white (or to whatever color the background color of the page is), so you may want to check if the link has something like “color: #fff;” or “color: #ffffff” set, as this would may the link effectively invisible as well.

## 8. Detect Website Changes
Many websites change layouts for many reasons and this will often cause scrapers to break. In addition, some websites will have different layouts in unexpected places (page 1 of the search results may have a different layout than page 4). This is true even for surprisingly large companies that are less tech savvy, e.g. large retail stores that are just making the transition online. You need to properly detect these changes when building your scraper, and create ongoing monitoring so that you know your crawler is still working (usually just counting the number of successful requests per crawl should do the trick).

Another easy way to set up monitoring is to write a unit test for a specific URL on the site (or one URL of each type, for example on a reviews site you may want to write a unit test for the search results page, another unit test for the reviews page, another unit test for the main product page, etc.). This way you can check for breaking site changes using only a few requests every 24 hours or so without having to go through a full crawl to detect errors.

## 9. Use a CAPTCHA Solving Service
One of the most common ways for sites to crack down on crawlers is to display a CAPTCHA. Luckily, there are services specifically designed to get past these restrictions in an economical way, whether they are fully integrated solutions like Scraper API or narrow CAPTCHA solving solutions that you can integrate just for the CAPTCHA solving functionality like 2Captcha or AntiCAPTCHA. For sites that resort to CAPTCHAs, it may be necessary to use one of these solutions. Note that some of these CAPTCHA solving services are fairly slow and expensive, so you may need to consider whether it is still economically viable to scrape sites that require continuous CAPTCHA solving over time.

## 10. Scrape Out of the Google Cache
As a true last resort, particularly for data that does not change too often, you may be able to scrape data out of Google’s cached copy of the website rather than the website itself. Simply prepend “http://webcache.googleusercontent.com/search?q=cache:” to the beginning of the URL (for example to scrape Scraper API’s documentation you could scrape “http://webcache.googleusercontent.com/search?q=cache:https://www.scraperapi.com/documentation”.

This is a good workaround for non-time sensitive information that is on extremely hard to scrape sites. While scraping out of Google’s cache can be a bit more reliable than scraping a site that is actively trying to block your scrapers, remember that this is not a fool proof solution, for example some sites like LinkedIn actively tell Google not to cache their data and the data for unpopular sites may be fairly out of date as Google determines how often they should crawl a site based on the site’s popularity as well as how many pages exist on that site.

Hopefully you’ve learned a few useful tips for scraping popular websites without being blacklisted or IP banned. While just setting up IP rotation and proper HTTP request headers should be more than enough in most cases, sometimes you will have to resort to more advanced techniques like using a headless browser or scraping out of the Google cache to get the data you need.

As always, it’s important to be respectful to webmasters and other users of the site when scraping, so if you detect that the site is slowing down you need to slow down your request rate. This is especially important when scraping smaller sites that may not have the resources that large enterprises may have for web hosting.

If you have a web scraping job you’d like to talk to us about helping your web scraper avoid detection please fill out this form and we’ll get back to you within 24 hours. Happy scraping!