import "dotenv/config";
import puppeteer from "puppeteer";
import cron from "node-cron";
import fetch from "node-fetch";
import config from "../config.json";

const { url, interval } = config;

const productTitleId = "#productTitle";
const priceClass = "span.a-price-whole";
const priceDecimalClass = "span.a-price-fraction";
const imageSelector = "#landingImage";

let lastPrice: number | null = null;

export const sendDiscordMessage = async (params: {
  content: string;
  imageUrl?: string;
}) => {
  const { content, imageUrl } = params;

  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        embeds: imageUrl
          ? [
              {
                image: { url: imageUrl },
              },
            ]
          : [],
      }),
    });

    if (response.ok) {
      console.log("✅ Mensagem enviada com sucesso!");
      return true;
    } else {
      const text = await response.text();
      console.error("❌ Erro ao enviar mensagem:", response.status, text);
      return false;
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem para o Discord:", error);
    return false;
  }
};

const checkPrice = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "load" });

  const name = await page.$eval(productTitleId, (el) => el.textContent.trim());
  const price = await page.$eval(priceClass, (el) => el.textContent.trim());
  const decimal = await page.$eval(priceDecimalClass, (el) =>
    el.textContent.trim()
  );
  const imageUrl = await page.$eval(imageSelector, (el) =>
    el.getAttribute("src")
  );

  const currentPrice = parseFloat(
    `${price}${decimal}`.replace(".", "").replace(",", ".")
  );

  console.log(`💲 Preço atual: R$${currentPrice}`);

  if (lastPrice && currentPrice < lastPrice) {
    await sendDiscordMessage({
      content: `⬇️ O preço do produto *${name}* caiu!\n\nAgora está em: *R$${currentPrice}*`,
      imageUrl: imageUrl!,
    });
  }

  lastPrice = currentPrice;

  await browser.close();
};

cron.schedule(`*/${interval} * * * *`, () => {
  console.log(`⏰ Verificando a cada ${interval} minutos...`);
  checkPrice();
});
