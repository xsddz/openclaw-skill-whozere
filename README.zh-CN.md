
<h1 align="center">openclaw-skill-whozere</h1>

<p align="center">
  <strong>🦞 + 🔔</strong> — OpenClaw whozere 登录告警技能
</p>

<p align="center">
  <a href="https://github.com/xsddz/openclaw-skill-whozere/releases"><img src="https://img.shields.io/github/v/release/xsddz/openclaw-skill-whozere?style=flat-square" alt="Release"></a>
  <a href="https://github.com/xsddz/openclaw-skill-whozere/blob/main/LICENSE"><img src="https://img.shields.io/github/license/xsddz/openclaw-skill-whozere?style=flat-square" alt="License"></a>
  <a href="https://www.npmjs.com/package/openclaw-skill-whozere"><img src="https://img.shields.io/npm/v/openclaw-skill-whozere?style=flat-square" alt="npm"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | 中文
</p>

---

本技能用于将 [whozere](https://github.com/xsddz/whozere) 登录事件实时推送到 OpenClaw 支持的各类消息渠道（Telegram、Slack、Discord、WhatsApp 等），并可选启用 AI 风险分析。

## ✨ 功能特性

- 📡 **多渠道告警**：支持 Telegram、Slack、Discord、WhatsApp 等
- 🤖 **AI 风险分析**：可选智能分析登录风险
- 📊 **历史与统计**：支持登录历史查询与统计工具
- 🌙 **安静时段**：夜间仅推送高危告警
- 🔒 **安全保障**：Webhook 受 OpenClaw 网关认证保护

## 🚀 快速开始

### 1. 安装技能

```bash
openclaw skills install github:xsddz/openclaw-skill-whozere
```

### 2. 配置 whozere

在 whozere `config.yaml` 中添加 OpenClaw webhook：

```yaml
notifiers:
  - type: webhook
    name: "OpenClaw"
    enabled: true
    config:
      url: "http://127.0.0.1:18789/api/webhooks/whozere"
```

### 3. 重启 whozere

```bash
whozere-service restart
```

完成！登录事件将自动通过 OpenClaw 转发到你配置的渠道。

## ⚙️ 配置说明

在 `~/.openclaw/openclaw.json` 中添加：

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

### 配置选项

| 选项         | 类型    | 默认值   | 说明                     |
|--------------|---------|----------|--------------------------|
| enabled      | boolean | true     | 启用/禁用技能            |
| announce     | boolean | true     | 主动推送告警             |
| channel      | string  | "main"  | 目标渠道（telegram等）    |
| riskAnalysis | boolean | false    | 启用 AI 风险分析          |
| quietHours   | object  | null     | 夜间安静时段配置          |

### 安静时段示例

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

## 📬 告警格式

登录事件示例：

```
🔔 登录告警

用户: alice
主机: my-server
时间: 2026-02-07 20:45:30
时区: CST (UTC+8)
系统: linux
IP: 192.168.1.100
终端: ssh
```

### 启用风险分析后

```
🔔 登录告警

用户: root
主机: production-db
时间: 2026-02-07 03:45:30
IP: 185.234.xx.xx
终端: ssh

⚠️ 风险分析: HIGH
- 异常登录时间（凌晨3点）
- 新 IP 地址
- 特权用户登录（root）

建议：请立即核查此登录。
```

## 🛠️ 工具

- `whozere.history` 登录历史查询
- `whozere.stats` 登录统计分析

## 🏗️ 架构图

```
┌─────────────┐     HTTP POST      ┌──────────────────────┐
│   whozere   │ ─────────────────▶ │   OpenClaw Gateway   │
│  (监控登录) │   /api/webhooks/   │                      │
└─────────────┘     whozere        └──────────┬───────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │  whozere 技能         │
                                   │  (格式化+分析)        │
                                   └──────────┬───────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            ┌───────────┐             ┌───────────┐             ┌───────────┐
            │ Telegram  │             │   Slack   │             │  Discord  │
            └───────────┘             └───────────┘             └───────────┘
```

## 🔒 安全说明

- Webhook 受 OpenClaw 网关认证保护
- 支持 Tailscale/SSH 隧道远程 whozere 集成
- 登录记录本地存储于 OpenClaw 数据目录

## 📖 相关链接

- [whozere](https://github.com/xsddz/whozere) - 跨平台登录检测
- [OpenClaw](https://github.com/openclaw/openclaw) - 个人 AI 助手
- [OpenClaw Webhooks](https://docs.openclaw.ai/automation/webhook) - Webhook 指南

## 📜 许可证

[MIT License](LICENSE)

## 🤝 贡献

欢迎贡献代码，欢迎提交 PR。
