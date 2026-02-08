# whozere Login Alert Skill

This skill receives login alerts from [whozere](https://github.com/xsddz/whozere) and forwards them to your configured OpenClaw channels.

## Overview

**whozere** is a cross-platform login detection tool that monitors SSH, console, RDP, and VNC logins. This skill integrates whozere with OpenClaw, enabling:

- Real-time login alerts via Telegram, Slack, Discord, WhatsApp, etc.
- AI-powered risk analysis for suspicious logins
- Historical login tracking and anomaly detection

## Webhook

| Property | Value |
|----------|-------|
| Endpoint | `/api/webhooks/whozere` |
| Method   | POST |
| Content-Type | application/json |

### Payload Schema

```json
{
  "event": "login",
  "username": "alice",
  "hostname": "my-server",
  "ip": "192.168.1.100",
  "terminal": "ssh",
  "timestamp": "2026-02-07T20:45:30+08:00",
  "os": "linux",
  "message": "🔔 Login Alert\n\nUser: alice\n..."
}
```

## Configuration

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
| `announce` | boolean | `true` | Proactively send alerts (vs. wait for conversation) |
| `channel` | string | `"main"` | Target channel: `telegram`, `slack`, `discord`, `whatsapp`, or `main` |
| `riskAnalysis` | boolean | `false` | Enable AI risk analysis for logins |
| `quietHours` | object | `null` | Suppress non-critical alerts during specified hours |

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

## Alert Format

When a login is detected, you'll receive a message like:

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

## Risk Analysis (Optional)

When `riskAnalysis` is enabled, the AI will analyze each login:

```
🔔 Login Alert

User: root
Host: production-db
Time: 2026-02-07 03:45:30
IP: 185.234.xx.xx (Russia)
Terminal: ssh

⚠️ Risk Analysis: HIGH
- Unusual login time (3 AM local)
- IP geolocation from unexpected country
- Root user direct login

Recommended: Verify this login immediately.
```

## Tools

This skill provides the following tools:

### `whozere.history`

Query recent login history.

```
Show me the last 10 logins on production-server
```

### `whozere.stats`

Get login statistics.

```
How many unique IPs logged into my servers this week?
```

## Setup

### 1. Install the Skill

```bash
openclaw skills install github:xsddz/openclaw-skill-whozere
# or from ClawHub
openclaw skills install whozere
```

### 2. Configure whozere

Add OpenClaw webhook to your whozere `config.yaml`:

```yaml
notifiers:
  - type: webhook
    name: "OpenClaw"
    enabled: true
    config:
      url: "http://127.0.0.1:18789/api/webhooks/whozere"
```

### 3. Restart Services

```bash
# Restart whozere
whozere-service restart

# Verify OpenClaw skill is loaded
openclaw skills list
```

## Security Notes

- The webhook endpoint is protected by OpenClaw's gateway authentication
- For remote whozere installations, use Tailscale Serve/Funnel or SSH tunnel
- Consider using a webhook secret for additional security

## Related

- [whozere](https://github.com/xsddz/whozere) - Cross-platform login detection
- [OpenClaw Webhooks](https://docs.openclaw.ai/automation/webhook) - Webhook automation guide
