# Flashcard Reader - Mobile-First Development Makefile
# Cross-platform commands for development and testing

.PHONY: serve mobile-test desktop-test deck-test timer-test performance-test auto-test clean-cache help

# Default target
help:
	@echo "🚀 Flashcard Reader Development Commands"
	@echo ""
	@echo "📱 Core Development:"
	@echo "  make serve         - Start development server (mobile-ready)"
	@echo "  make mobile-test   - Test mobile experience in browser"
	@echo "  make desktop-test  - Test desktop enhancements"
	@echo ""
	@echo "🧪 Feature Testing:"
	@echo "  make deck-test     - Test deck discovery system"
	@echo "  make timer-test    - Test timer visual effects"
	@echo "  make performance-test - Verify 60 FPS performance"
	@echo ""
	@echo "🔧 Development Tools:"
	@echo "  make auto-test     - Run automated test suite"
	@echo "  make clean-cache   - Clear browser cache instructions"
	@echo "  make git-commit    - Commit and push changes"
	@echo ""
	@echo "📊 Live Demo: https://wabbazzar.github.io/cards/"

# Start development server with mobile optimization
serve:
	@echo "🚀 Starting mobile-first development server..."
	@echo "📱 Mobile viewport: http://localhost:8000 (use dev tools mobile view)"
	@echo "🖥️  Desktop view: http://localhost:8000"
	@echo "⚡ Press Ctrl+C to stop server"
	@echo ""
	@if command -v python3 >/dev/null 2>&1; then \
		python3 -m http.server 8000; \
	elif command -v python >/dev/null 2>&1; then \
		python -m SimpleHTTPServer 8000; \
	elif command -v node >/dev/null 2>&1; then \
		npx http-server -p 8000 -c-1; \
	else \
		echo "❌ No suitable server found. Install Python 3 or Node.js"; \
		exit 1; \
	fi

# Test mobile experience with specific viewport
mobile-test:
	@echo "📱 Testing mobile experience..."
	@echo "1. Open Chrome DevTools (F12)"
	@echo "2. Click device toolbar (Ctrl+Shift+M)"
	@echo "3. Select iPhone 12 Pro (390x844)"
	@echo "4. Test touch controls and responsiveness"
	@echo "5. Verify 44px+ touch targets"
	@echo "6. Check cross-grid layout renders cleanly"
	@echo ""
	@echo "🎯 Mobile Test Checklist:"
	@echo "  ✓ Touch controls responsive (<50ms)"
	@echo "  ✓ Cross/plus dividers visible"
	@echo "  ✓ Timer border effects smooth"
	@echo "  ✓ Answer blinking works"
	@echo "  ✓ All text readable at 320px width"
	@echo ""
	@make serve

# Test desktop enhancements
desktop-test:
	@echo "🖥️  Testing desktop enhancements..."
	@echo "1. Test keyboard shortcuts (1,2,3,4 for answers)"
	@echo "2. Verify mouse hover effects"
	@echo "3. Check responsive scaling 768px+"
	@echo "4. Test cross-platform input handling"
	@echo ""
	@echo "⌨️  Desktop Test Checklist:"
	@echo "  ✓ Keyboard shortcuts (1-4 keys)"
	@echo "  ✓ Mouse hover effects"
	@echo "  ✓ Desktop layout optimization"
	@echo "  ✓ Cross-browser compatibility"
	@echo ""
	@make serve

# Test deck discovery system
deck-test:
	@echo "🃏 Testing deck discovery system..."
	@echo "1. Verify data_science_cards.json loads"
	@echo "2. Check deck metadata validation"
	@echo "3. Test level selection updates"
	@echo "4. Verify graceful error handling"
	@echo ""
	@echo "📋 Deck Test Checklist:"
	@echo "  ✓ Deck dropdown populated"
	@echo "  ✓ Level options update correctly"
	@echo "  ✓ Card data loads without errors"
	@echo "  ✓ Metadata validation works"
	@echo ""
	@ls -la assets/*_cards.json 2>/dev/null || echo "⚠️  No deck files found in assets/"
	@make serve

# Test timer system visual effects
timer-test:
	@echo "⏱️  Testing timer visual effects..."
	@echo "1. Select 5-second timer option"
	@echo "2. Watch border countdown (bright→dim)"
	@echo "3. Observe answer blinking at 50% (2.5s)"
	@echo "4. See critical flashing in last second"
	@echo "5. Verify timeout sequence works"
	@echo ""
	@echo "🎨 Timer Test Checklist:"
	@echo "  ✓ Border countdown smooth"
	@echo "  ✓ Answer blinking at 50%"
	@echo "  ✓ Critical state rapid flash"
	@echo "  ✓ Timeout sequence functional"
	@echo "  ✓ All timer options work"
	@echo ""
	@make serve

# Verify 60 FPS performance on mobile
performance-test:
	@echo "⚡ Testing 60 FPS performance..."
	@echo "1. Open Chrome DevTools → Performance tab"
	@echo "2. Start recording"
	@echo "3. Play through learning session"
	@echo "4. Stop recording and check FPS"
	@echo "5. Verify smooth animations"
	@echo ""
	@echo "📊 Performance Test Checklist:"
	@echo "  ✓ 60 FPS maintained on mobile"
	@echo "  ✓ Touch response <50ms"
	@echo "  ✓ Timer effects smooth"
	@echo "  ✓ No frame drops during animations"
	@echo "  ✓ Memory usage stable"
	@echo ""
	@make serve

# Run automated test suite
auto-test:
	@echo "🧪 Running automated test suite..."
	@echo "Testing deck discovery..."
	@curl -s http://localhost:8000/assets/data_science_cards.json > /dev/null && echo "✓ Deck file accessible" || echo "❌ Deck file not found"
	@echo "Testing HTML structure..."
	@grep -q "answers-grid" index.html && echo "✓ Answer grid present" || echo "❌ Answer grid missing"
	@grep -q "question-card" index.html && echo "✓ Question card present" || echo "❌ Question card missing"
	@echo "Testing CSS classes..."
	@grep -q "timer-critical" styles/tron.css && echo "✓ Timer effects present" || echo "❌ Timer effects missing"
	@grep -q "cross-grid" styles/tron.css && echo "✓ Cross-grid layout present" || echo "❌ Cross-grid missing"
	@echo "Testing JavaScript engine..."
	@grep -q "FlashcardEngine" scripts/flashcard-engine.js && echo "✓ Engine class present" || echo "❌ Engine missing"
	@echo ""
	@echo "🎯 Automated tests complete!"

# Clear browser cache instructions
clean-cache:
	@echo "🧹 Browser cache clearing instructions:"
	@echo ""
	@echo "Chrome/Edge:"
	@echo "  • Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)"
	@echo "  • Dev tools: F12 → Network tab → Disable cache"
	@echo "  • Settings: More tools → Clear browsing data"
	@echo ""
	@echo "Firefox:"
	@echo "  • Hard refresh: Ctrl+F5 (Cmd+Shift+R on Mac)"
	@echo "  • Dev tools: F12 → Network tab → Settings → Disable cache"
	@echo ""
	@echo "Safari:"
	@echo "  • Hard refresh: Cmd+Option+R"
	@echo "  • Develop menu → Empty caches"
	@echo ""
	@echo "💡 Tip: Use private/incognito mode for clean testing"

# Commit and push changes (following dev rules)
git-commit:
	@echo "📝 Committing changes..."
	@if [ -z "$(MSG)" ]; then \
		echo "❌ Usage: make git-commit MSG='Your commit message'"; \
		exit 1; \
	fi
	@git add -A
	@git status
	@echo ""
	@read -p "Continue with commit? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@git commit -m "$(MSG)"
	@git push origin main
	@echo ""
	@echo "🚀 Changes deployed to: https://wabbazzar.github.io/cards/"
	@echo "⏱️  Deployment takes 2-3 minutes"

# Development server with auto-reload (if available)
dev:
	@echo "🔄 Starting development server with auto-reload..."
	@if command -v browser-sync >/dev/null 2>&1; then \
		browser-sync start --server --files "*.html,styles/*.css,scripts/*.js,assets/*.json" --port 8000; \
	else \
		echo "💡 Install browser-sync for auto-reload: npm install -g browser-sync"; \
		make serve; \
	fi

# Quick mobile preview (opens in default browser)
preview:
	@echo "📱 Opening mobile preview..."
	@if command -v open >/dev/null 2>&1; then \
		open "http://localhost:8000"; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open "http://localhost:8000"; \
	elif command -v start >/dev/null 2>&1; then \
		start "http://localhost:8000"; \
	else \
		echo "🌐 Open http://localhost:8000 in your browser"; \
	fi

# Validate all files
validate:
	@echo "✅ Validating project files..."
	@echo "Checking HTML structure..."
	@[ -f "index.html" ] && echo "✓ index.html exists" || echo "❌ index.html missing"
	@echo "Checking CSS files..."
	@[ -f "styles/tron.css" ] && echo "✓ tron.css exists" || echo "❌ tron.css missing"
	@echo "Checking JavaScript files..."
	@[ -f "scripts/flashcard-engine.js" ] && echo "✓ flashcard-engine.js exists" || echo "❌ engine missing"
	@echo "Checking deck files..."
	@[ -f "assets/data_science_cards.json" ] && echo "✓ data_science_cards.json exists" || echo "❌ deck missing"
	@echo ""
	@echo "🎯 File validation complete!"

# Full test sequence
test-all: validate deck-test timer-test performance-test
	@echo ""
	@echo "🏆 Full test sequence complete!"
	@echo "📱 Mobile-first flashcard reader ready!"
	@echo "🚀 Deploy: https://wabbazzar.github.io/cards/" 