const puppeteer = require('puppeteer');
const constants = require('./constants');
const dotenv = require("dotenv");
dotenv.config();

const uploadinvoice = async (invdetail, {userid, password}, res) => {
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
  await page.keyboard.type(userid);

  console.log("username entered");


  //await browser.close();
};

module.exports = uploadinvoice;