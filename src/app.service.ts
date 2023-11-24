import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { Builder } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'

@Injectable()
export class AppService {
  async getHello() {
    // load puppeteer and open a new browser
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 800 });
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://www.centris.ca/en/plexes~for-sale?view=Thumbnail');
    await page.waitForResponse(response => {
      return response.status() === 200
    });
    let tAndCPopup = (await page.$('#didomi-notice-agree-button')) || "";
    if (tAndCPopup) {
      await page.click('#didomi-notice-agree-button');
    }
    const currentPageCount = await page.$('.pager-current')
    // get element text
    const pagesCount = await page.evaluate(el => el.textContent, currentPageCount);
    let totalPage = parseInt(pagesCount.split('/')[1].trim());
    let curentPage = parseInt(pagesCount.split('/')[0].trim());
    let originalText = await page.$eval('.pager-current', (element) => element.textContent);
    console.log(originalText);

    while (curentPage <= totalPage) {
      const propertyUrls = [];
      await page.waitForSelector('.property-thumbnail-item');
      const propertys = await page.$$('.property-thumbnail-summary-link');
      console.log(propertys);
      for (let property of propertys) {
        const propertyUrl = await page.evaluate(el => el.getAttribute('href'), property);
        console.log(propertyUrl);
        propertyUrls.push(propertyUrl);
      }
      await page.waitForTimeout(3000);
      await page.click('.next');
      await this.waitForTextChange(page, '.pager-current', originalText);
      const currentPageCount = await page.$('.pager-current')
      const newOrig = await page.$eval('.pager-current', (element) => element.textContent);
      const pagesCount = await page.evaluate(el => el.textContent, currentPageCount);
      const newCurent = pagesCount.split('/')[0].trim();
      curentPage = parseInt(newCurent);
      originalText = newOrig;
    }
    await browser.close();
    return "hello"
  }

  async waitForTextChange(page, selector, originalText) {
    await page.waitForFunction(
      (selector, originalText) => {
        const element = document.querySelector(selector);
        return element && element.textContent !== originalText;
      },
      { timeout: 5000 },
      selector,
      originalText
    );
  }

  async getHelloDetail() {
    try {
      const url = "https://www.centris.ca/en/duplexes~for-sale~lac-beauport/21959781?view=Summary";

      // get page content from url using fetch
      const response = await fetch(url);
      const htmlString = await response.text();
      // load html string into cheerio
      const $ = cheerio.load(htmlString);
      // get element by class
      const element = $('.match-score-text');
      console.log(element.text());



      // const browser = await puppeteer.launch({ executablePath: '/Users/bytestechnoolab/Desktop/projects/demos/crawl-demo/chromedriver', headless: false });
      // const page = await browser.newPage();
      // await page.setViewport({ width: 1440, height: 800 });
      // await page.setDefaultNavigationTimeout(0);
      // await page.goto(url);
      // await page.waitForResponse(response => {
      //   return response.status() === 200
      // });
      // // take screenshot
      // await page.screenshot({ path: 'example.png' });
      // await browser.close();
    } catch (error) {
      return error
    }
  }
}
