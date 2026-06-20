async function checkPuppeteer() {
  let puppeteer

  try {
    puppeteer = require('puppeteer')
  } catch (error) {
    console.error('Puppeteer package could not be loaded.')
    console.error(error.message)
    process.exit(1)
  }

  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  }

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
  }

  let browser
  try {
    console.log(`Puppeteer package: ${require('puppeteer/package.json').version}`)
    console.log(`Browser executable: ${await puppeteer.executablePath()}`)
    browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()
    await page.setContent('<h1>OpenHeart PDF check</h1>')
    const pdf = await page.pdf({ format: 'A4' })
    console.log(`Puppeteer check passed. Generated ${pdf.length} PDF bytes.`)
  } catch (error) {
    console.error('Puppeteer could not launch Chromium.')
    console.error(error.message)
    process.exitCode = 1
  } finally {
    if (browser) await browser.close()
  }
}

checkPuppeteer()
