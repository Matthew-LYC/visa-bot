const puppeteer = require("puppeteer");
const chalk = require("chalk");

const log = {
  info: (txt) => console.log(chalk.blue(txt)),
  success: (txt) => console.log(chalk.green(txt)),
  error: (txt) => console.log(chalk.red(txt)),
  warning: (txt) => console.log(chalk.yellow(txt)),
};

exports.searchDate = async (cronJob, searchMonths) => {
  log.info(`Start searching next ${searchMonths} months at ${new Date()}`);

  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    page.setViewport({
      width: 1280,
      height: 800,
      isMobile: false,
    });
    await page.goto("https://ais.usvisa-info.com/en-ca/niv/users/sign_in");
    await page.waitForSelector('input[name="user[email]"]');

    await page.waitForTimeout(1000);

    // email
    await page.type('input[name="user[email]"]', process.env.EMAIL, {
      delay: 100,
    });

    // password
    await page.type('input[name="user[password]"]', process.env.PASSWORD, {
      delay: 100,
    });

    await page.waitForTimeout(1000);

    // checkbox
    await page.click('input[name="policy_confirmed"]');

    // click signin
    await page.click('input[type="submit"]');

    await page.waitForTimeout(2000);

    log.info("Signed in");

    // click Continue
    const continues = await page.$x("//a[contains(., 'Continue')]");
    if (continues.length > 0) {
      await continues[0].click();
    } else {
      throw new Error("Continue not found");
    }

    await page.waitForTimeout(2000);

    // expand accordion
    const reschedule1 = await page.$x(
      "//a[contains(., 'Reschedule Appointment')]"
    );
    if (reschedule1.length > 0) {
      await reschedule1[0].click();
    } else {
      throw new Error("Reschedule not found");
    }

    // click Reschedule
    const reschedule2 = await page.$x(
      "//p/a[contains(., 'Reschedule Appointment')]"
    );
    if (reschedule2.length > 0) {
      await reschedule2[0].click();
    } else {
      throw new Error("Reschedule not found");
    }

    await page.waitForTimeout(2000);

    log.info("Searching date");

    // if (await page.waitForSelector("#consulate_date_time_not_available")) {
    //   throw new Error(
    //     "There are no available appointments at the selected location. Please try again later."
    //   );
    // }

    // select city
    await page.select(
      "select[name='appointments[consulate_appointment][facility_id]']",
      "94"  //Toronto
    );

    await page.waitForTimeout(1000);

    await page.click("input[name='appointments[consulate_appointment][date]']");

    await page.waitForTimeout(1000);

    // find date
    let found = false;
    // find 6 months
    let i = 0;

    while (found === false && i < searchMonths) {
      const dates = await page.$x("//a[@class='ui-state-default']");
      if (dates.length > 0) {
        await dates[0].click();
        found = true;
        log.success(`Slot found in ${searchMonths} months`);
      } else {
        await page.click("a[data-handler='next']");
        i++;
        // end cycle
        if (i === searchMonths) {
          found = true;
          await browser.close();
          log.warning(`No available slot found in ${searchMonths} months`);
          log.info(`Search ended at ${new Date()}`);
        }
      }

      await page.waitForTimeout(100);
    }

    // select time
    await page.waitForTimeout(2000);

    // find option
    const value = await page.evaluate(() => {
      const options = document.querySelectorAll(
        "select[name='appointments[consulate_appointment][time]'] > option"
      );
      return options[options.length - 1].value;
    });

    await page.select(
      "select[name='appointments[consulate_appointment][time]']",
      value
    );

    // confirm
    await page.waitForTimeout(1000);
    await page.click('input[type="submit"]');

    // confirm modal
    await page.waitForTimeout(1000);
    const confirm = await page.$x("//a[contains(., 'Confirm')]");
    if (confirm.length > 0) {
      await confirm[0].click();
    } else {
      throw new Error("Confirm not found");
    }

    await page.waitForTimeout(3000);
    await browser.close();
    log.info(`Search ended at ${new Date()}`);
    cronJob.stop();
  } catch (e) {
    log.error(e.message);
    await browser.close();
  }
};
