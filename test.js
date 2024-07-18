// await page.goto("http://localhost:3000");

const { chromium } = require("playwright");

(async () => {
  // Launch the browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // Open a new page
  const page = await context.newPage();

  // Navigate to the desired URL
  await page.goto("http://localhost:3000");

  // Enter the email into the textbox with ID 'warmup_input'
  await page.fill("#warmup_input", "your-email@example.com");

  // Click the submit button with ID 'warmup_button'
  await page.click("#warmup_button");

  // Define a timeout for the entire navigation process (30 seconds)
  const navigationTimeout = 30000;
  const startTime = Date.now();

  try {
    // Continuously check if the current URL matches the expected Stripe URL until timeout
    while (true) {
      if (page.url().includes("https://checkout.stripe.com/")) {
        console.log("Successfully redirected to Stripe!");
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
    // Log error if the navigation takes more than 30 seconds or fails
    console.error("Failed to redirect to Stripe within 30 seconds:", e.message);
  }

  // Close the browser
  await browser.close();
})();
