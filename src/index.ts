import puppeteer from "puppeteer";
import fs from "fs";

import config from "../config.json";
const url = config.url;

const productTitleId = "#productTitle";
const priceClass = "span.a-price-whole";
const priceDecimalClass = "span.a-price-fraction";
const imageSelector = "#landingImage";

if (!url) {
  console.error("Você precisa fornecer uma url.");

  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "load" });

  const nameSelector = productTitleId;
  await page.waitForSelector(nameSelector);
  const name = await page.$eval(nameSelector, (el) => el.textContent.trim());

  const priceSelector = priceClass;
  await page.waitForSelector(priceSelector);
  const price = await page.$eval(priceSelector, (el) => el.textContent.trim());

  const priceDecimalSelector = priceDecimalClass;
  await page.waitForSelector(priceDecimalSelector);
  const decimal = await page.$eval(priceDecimalSelector, (el) =>
    el.textContent.trim()
  );

  await page.waitForSelector(imageSelector);
  const imageUrl = await page.$eval(imageSelector, (el) =>
    el.getAttribute("src")
  );

  const productData = {
    url,
    name,
    price: `${price}${decimal}`,
    timestamp: new Date().toISOString(),
    imageUrl,
  };

  fs.writeFileSync("product_price.json", JSON.stringify(productData, null, 2));

  console.log("Nome e preço salvos com suceso.");

  await browser.close();
})();
