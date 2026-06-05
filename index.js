const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = "8875016954:AAFw_uN7s41RapZQlG3MzMYZyh20FcQgIj4";
const CHAT_ID = "538658362";

app.get("/", (req, res) => res.send("ECK Bot running"));

app.post("/generate", async (req, res) => {
  const { confession, gender, age, num } = req.body;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Noto+Serif+Bengali:wght@400;600&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 540px; height: 675px; background: #f5ede0; display: flex; align-items: stretch; }
.card { width: 540px; height: 675px; background: #f5ede0; border: 1px solid #c8a87a; position: relative; overflow: hidden; display: flex; flex-direction: column; }
.header { padding: 1.2rem 1.8rem 0; flex-shrink: 0; }
.header-row { display: flex; align-items: center; justify-content: space-between; }
.label { font-family: 'Cormorant Garamond', serif; font-size: 0.58rem; letter-spacing: 0.4em; color: #b8862a; text-transform: uppercase; margin-bottom: 0.3rem; }
.tags { display: flex; gap: 0.4rem; }
.tag { padding: 0.18rem 0.7rem; border: 1px solid #b8862a; color: #3a1f08; font-size: 0.72rem; border-radius: 2px; font-family: 'Cormorant Garamond', serif; letter-spacing: 0.08em; background: rgba(184,134,42,0.15); }
.eck { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-style: italic; font-weight: 600; color: #7a3820; }
.divider { height: 1px; background: linear-gradient(90deg, transparent, #c8a87a 20%, #b8862a 50%, #c8a87a 80%, transparent); margin: 0.6rem 0 0; }
.body { flex: 1; padding: 0.9rem 1.8rem 1.6rem; display: flex; align-items: flex-start; }
.text { font-family: 'Noto Serif Bengali', serif; font-size: 18px; line-height: 1.65; color: #1a0e05; width: 100%; }
.wm { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; font-family: 'Cormorant Garamond', serif; font-size: 10rem; font-weight: 600; font-style: italic; color: rgba(122,56,32,0.05); letter-spacing: 0.2em; }
</style>
</head>
<body>
<div class="card">
  <div class="wm">ECK</div>
  <div class="header">
    <div class="header-row">
      <div>
        <div class="label">Confession ${num}</div>
        <div class="tags">
          <span class="tag">${gender}</span>
          ${age ? `<span class="tag">${age} বছর</span>` : ""}
        </div>
      </div>
      <span class="eck">ECK</span>
    </div>
    <div class="divider"></div>
  </div>
  <div class="body">
    <p class="text">${confession.replace(/\n/g, "<br>")}</p>
  </div>
</div>
</body>
</html>`;

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: "new"
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 540, height: 675 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    const imageBuffer = await page.screenshot({ type: "png" });
    await browser.close();

    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("photo", new Blob([imageBuffer], { type: "image/png" }), "confession.png");
    formData.append("caption", `#${num} | ${gender} | ${age} বছর`);

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
      method: "POST",
      body: formData
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
