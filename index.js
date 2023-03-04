const puppeteer = require("puppeteer");
const fs = require("fs/promises");

require("dotenv").config();

const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;

let browser = null;
let page = null;

const search = "";
const unfollowUrls = [

];

const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

(async () => {
  browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox"] });

  page = await browser.newPage();
  page.setViewport({
    width: 1280,
    height: 900,
    isMobile: false,
  });

  await page.goto("https://twitter.com/login", { waitUntil: "networkidle2" });

  await page.waitForTimeout(randomInteger(3000, 5000));

  await page.type('input[name="text"]', username, { delay: 50 });

  await page.click("div.css-1dbjc4n.r-14lw9ot.r-6koalj.r-16y2uox.r-1wbh5a2 > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1dqxon3 > div > div > div:nth-child(6)");

  await page.waitForTimeout(randomInteger(2000, 4000));

  await page.type('input[name="password"]', password, { delay: 200 });
  await page.click('div[data-testid="LoginForm_Login_Button"]');

  await page.waitForSelector('input[data-testid="SearchBox_Search_Input"]');

  await page.type('input[data-testid="SearchBox_Search_Input"]', search, { delay: 25 });

  await page.keyboard.press("Enter");

  const latestSelector = 'div.css-1dbjc4n.r-1adg3ll.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1udh08x > div > div:nth-child(2) > a'

  await page.waitForSelector(latestSelector);

  await page.click(latestSelector);

  await page.waitForTimeout(randomInteger(2000, 6000));

  let authorsSet = new Set()
  try {
    let previousHeight;
    for (let i = 0; i < 4; i++) {
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
      await page.waitForTimeout(randomInteger(2000, 5000));
    }
  } catch (e) { console.log(e); }

  const urls = Array.from(authorsSet)

  const data = JSON.stringify({
    date: new Date().toLocaleDateString("pt-BR"),
    [search]: urls
  }, null, 2);

  fs.appendFile("urls.json", data, function (err) {
    if (err) throw err;
    console.log('Data appended to file!');
  });

  for (let i = 0; i < urls.length; i++) {
    try {
      const url = urls[i];
      console.log(url);
      await page.goto(`${url}`);

      await page.waitForTimeout(randomInteger(3000, 6000));
      await page.click('div[class="css-18t94o4 css-1dbjc4n r-42olwf r-sdzlij r-1phboty r-rs99b7 r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr"]');
      await page.waitForTimeout(randomInteger(4000, 6000));
    }
    catch (error) {
      console.error(error);
    }
  }

  console.log("***UNFOLLOW***");

  for (let i = 0; i < unfollowUrls.length; i++) {
    try {
      const url = unfollowUrls[i];
      console.log(url);
      await page.goto(`${url}`);

      await page.waitForTimeout(randomInteger(2000, 6000));
      await page.click('div[class="css-18t94o4 css-1dbjc4n r-1niwhzg r-sdzlij r-1phboty r-rs99b7 r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr"]');

      const unfollowSelector = 'div[data-testid="confirmationSheetConfirm"]';
      await page.waitForSelector(unfollowSelector);
      await page.click(unfollowSelector);
      await page.waitForTimeout(randomInteger(3000, 5000));
    }
    catch (error) {
      console.error(error);
    }
  }
})();
