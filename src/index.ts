import "dotenv/config";
import puppeteer from "puppeteer";
import fs from "fs";
import cron from "node-cron";

const INTERVAL = 1;

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

const sendTelegramMessage = async (message: {
  photo: string;
  caption: string;
}) => {
  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        photo: message.photo,
        caption: message.caption,
        parse_mode: "Markdown",
      }),
    });

    return response.json();
  } catch (error) {
    console.error(error);
  }
};

const checkPrice = async () => {
  const browser = await puppeteer.launch({ headless: false });

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

  await sendTelegramMessage({
    caption: `O preço do produto *${productData.name}* atualmente está de: *R$${productData.price}*`,
    photo: productData.imageUrl!,
  });

  await browser.close();
};

cron.schedule(`*/${INTERVAL} * * * *`, () => {
  console.log(`Executando a cada ${INTERVAL} minutos...`);
  checkPrice();
});
