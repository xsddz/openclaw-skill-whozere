#!/bin/bash
#
# OpenClaw Skill: whozere - Installation Script
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/xsddz/openclaw-skill-whozere/main/scripts/install.sh | bash
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with color
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Banner
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       🦞 OpenClaw Skill: whozere Login Alerts 🔔          ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check for openclaw
if ! command -v openclaw &> /dev/null; then
    error "OpenClaw is not installed. Please install it first: npm install -g openclaw"
fi

info "OpenClaw detected: $(openclaw --version 2>/dev/null || echo 'version unknown')"

# Install the skill
info "Installing whozere skill..."

if openclaw skills install github:xsddz/openclaw-skill-whozere; then
    success "Skill installed successfully!"
else
    error "Failed to install skill"
fi

# Verify installation
info "Verifying installation..."
if openclaw skills list | grep -q "whozere"; then
    success "Skill is active!"
else
    warn "Skill installed but not showing in list. Try: openclaw skills list"
fi

# Print configuration instructions
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                    Installation Complete!                  ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure whozere to send to OpenClaw:"
echo "   Add this to your whozere config.yaml:"
echo ""
echo -e "   ${YELLOW}notifiers:${NC}"
echo -e "   ${YELLOW}  - type: webhook${NC}"
echo -e "   ${YELLOW}    name: \"OpenClaw\"${NC}"
echo -e "   ${YELLOW}    enabled: true${NC}"
echo -e "   ${YELLOW}    config:${NC}"
echo -e "   ${YELLOW}      url: \"http://127.0.0.1:18789/api/webhooks/whozere\"${NC}"
echo ""
echo "2. (Optional) Configure skill options in ~/.openclaw/openclaw.json:"
echo ""
echo -e "   ${YELLOW}{${NC}"
echo -e "   ${YELLOW}  \"skills\": {${NC}"
echo -e "   ${YELLOW}    \"whozere\": {${NC}"
echo -e "   ${YELLOW}      \"channel\": \"telegram\",${NC}"
echo -e "   ${YELLOW}      \"riskAnalysis\": true${NC}"
echo -e "   ${YELLOW}    }${NC}"
echo -e "   ${YELLOW}  }${NC}"
echo -e "   ${YELLOW}}${NC}"
echo ""
echo "3. Restart whozere:"
echo -e "   ${YELLOW}whozere-service restart${NC}"
echo ""
echo "Done! Login alerts will now be forwarded through OpenClaw."
echo ""
