const { chromium } = require("playwright");
const Rollbar = require("rollbar");

// Initialize Rollbar with your access token
const rollbar = new Rollbar({
  accessToken: "23c1d6cbbea54c62a1ff888e4bea0c9b",
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: "production",
});

async function checkRedirect(url) {
  // Launch the browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the URL
    await page.goto(url);

    // Enter the email into the textbox with ID 'warmup_input'
    await page.fill("#warmup_input", "your-email@example.com");

    // Click the submit button with ID 'warmup_button'
    await page.click("#warmup_button");

    // Define a timeout for the entire navigation process (30 seconds)
    const navigationTimeout = 30000;
    const startTime = Date.now();

    // Continuously check if the current URL matches the expected Stripe URL until timeout
    while (true) {
      if (page.url().includes("https://checkout.stripe.com/")) {
        console.log(`Successfully redirected to Stripe from ${url}`);
        break;
      }

      // Check if the timeout has been exceeded
      if (Date.now() - startTime > navigationTimeout) {
        throw new Error("Timeout exceeded while waiting for Stripe page");
      }

      // Wait a short time before checking the URL again
      await page.waitForTimeout(500); // Wait for 500 milliseconds before rechecking
    }
  } catch (e) {
    // Log error with Rollbar
    console.log(`Auto Script Failed to stripe checkout ${url} `);
    rollbar.error(
      `Auto Script Failed to redirect to Stripe from ${url}: ${e.message}`
    );
  } finally {
    // Close the browser
    await browser.close();
  }
}

async function startChecking() {
  const urls = ["https://automatedemailwarmup.com", "https://emailwarmup.com"];

  while (true) {
    for (let url of urls) {
      await checkRedirect(url);
    }
    // Wait for 30 minutes before checking again
    await new Promise((resolve) => setTimeout(resolve, 1800000)); // 1800000 milliseconds = 30 minutes
  }
}

startChecking();
