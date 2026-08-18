# JOY Telegram Bot

Simple, extendable Telegram bot framework using `node-telegram-bot-api`.

## Folder Structure

```
JOY-Telegram-Bot/
├── index.js               # Entry point (what hosts run) - boots main.js
├── main.js                # Core loader - loads everything and starts the bot
├── config.json            # Token, owner id, bot name, prefix, author
├── package.json
├── render.yaml             # Render.com deploy config
├── JOY/                    # Core framework files
│   ├── utils.js
│   ├── telegram-adapter.js
│   ├── update.js
│   └── concole.js
└── JOY-CMDS/               # All commands & events go here
    ├── cmds/
    │   ├── start.js
    │   ├── help.js
    │   ├── ping.js
    │   ├── uptime.js
    │   ├── info.js
    │   ├── owner.js
    │   ├── userid.js
    │   ├── groupid.js
    │   ├── avatar.js
    │   ├── say.js         (owner only)
    │   ├── rules.js
    │   └── stats.js
    └── events/
        ├── welcomeNewMember.js
        └── leftMember.js
```

Every command's `config` includes an `author` field (set to `"JOY"` by default) —
shown next to each entry in `/help`.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Open `config.json` and fill in:
   - `token` — your bot token from [@BotFather](https://t.me/BotFather)
   - `owner_id` — your numeric Telegram user ID (get it from [@userinfobot](https://t.me/userinfobot))
   - `owner_name`, `bot_name`, `prefix` — customize as you like

   Instead of putting the token in `config.json`, you can set it as an environment
   variable `TELEGRAM_BOT_TOKEN` — that takes priority (recommended for hosting).

3. Run locally:
   ```
   npm start
   ```

## Adding a new command

Create a file in `JOY-CMDS/cmds/yourcommand.js`:

```js
module.exports = {
    config: {
        name: 'hello',       // command name (used with prefix, e.g. /hello)
        role: 0,              // 0 = everyone, 1 = group admins, 2 = bot owner only
        cooldown: 3,           // seconds between uses per user
        description: 'Say hello',
        usePrefix: true,
        author: 'YourName'
    },

    async onStart({ bot, chatId, args, msg, api, config }) {
        return bot.sendMessage(chatId, 'Hello there!');
    }
};
```

Restart the bot and the command loads automatically — no need to edit `main.js`.

## Adding a new event

Create a file in `JOY-CMDS/events/yourevent.js`:

```js
module.exports = {
    config: { name: 'yourevent' },

    async handleEvent({ event, api, bot }) {
        // event.msg is the raw Telegram message object
        // runs on every incoming message
    }
};
```

## Deploying

### Render.com
1. Push this project to a GitHub repo.
2. On Render, choose **New + → Background Worker** and connect the repo
   (the included `render.yaml` will pre-fill build/start commands).
3. Add an environment variable `TELEGRAM_BOT_TOKEN` with your bot token.
4. Deploy. Since the bot uses long-polling, no web port/URL is needed —
   it must run as a **worker**, not a web service.

### Any other Node host (Railway, VPS, Replit, etc.)
1. Upload the project, run `npm install`.
2. Set `TELEGRAM_BOT_TOKEN` as an environment variable (or fill `config.json`).
3. Run `npm start`. Use a process manager like `pm2` to keep it alive on a VPS:
   ```
   npm i -g pm2
   pm2 start main.js --name joy-bot
   ```

## Notes

- `chatGroups.json`, `messageCount.json`, and `userData.json` are created
  automatically on first run and store runtime data — they're git-ignored.
- Global ban list and version-check features try to fetch from a remote
  GitHub source and fail silently if that source isn't reachable, so the
  bot still starts fine without it. Point `JOY/update.js` and the gban URL
  in `main.js` at your own repo if you want to use those features.
