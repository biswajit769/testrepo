const puppeteer = require('puppeteer');
const constants = require('./constants');
const dotenv = require("dotenv");
dotenv.config();

const createGTT = async (compdetail, userdetail) => {
    console.log("inside createGTT method");
    //console.log(user, quantity, company, GTTPrice);
  //const browser = await puppeteer.launch({ headless: true });
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL);
  await page.waitFor(500);
  await page.waitForSelector(constants.USERNAME_SELECTOR);
  await page.click(constants.USERNAME_SELECTOR);
  await page.keyboard.type(`${userdetail.userid}`);

  console.log("username entered");

  await page.waitForSelector(constants.PASSWORD_SELECTOR);
  await page.click(constants.PASSWORD_SELECTOR);
  await page.keyboard.type(`${userdetail.pass}`);
  await page.waitFor(1000);
  console.log("password entered");

  await page.waitForSelector(constants.SUBMIT_BUTTON_SELECTOR);
  await page.click(constants.SUBMIT_BUTTON_SELECTOR);

  await page.waitForSelector(constants.PIN_INPUT_SELECTOR);
  await page.click(constants.PIN_INPUT_SELECTOR);
  await page.keyboard.type(`${userdetail.pin}`);
  await page.waitFor(1000);
  console.log("pin entered");

  await page.waitForSelector(constants.PIN_BUTTON_SELECTOR);
  await page.click(constants.PIN_BUTTON_SELECTOR);
  await page.waitFor(500);

  await page.waitForSelector(constants.ORDER_NAV_SELECTOR);
  await page.click(constants.ORDER_NAV_SELECTOR);
  await page.waitFor(500);

  await page.waitForSelector(constants.SERACH_BOX_SELECTOR);
  await page.click(constants.SERACH_BOX_SELECTOR);
  await page.keyboard.type(JSON.stringify(compdetail.company));
  await page.waitForSelector(constants.SEARCH_RESULT_SELECTOR);

  await page.click(constants.SEARCH_RESULT_SELECTOR);
  //await page.waitForSelector("//span[contains(text(), 'HINDUNILVR')]");
  await page.waitFor(500);
  const companyname = await page.evaluateHandle(
    (text) =>
      [...document.querySelectorAll("span")].find((span) =>
        span.textContent.includes(text)
      ),
      `${compdetail.company}`
  );
  //const [company] = await page.$x("//span[contains(text(), 'HINDUNILVR')]");
  if (companyname) {
    //await company[0].click();
    console.log(" company name selected");
    await companyname.click();
  } else {
    throw new Error("Link not found");
  }
  await page.waitFor(500);
  const gttcreate = await page.evaluateHandle(
    (imagepath) =>
      [...document.querySelectorAll("img")].find((img) =>
        img.src.includes(imagepath)
      ),
    "/static/images/gtt-icon.svg"
  );
  //const [company] = await page.$x("//span[contains(text(), 'HINDUNILVR')]");
  if (gttcreate) {
    //await company[0].click();
    console.log("image selected");
    await gttcreate.click();
  } else {
    throw new Error("Image not found");
  }
  await page.waitForSelector(constants.TRIGGER_PRICE_SELECTOR);
  await page.click(constants.TRIGGER_PRICE_SELECTOR, { clickCount: 3 });
  await page.keyboard.type(`${compdetail.GTTPrice}`);
  console.log("triggered price entered");

  await page.waitForSelector(constants.TRIGGER_QUANTITY_SELECTOR);
  await page.click(constants.TRIGGER_QUANTITY_SELECTOR, { clickCount: 3 });
  await page.keyboard.type(`${compdetail.quantity}`);
  console.log("triggered quantity entered");

  await page.waitForSelector(constants.TRIGGER_PRICE2_SELECTOR);
  await page.click(constants.TRIGGER_PRICE2_SELECTOR, { clickCount: 3 });
  await page.keyboard.type(`${compdetail.GTTPrice}`);
  console.log("price entered");

  await page.waitForSelector(constants.FINAL_SUBMIT_BUTTON_SELECTOR);
  await page.click(constants.FINAL_SUBMIT_BUTTON_SELECTOR);
  await page.waitFor(5000)
  console.log("final submit");

  await page.waitForSelector(constants.EXIST_SELECTOR);
  await page.click(constants.EXIST_SELECTOR);
  await page.waitFor(500)
  await page.waitForSelector(constants.GTT_SELECTOR);

  await page.click(constants.GTT_SELECTOR);
  await page.waitForSelector(constants.GTT_ORDER_SELECTOR);

  await page.click(constants.GTT_ORDER_SELECTOR);
  await page.waitFor(500);
  const verifycompanyname = await page.evaluateHandle(
    (text) =>
      [...document.querySelectorAll("span")].find((span) =>
        span.textContent.includes(text)
      ),
      `${compdetail.company}`
  );
  //const [company] = await page.$x("//span[contains(text(), 'HINDUNILVR')]");
  if (verifycompanyname) {
    //await company[0].click();
    await browser.close();
    return 'success';
    //await companyname.click();
  } else {
    console.log("company not added");
    await browser.close();
    return 'fail';
    //throw new Error("company added successfully");
  }

  //await browser.close();
};

module.exports = createGTT;