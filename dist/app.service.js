"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer_1 = require("puppeteer");
const cheerio = require("cheerio");
let AppService = class AppService {
    async getHello() {
        const browser = await puppeteer_1.default.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 800 });
        await page.setDefaultNavigationTimeout(0);
        await page.goto('https://www.centris.ca/en/plexes~for-sale?view=Thumbnail');
        await page.waitForResponse(response => {
            return response.status() === 200;
        });
        let tAndCPopup = (await page.$('#didomi-notice-agree-button')) || "";
        if (tAndCPopup) {
            await page.click('#didomi-notice-agree-button');
        }
        const currentPageCount = await page.$('.pager-current');
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
            const currentPageCount = await page.$('.pager-current');
            const newOrig = await page.$eval('.pager-current', (element) => element.textContent);
            const pagesCount = await page.evaluate(el => el.textContent, currentPageCount);
            const newCurent = pagesCount.split('/')[0].trim();
            curentPage = parseInt(newCurent);
            originalText = newOrig;
        }
        await browser.close();
        return "hello";
    }
    async waitForTextChange(page, selector, originalText) {
        await page.waitForFunction((selector, originalText) => {
            const element = document.querySelector(selector);
            return element && element.textContent !== originalText;
        }, { timeout: 5000 }, selector, originalText);
    }
    async getHelloDetail() {
        try {
            const url = "https://www.centris.ca/en/duplexes~for-sale~lac-beauport/21959781?view=Summary";
            const response = await fetch(url);
            const htmlString = await response.text();
            const $ = cheerio.load(htmlString);
            const element = $('.match-score-text');
            console.log(element.text());
        }
        catch (error) {
            return error;
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map