// const puppeteer = require('puppeteer');

// async function fetchPartDetails(partNumber) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(`https://www.partselect.com/Models/${partNumber}/`);

//   // Extract product details
//   const productDetails = await page.evaluate(() => {
//     const name = document.querySelector('h1.product-name')?.innerText.trim();
//     const manufacturerNumber = document.querySelector('div.manufacturer-number')?.innerText.trim();
//     const description = document.querySelector('div.product-description')?.innerText.trim();
//     return { name, manufacturerNumber, description };
//   });

//   await browser.close();
//   return productDetails;
// }

// fetchPartDetails('WDT780SAEM1').then(console.log).catch(console.error);




const puppeteer = require('puppeteer');

async function testPageLoad(partNumber) {
  const browser = await puppeteer.launch({ headless: false }); // Run in non-headless mode to see the browser
  const page = await browser.newPage();

  try {
    console.log(`Navigating to https://www.partselect.com/Models/${partNumber}/`);
    await page.goto(`https://www.partselect.com/Models/${partNumber}/`, {
      waitUntil: 'networkidle2', // Wait for the page to fully load
      timeout: 60000 // Increase timeout to 60 seconds
    });

    // Check if the page loaded successfully
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'screenshot.png' });
    console.log('Screenshot saved as screenshot.png');

    // Extract some content to verify the page is loaded correctly
    const content = await page.evaluate(() => {
      return document.querySelector('h1')?.innerText || 'No content found';
    });
    console.log(`Page content: ${content}`);
  } catch (error) {
    console.error('Error loading the page:', error);
  } finally {
    await browser.close();
  }
}

// Test with a sample part number
testPageLoad('WDT780SAEM1');