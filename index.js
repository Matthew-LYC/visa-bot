const { searchDate } = require("./searchDate");
const cron = require("cron");
const { program } = require("commander");
require("dotenv").config();

program
  .option(
    "-m, --months <number>",
    "Add the number of months you want to search.",
    10
  )
  .option("-i, --interval <number>", "Cron job interval in minutes", 10);

program.parse();

const options = program.opts();

const job = new cron.CronJob(
  `*/${options.interval} * * * *`,
  async function () {
    await searchDate(job, Number(options.months));
  },
  null,
  true,
  "America/Los_Angeles"
);

job.start();

searchDate(job, Number(options.months));
