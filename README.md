## Getting Started

**NOTE**: Make sure you already have a spot for the visa appointment, it can be any date. This bot helps you reschedule your appointment to the latest date possible.

1. `npm install`
2. Create a `.env` file at root, and add your account credentials like this

```
EMAIL=abc@gmail.com
PASSWORD=123456789
```

4. `node index -m <month> -i <interval-in-mins>`
5. Check the log and Wait till the bot closes itself, which means a spot is found!

## Example Usage

Check the next 2 months every 5 minutes.

`node index -m 2 -i 5`

**NOTE**: The more months you are checking, the more likely you will get a spot sooner.
