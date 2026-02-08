# openclaw-skill-whozere

<p align="center">
  <strong>🦞 + 🔔</strong> — OpenClaw skill for whozere login alerts
</p>

<p align="center">
  <a href="https://github.com/xsddz/openclaw-skill-whozere/releases"><img src="https://img.shields.io/github/v/release/xsddz/openclaw-skill-whozere?style=flat-square" alt="Release"></a>
  <a href="https://github.com/xsddz/openclaw-skill-whozere/blob/main/LICENSE"><img src="https://img.shields.io/github/license/xsddz/openclaw-skill-whozere?style=flat-square" alt="License"></a>
  <a href="https://www.npmjs.com/package/openclaw-skill-whozere"><img src="https://img.shields.io/npm/v/openclaw-skill-whozere?style=flat-square" alt="npm"></a>
</p>

<p align="center">
  English | <a href="README.zh-CN.md">中文</a>
</p>


This [OpenClaw](https://github.com/openclaw/openclaw) skill receives login alerts from [whozere](https://github.com/xsddz/whozere) and forwards them to your preferred messaging channels (Telegram, Slack, Discord, WhatsApp, etc.).

## ✨ Features

- 📡 **Multi-channel alerts**: Forward login events to Telegram, Slack, Discord, WhatsApp, and more
- 🤖 **AI-powered risk analysis**: Optional intelligent assessment of login risks
- 📊 **Login history & stats**: Query historical logins and get statistics
- 🌙 **Quiet hours**: Suppress non-critical alerts during specified hours
- 🔒 **Secure**: Protected by OpenClaw's gateway authentication

## 🚀 Quick Start

### 1. Install the Skill

```bash
# From GitHub
openclaw skills install github:xsddz/openclaw-skill-whozere

# Or from npm
npm install -g openclaw-skill-whozere
```

### 2. Configure whozere

Add the OpenClaw webhook to your whozere `config.yaml`:

```yaml
notifiers:
  - type: webhook
    name: "OpenClaw"
    enabled: true
    config:
      url: "http://127.0.0.1:18789/api/webhooks/whozere"
```

### 3. Restart whozere

```bash
whozere-service restart
```

That's it! Login alerts will now be forwarded through OpenClaw to your configured channels.

## ⚙️ Configuration

Add to your `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "whozere": {
      "enabled": true,
      "announce": true,
      "channel": "telegram",
      "riskAnalysis": false
    }
  }
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable the skill |
| `announce` | boolean | `true` | Proactively send alerts |
| `channel` | string | `"main"` | Target: `telegram`, `slack`, `discord`, `whatsapp`, `main` |
| `riskAnalysis` | boolean | `false` | Enable AI risk analysis |
| `quietHours` | object | `null` | Suppress alerts during specific hours |

### Quiet Hours Example

```json
{
  "skills": {
    "whozere": {
      "quietHours": {
        "start": "23:00",
        "end": "07:00",
        "timezone": "Asia/Shanghai"
      }
    }
  }
}
```

## 📬 Alert Format

When a login is detected:

```
🔔 Login Alert

User: alice
Host: my-server
Time: 2026-02-07 20:45:30
Zone: CST (UTC+8)
OS: linux
IP: 192.168.1.100
Terminal: ssh
```

### With Risk Analysis

```
🔔 Login Alert

User: root
Host: production-db
Time: 2026-02-07 03:45:30
IP: 185.234.xx.xx
Terminal: ssh

⚠️ Risk Analysis: HIGH
- Unusual login time (3 AM local)
- New IP address for this user
- Privileged user login (root)

Recommended: Verify this login immediately.
```

## 🛠️ Tools

This skill provides two tools for querying login data:

### `whozere.history`

Query recent login history:

```
Show me the last 10 logins on production-server
```

### `whozere.stats`

Get login statistics:

```
How many unique IPs logged into my servers this week?
```

## 🏗️ Architecture

```
┌─────────────┐     HTTP POST      ┌──────────────────────┐
│   whozere   │ ─────────────────▶ │   OpenClaw Gateway   │
│  (monitors) │   /api/webhooks/   │                      │
└─────────────┘     whozere        └──────────┬───────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │  whozere Skill       │
                                   │  (format + analyze)  │
                                   └──────────┬───────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            ┌───────────┐             ┌───────────┐             ┌───────────┐
            │ Telegram  │             │   Slack   │             │  Discord  │
            └───────────┘             └───────────┘             └───────────┘
```

## 🔒 Security

- Webhook endpoint is protected by OpenClaw's gateway authentication
- For remote whozere installations, use Tailscale or SSH tunnel to reach OpenClaw
- Login records are stored locally in OpenClaw's data directory

## 📖 Related

- [whozere](https://github.com/xsddz/whozere) - Cross-platform login detection
- [OpenClaw](https://github.com/openclaw/openclaw) - Personal AI assistant
- [OpenClaw Webhooks](https://docs.openclaw.ai/automation/webhook) - Webhook guide

## 📜 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.
