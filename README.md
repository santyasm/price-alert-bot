# 📉 Price Monitor – Alerta de Preços no Discord

Script em **Node.js** para monitorar preços de produtos (ex.: Amazon) e enviar alertas no **Discord** quando houver queda em relação ao último valor monitorado.

# 🚀 Passo a passo

## 1. Clonar o repositório

```bash
git clone https://github.com/santyasm/price-alert-bot.git

cd price-alert-bot
```

## 2. Instalar dependências

```bash
npm install
```

## 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e edite:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/SEU_WEBHOOK
```

📌 **DISCORD_WEBHOOK_URL →** URL do webhook do canal do Discord onde os alertas serão enviados

## Criando o webhook no Discord

**1.** No Discord, vá em **Configurações do servidor > Integrações > Webhooks**

**2.** Clique em **Novo Webhook**, selecione o canal, copie a URL.

## 4. Definir o produto a ser monitorado

Abra o arquivo `config.json` e configure:

```json
{
  "url": "https://www.amazon.com.br/dp/B09G9BL5CP",
  "interval": 5
}
```

- **url** → link do produto que deseja monitorar
- **interval** → tempo em minutos para verificar o preço

⚠️ Obs.: não há suporte para preço-alvo. O alerta só dispara quando o preço **cair em relação ao último monitoramento.**

## 5. Executar o script

```bash
npm start
```

- O console exibirá o preço atual a cada ciclo
- Um alerta será enviado ao Discord apenas quando houver queda de preço

## 🔧 Como funciona

1. O script abre a página do produto usando **Puppeteer**.
2. Extrai **nome, preço e imagem**.
3. Guarda **o último preço em memória** (não grava em arquivo ou DB)
4. A cada ciclo:
   - Se o preço atual < último preço → envia alerta no Discord
   - Caso contrário → apenas loga no console

## 📟 Exemplo de saída

### Console (terminal)

```bash
⏰ Verificando a cada 5 minutos...
💲 Preço atual: R$299.99
💲 Preço atual: R$279.99
⬇️ O preço do produto "Echo Dot (4ª Geração)" caiu!
```

### Mensagem no Discord

**⬇️ O preço do produto _Echo Dot (4ª Geração)_ caiu!**
Agora está em: **R$279.99**

### 📸 Embed da imagem do produto:

(imagem do produto aparece automaticamente no alerta)

## 📦 Tecnologias

- [Node.js](https://chatgpt.com/c/68b62f75-80d8-8324-9b90-ea828f8bb0b4)
- [Puppeteer](https://pptr.dev/)
- [node-cron](https://nodecron.com/)
- [Discord Webhook](https://discord.com/developers/docs/resources/webhook)

## 📌 Melhorias futuras

- [ ] Monitorar múltiplos produtos no mesmo `config.json`
- [ ] Dashboard web para visualização em tempo real
- [ ] Histórico de preços em banco leve (SQLite ou JSON rotativo)
