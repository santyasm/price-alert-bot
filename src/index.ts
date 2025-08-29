import puppeteer from "puppeteer";
import fs from "fs";

import config from "../config.json";
const url = config.url;

const productTitleId = "#productTitle";
const priceClass = "span.a-price-whole";

if (!url) {
  console.error("Você precisa fornecer uma url.");

  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "load" });

  const nameSelector = productTitleId;
  await page.waitForSelector(nameSelector);
  const name = await page.$eval(nameSelector, (el) => el.innerHTML.trim());

  const priceSelector = priceClass;

  await page.waitForSelector(priceSelector);
  const price = await page.$eval(priceSelector, (el) => el.innerHTML.trim());

  const productData = {
    url,
    name,
    price,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync("product_price.json", JSON.stringify(productData, null, 2));

  console.log("Nome e preço salvos com suceso.");

  await browser.close();
})();
