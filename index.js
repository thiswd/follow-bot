const puppeteer = require("puppeteer");
const fs = require("fs/promises");

require("dotenv").config();

const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;

let browser = null;
let page = null;

const search = "#ForaCamargo";

(async () => {
  browser = await puppeteer.launch({ headless: false });

  page = await browser.newPage();
  page.setViewport({
    width: 1280,
    height: 800,
    isMobile: false,
  });

  await page.goto("https://twitter.com/login", { waitUntil: "networkidle2" });

  await page.waitForTimeout(2000);

  await page.type('input[name="text"]', username, {delay: 50});

  await page.click("#layers > div > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv > div.css-1dbjc4n.r-1867qdf.r-1wbh5a2.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1.r-htvplk.r-1udh08x > div > div > div.css-1dbjc4n.r-14lw9ot.r-6koalj.r-16y2uox.r-1wbh5a2 > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1dqxon3 > div > div:nth-child(6)");

  await page.waitForTimeout(2000);

  await page.type('input[name="password"]', password, {delay: 50});
  await page.click("#layers > div > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv > div.css-1dbjc4n.r-1867qdf.r-1wbh5a2.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1.r-htvplk.r-1udh08x > div > div > div.css-1dbjc4n.r-14lw9ot.r-6koalj.r-16y2uox.r-1wbh5a2 > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div.css-1dbjc4n.r-hhvx09.r-1dye5f7.r-ttdzmv > div > div.css-18t94o4.css-1dbjc4n.r-sdzlij.r-1phboty.r-rs99b7.r-ywje51.r-usiww2.r-peo1c.r-1ps3wis.r-1ny4l3l.r-1guathk.r-o7ynqc.r-6416eg.r-lrvibr.r-13qz1uu");

  await page.waitForSelector('input[data-testid="SearchBox_Search_Input"]');

  await page.type('input[data-testid="SearchBox_Search_Input"]', search, {delay: 25});

  await page.keyboard.press("Enter");

  const latestSelector = '#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div.css-1dbjc4n.r-1e5uvyk.r-aqfbo4.r-6026j.r-gtdqiz.r-1gn8etr.r-1g40b8q > div:nth-child(2) > nav > div > div.css-1dbjc4n.r-1adg3ll.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1udh08x > div > div:nth-child(2) > a'

  await page.waitForSelector(latestSelector);

  await page.click(latestSelector);

  await page.waitForTimeout(2000);

  let authorsSet = new Set()
  try {
    let previousHeight;
    for (let i = 0; i < 5; i++) {
      const elementHandles = await page.$$('a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1niwhzg.r-1loqt21.r-1pi2tsx.r-1ny4l3l.r-o7ynqc.r-6416eg.r-13qz1uu');
      const propertyJsHandles = await Promise.all(
        elementHandles.map(handle => handle.getProperty('href'))
      );
      const urls = await Promise.all(
        propertyJsHandles.map(handle => handle.jsonValue())
      );

      urls.forEach(item => authorsSet.add(item))

      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitForTimeout(2000);
    }
  } catch (e) { console.log(e); }

  const urls = Array.from(authorsSet)

  const data = JSON.stringify({ [search]: urls }, null, 2);

  fs.appendFile("urls.json", data, function (err) {
    if (err) throw err;
    console.log('Data appended to file!');
  });

  for (let i = 0; i < urls.length; i++) {
    try {
      const url = urls[i];
      console.log(url);
      await page.goto(`${url}`);

      await page.waitForTimeout(2000)
      await page.click('div[class="css-18t94o4 css-1dbjc4n r-42olwf r-sdzlij r-1phboty r-rs99b7 r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr"]')
      await page.waitForTimeout(2000)
      await page.goBack();
    }
    catch (error) {
      console.error(error);
    }
  }
})();
