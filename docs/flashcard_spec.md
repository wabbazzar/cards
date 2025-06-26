# Flashcard Reader - Game Specification v1.0

## Overview
Flashcard Reader is a progressive learning app that combines memorization with timed decision-making. Players select from multiple flashcard decks, choose difficulty levels, and progress through increasingly challenging content using a clean multiple choice interface with Tron-inspired visual design.

## Core Gameplay Loop

### Basic Mechanics
1. **Question Display**: Main flashcard term/question appears at top of screen in prominent header
2. **Multiple Choice Grid**: 2x2 grid of answer choices displayed below question
3. **Player Response**: Player taps/clicks correct answer from the four options
4. **Timer System**: Optional countdown timer (None, 5s, 10s, 20s) with visual effects
5. **Progressive Learning**: Cards advance through learning states based on performance

### Answer Selection & Feedback
- **Correct Answer**: Green glow animation → Question changes → Score +100 points
- **Wrong Answer**: Red flash animation → Lose 1 life → Show correct answer briefly
- **Timer Expiration**: Cards fade to black → Lose 1 life → Show correct answer → Select random new question from current level (unless all lives lost)
- **No Selection**: If timer expires without selection, treated as wrong answer

### Visual Design - Tron Aesthetic

#### Design Elements
- **Color Palette**: Cyan (#00ffff), electric blue (#0080ff), dark backgrounds with neon highlights
- **Typography**: Futuristic monospace font (Orbitron or similar)
- **Effects**: Glowing outlines, pulsing borders, geometric shapes
- **Background**: Dark with subtle grid pattern, neon accent lines

#### Game Elements
- **Question Header**: Large glowing rectangular panel with cyan border and neon text
- **Answer Grid**: 2x2 grid separated by cross/plus sign dividers (minimalist design for maximum text space)
- **Timer Indicator**: Glowing border around question header that dims as countdown progresses (when enabled)
- **Lives Display**: Row of glowing heart/diamond icons in header
- **Score Display**: Neon-styled counter with level progression indicator

## Timer System & Visual Effects

### Timer Options
- **None**: No time pressure, questions remain until answered
- **5 Seconds**: Fast-paced learning mode
- **10 Seconds**: Standard timed mode  
- **20 Seconds**: Relaxed timed mode

### Timer Visual Effects
When timer is active:
1. **Border Countdown**: Question header border glows brightly, dimming as time decreases
2. **Answer Blinking**: Answer options begin sporadic blinking at 50% time remaining
3. **Intensifying Effect**: Blinking becomes more frequent as time decreases
4. **Critical State**: Last 2 seconds - rapid flashing like failing neon sign
5. **Expiration**: All answers fade to black, correct answer highlighted briefly

### Timer Animation Sequence
```css
/* Card blinking effect during timer countdown */
@keyframes timerBlink {
    0% { opacity: 1; box-shadow: 0 0 10px #00ffff; }
    50% { opacity: 0.3; box-shadow: 0 0 5px #00ffff; }
    100% { opacity: 1; box-shadow: 0 0 10px #00ffff; }
}

/* Critical timer state - rapid failing neon effect */
@keyframes criticalBlink {
    0% { opacity: 1; box-shadow: 0 0 15px #ff0000; }
    25% { opacity: 0.2; box-shadow: 0 0 2px #ff0000; }
    50% { opacity: 0.8; box-shadow: 0 0 8px #ff0000; }
    75% { opacity: 0.1; box-shadow: none; }
    100% { opacity: 1; box-shadow: 0 0 15px #ff0000; }
}

/* Timer expiration - fade to black */
@keyframes timeExpired {
    0% { opacity: 1; }
    100% { opacity: 0.1; background: #000; }
}
```

## Progressive Learning System

### Card Learning State Machine
Each card progresses through distinct learning states with detailed tracking:

#### State 1: New Card
- **Initial State**: Never seen before in current session
- **Correct Answer**: Card becomes "Learned" → permanently removed from rotation
- **Incorrect Answer**: Card becomes "Struggling" → requires remediation
- **Tracking**: Record first attempt result, timestamp, response time

#### State 2: Struggling Card  
- **Requirement**: Must get 2 consecutive correct answers to become "Learned"
- **Correct Answer**: Increment consecutive counter (1/2 → 2/2 → Learned)
- **Incorrect Answer**: Reset consecutive counter to 0, remains "Struggling"
- **Persistence**: Continues appearing until mastered
- **Tracking**: Record all attempts, consecutive streak, total attempts

#### State 3: Learned Card
- **Status**: Permanently removed from game rotation for current session
- **Replacement**: Triggers addition of next available card from higher progression level
- **Tracking**: Record mastery timestamp, total attempts to master, response times

#### State Transitions & Analytics
```javascript
// Card state tracking structure
const cardState = {
    id: 1,
    currentState: 'new', // 'new', 'struggling', 'learned'
    attempts: 0,
    correctAttempts: 0,
    consecutiveCorrect: 0,
    firstAttemptTime: null,
    masteryTime: null,
    averageResponseTime: 0,
    responseHistory: []
};
```

### Lives System
- **Starting Lives**: 5 lives per game session
- **Life Loss Conditions**:
  - -1 life for incorrect answer selection
  - -1 life for timer expiration without selection
- **Life Gain**: +1 life for every 1000 points earned
- **Maximum Lives**: 10 lives (prevents infinite accumulation)
- **Game Over**: When all lives depleted → Show comprehensive game over screen

### Scoring System
- **Correct Answer**: +100 points
- **Speed Bonus**: Additional points for quick responses (if timer enabled)
  - Answer within first 25% of time: +50 bonus
  - Answer within first 50% of time: +25 bonus
- **Streak Multiplier**: Consecutive correct answers increase multiplier (max 3x)

## Mathematical Progression System

### Level Structure Overview
Dynamic level progression based on selected card deck:
- **Level Count**: Determined by deck's `available_levels` and `max_level` metadata
- **Level Content**: Each level contains cards with matching `progression_level` values
- **Flexible Progression**: 3-level deck = 3 game levels, 9-level deck = 9 game levels
- **Adaptive Difficulty**: Card count per level varies based on deck composition

### Level Mathematics
```
Sample Set Size = Total cards with current progression_level
Cards to Progress = All cards in current level must be mastered
Level Advancement = Move to next progression_level when current level complete
```

### Card Selection Algorithm
Simple random selection from current level's card pool:
- **Random Selection**: Pick random card from current progression level
- **Mastery Tracking**: Remove mastered cards from selection pool
- **Level Completion**: When all cards mastered, advance to next progression level

## User Interface System

### Initial Loading Screen
```html
<div class="start-screen">
    <h1 class="app-title">Flashcard Reader</h1>
    <p class="app-subtitle">Master Knowledge Through Practice</p>
    
    <!-- Deck Selection -->
    <div class="selection-group">
        <label class="selection-label">Select Learning Deck:</label>
        <select id="deckSelect" class="neon-dropdown">
            <!-- Dynamically populated from assets/*.json -->
        </select>
    </div>
    
    <!-- Starting Level Selection -->
    <div class="selection-group">
        <label class="selection-label">Starting Level:</label>
        <select id="levelSelect" class="neon-dropdown">
            <!-- Dynamically populated based on selected deck -->
        </select>
    </div>
    
    <!-- Timer Selection -->
    <div class="selection-group">
        <label class="selection-label">Timer Per Question:</label>
        <select id="timerSelect" class="neon-dropdown">
            <option value="none">No Timer</option>
            <option value="5">5 Seconds</option>
            <option value="10">10 Seconds</option>
            <option value="20">20 Seconds</option>
        </select>
    </div>
    
    <button class="start-button neon-button" id="startLearning">Start Learning</button>
</div>
```

### Main Game Layout
```html
<div class="game-container">
    <!-- Header with stats -->
    <header class="game-header">
        <div class="lives-display">
            <!-- Heart icons representing current lives -->
        </div>
        <div class="score-display">
            Score: <span id="currentScore">0</span>
        </div>
        <div class="level-display">
            Level: <span id="currentLevel">1</span>
        </div>
    </header>
    
    <!-- Question area with optional timer -->
    <div class="question-container">
        <div class="timer-ring" id="timerRing" style="display: none;">
            <!-- SVG circular progress indicator -->
        </div>
        <div class="question-card">
            <h2 class="question-text" id="questionText">A type of artificial intelligence where computers learn patterns from data</h2>
        </div>
    </div>
    
    <!-- 2x2 Answer grid with cross dividers -->
    <div class="answers-grid">
        <button class="answer-option" data-answer="0">
            <span class="answer-text">Answer Option 1</span>
        </button>
        <button class="answer-option" data-answer="1">
            <span class="answer-text">Answer Option 2</span>
        </button>
        <button class="answer-option" data-answer="2">
            <span class="answer-text">Answer Option 3</span>
        </button>
        <button class="answer-option" data-answer="3">
            <span class="answer-text">Answer Option 4</span>
        </button>
        <!-- Cross/plus dividers -->
        <div class="grid-divider horizontal"></div>
        <div class="grid-divider vertical"></div>
    </div>
    
    <!-- Progress indicator -->
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-fill" id="levelProgress"></div>
        </div>
        <span class="progress-text">Cards Mastered: <span id="cardProgress">0/5</span></span>
    </div>
</div>
```

### Visual Feedback System

#### Correct Answer Feedback
```css
@keyframes correctAnswer {
    0% {
        background: rgba(0, 255, 0, 0.1);
        box-shadow: 0 0 10px #00ff00;
        transform: scale(1);
    }
    50% {
        background: rgba(0, 255, 0, 0.3);
        box-shadow: 0 0 30px #00ff00, 0 0 60px #00ff00;
        transform: scale(1.05);
    }
    100% {
        background: rgba(0, 255, 0, 0.1);
        box-shadow: 0 0 15px #00ff00;
        transform: scale(1);
    }
}
```

#### Wrong Answer Feedback
```css
@keyframes wrongAnswer {
    0% {
        background: rgba(255, 0, 0, 0.1);
        box-shadow: 0 0 10px #ff0000;
    }
    25% {
        background: rgba(255, 0, 0, 0.4);
        box-shadow: 0 0 25px #ff0000;
    }
    75% {
        background: rgba(255, 0, 0, 0.2);
        box-shadow: 0 0 15px #ff0000;
    }
    100% {
        background: transparent;
        box-shadow: none;
    }
}
```

## Data Integration & Deck Management

### Deck Discovery System
- **File Pattern**: Scan `/assets` directory for files ending in `_cards.json`
- **Auto-Population**: Dynamically build deck selection dropdown
- **Metadata Validation**: Ensure required metadata fields exist
- **Error Handling**: Graceful fallback if deck files missing/corrupted
- **Live Updates**: Deck options populate on game load

#### Deck Metadata Requirements
```json
{
    "metadata": {
        "deck_name": "Data Science Fundamentals",
        "description": "Essential data science concepts and terminology",
        "category": "Technology",
        "total_cards": 10,
        "available_levels": [1, 2],
        "max_level": 2,
        "difficulty_range": "Beginner to Intermediate",
        "version": "1.0.0",
        "created_date": "2025-01-22",
        "estimated_completion_time": "15-30 minutes"
    }
}
```

#### Initial Deck Support Examples
- **Data Science**: `data_science_cards.json` (Levels 1-2, 10 cards)
- **Chinese Language**: `chinese_language_cards.json` (Levels 1-7, 50+ cards)
- **Mathematics**: `math_fundamentals_cards.json` (Levels 1-5, 25 cards)
- **Extensible**: Additional decks added by dropping files in assets directory

### Card Data Structure
Uses the same JSON structure as data_science_cards.json:
```json
{
    "metadata": {
        "deck_name": "Data Science Fundamentals",
        "description": "Essential data science concepts",
        "max_level": 2, 
        "available_levels": [1, 2],
        "card_count": 10
    },
    "cards": [
        {
            "id": 1,
            "term": "Machine Learning",
            "definition": "A type of artificial intelligence...",
            "wrong_answers": ["Data Mining", "Statistical Analysis", "Computer Vision"],
            "progression_level": 1
        }
    ]
}
```

### Question Formation
- **Question Format**: Display card's definition as the question/prompt
- **Correct Answer**: Card's term (the word being defined)
- **Wrong Answers**: Use card's wrong_answers array (3 incorrect terms)
- **Shuffle Algorithm**: Randomize position of correct term in 2x2 grid

## Level Progression & Completion

### Level Advancement Rules
- **Progression Trigger**: ALL cards in current progression level must be mastered
- **Level Transition**: Unlock all cards from next progression level
- **Visual Feedback**: Level completion animation with particle effects
- **Statistics Update**: Track cards learned, accuracy, time per level

### Level Completion Animation System

#### Level Up Sequence
1. **Background Flash**: Cyan glow overlay with radial gradient
2. **Level Text**: "LEVEL X COMPLETE!" appears with scale animation
3. **Progress Info**: "X CARDS MASTERED" with particle effects
4. **Next Level Preview**: "UNLOCKING LEVEL Y..." with anticipation
5. **Stats Summary**: Cards learned, accuracy rate, time for level
6. **Continuation**: Auto-advance to next level after 3 seconds

#### Level Completion HTML Structure
```html
<div class="level-complete-overlay" id="levelCompleteOverlay">
    <div class="level-complete-content">
        <h1 class="level-complete-title">LEVEL <span id="completedLevel">1</span> COMPLETE!</h1>
        <div class="level-stats">
            <p class="stat-item">Cards Mastered: <span id="levelCards">5</span></p>
            <p class="stat-item">Accuracy: <span id="levelAccuracy">85%</span></p>
            <p class="stat-item">Time: <span id="levelTime">2:34</span></p>
        </div>
        <div class="next-level-preview">
            <p class="next-level-text">Unlocking Level <span id="nextLevel">2</span>...</p>
            <div class="unlock-progress">
                <div class="unlock-bar"></div>
            </div>
        </div>
    </div>
    <div class="level-complete-particles"></div>
</div>
```

#### Level Completion CSS Animations
```css
@keyframes levelComplete {
    0% {
        opacity: 0;
        transform: scale(0.5) rotate(-10deg);
    }
    50% {
        opacity: 1;
        transform: scale(1.2) rotate(0deg);
        box-shadow: 0 0 50px #00ffff, 0 0 100px #0080ff;
    }
    100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
        box-shadow: 0 0 20px #00ffff;
    }
}

@keyframes levelFlash {
    0% { background: rgba(0, 255, 255, 0); }
    25% { background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, rgba(0, 128, 255, 0.1) 100%); }
    75% { background: radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, rgba(0, 128, 255, 0.05) 100%); }
    100% { background: rgba(0, 255, 255, 0); }
}

@keyframes unlockProgress {
    0% { width: 0%; }
    100% { width: 100%; }
}
```

## End Game States

### Game Over Screen (0 Lives)
```html
<div class="game-over-overlay">
    <h1 class="overlay-title">Learning Session Complete</h1>
    <div class="final-stats">
        <div class="stat-group primary-stats">
            <p class="stat-item">Final Score: <span id="finalScore">0</span></p>
            <p class="stat-item">Level Reached: <span id="finalLevel">1</span></p>
            <p class="stat-item">Cards Mastered: <span id="finalCards">0</span></p>
        </div>
        <div class="stat-group detailed-stats">
            <p class="stat-item">Accuracy Rate: <span id="finalAccuracy">0%</span></p>
            <p class="stat-item">Session Time: <span id="sessionTime">0:00</span></p>
            <p class="stat-item">Total Attempts: <span id="totalAttempts">0</span></p>
            <p class="stat-item">Correct Answers: <span id="correctAnswers">0</span></p>
            <p class="stat-item">Wrong Answers: <span id="wrongAnswers">0</span></p>
            <p class="stat-item">Timeouts: <span id="timeouts">0</span></p>
            <p class="stat-item">Average Response Time: <span id="avgResponseTime">0.0s</span></p>
            <p class="stat-item">Longest Streak: <span id="longestStreak">0</span></p>
        </div>
    </div>
    <div class="end-options">
        <button class="restart-button neon-button" id="restartLevel">Continue This Level</button>
        <button class="restart-button neon-button" id="restartGame">Start Over</button>
        <button class="menu-button neon-button" id="backToMenu">Back to Menu</button>
    </div>
</div>
```

### Victory Screen (All Cards Mastered)
```html
<div class="victory-overlay">
    <h1 class="victory-title">Deck Mastered!</h1>
    <div class="victory-celebration">
        <!-- Particle effects and animations -->
        <div class="achievement-badge">
            <div class="badge-icon">🏆</div>
            <div class="badge-text">PERFECT COMPLETION</div>
        </div>
    </div>
    <div class="victory-stats">
        <div class="stat-group mastery-stats">
            <p class="stat-item highlight">Perfect Score: <span id="victoryScore">0</span></p>
            <p class="stat-item highlight">Total Cards: <span id="totalCards">0</span></p>
            <p class="stat-item highlight">Final Accuracy: <span id="victoryAccuracy">100%</span></p>
            <p class="stat-item highlight">Completion Time: <span id="completionTime">0:00</span></p>
        </div>
        <div class="stat-group performance-stats">
            <p class="stat-item">Cards Learned First Try: <span id="firstTryCards">0</span></p>
            <p class="stat-item">Cards Requiring Review: <span id="reviewCards">0</span></p>
            <p class="stat-item">Fastest Response: <span id="fastestResponse">0.0s</span></p>
            <p class="stat-item">Most Challenging Card: <span id="hardestCard">-</span></p>
            <p class="stat-item">Learning Efficiency: <span id="efficiency">0%</span></p>
        </div>
    </div>
    <div class="victory-options">
        <button class="menu-button neon-button" id="selectNewDeck">Try Another Deck</button>
        <button class="menu-button neon-button secondary" id="reviewSession">Review Session</button>
    </div>
</div>
```

## Session Statistics Tracking

### Real-Time Stats Display
```html
<div class="game-header">
    <div class="lives-display">
        <span class="stat-label">Lives:</span>
        <div class="hearts-container" id="heartsContainer">
            <!-- Heart icons dynamically updated -->
        </div>
    </div>
    <div class="score-display">
        <span class="stat-label">Score:</span> 
        <span id="currentScore">0</span>
        <span class="streak-display">Streak: <span id="currentStreak">0</span></span>
    </div>
    <div class="progress-display">
        <span class="stat-label">Level <span id="currentLevel">1</span>:</span>
        <span id="cardProgress">0/5</span> mastered
        <span class="accuracy-display">(<span id="currentAccuracy">0%</span>)</span>
    </div>
</div>
```

### Session Analytics Tracking
```javascript
const sessionStats = {
    // Basic Performance
    startTime: Date.now(),
    totalAttempts: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    timeouts: 0,
    
    // Streaks & Patterns
    currentStreak: 0,
    longestStreak: 0,
    streakHistory: [],
    
    // Response Times
    responseHistory: [],
    averageResponseTime: 0,
    fastestResponse: Infinity,
    slowestResponse: 0,
    
    // Learning Progress
    cardsLearned: 0,
    cardsMastered: 0,
    cardsStruggling: 0,
    firstTryCorrect: 0,
    multipleAttemptsRequired: 0,
    
    // Level Progress
    levelsCompleted: 0,
    currentLevel: 1,
    levelStartTime: Date.now(),
    levelStats: {},
    
    // Timer Stats (if enabled)
    timerEnabled: false,
    timerDuration: 0,
    averageTimeUsed: 0,
    fastAnswers: 0, // < 25% of timer
    slowAnswers: 0  // > 75% of timer
};
```

### Real-Time Updates
- **Live Accuracy**: Updates after each question
- **Streak Counter**: Visible streak with color changes
- **Progress Bar**: Visual completion of current level
- **Response Time**: Track and display average response speed
- **Learning Velocity**: Cards mastered per minute

## Technical Requirements

### Core Features
- **Responsive Design**: Works on desktop and mobile devices
- **Touch Support**: Full touch interface for mobile users
- **Keyboard Navigation**: Arrow keys + Enter for desktop users
- **Performance**: 60 FPS smooth animations and transitions
- **Memory Management**: Efficient cleanup of visual effects and timers
- **Session Management**: Stateless design with comprehensive tracking

### Timer Implementation
```javascript
class GameTimer {
    constructor(duration, onTick, onExpire) {
        this.duration = duration * 1000; // Convert to milliseconds
        this.remaining = this.duration;
        this.onTick = onTick;
        this.onExpire = onExpire;
        this.intervalId = null;
    }
    
    start() {
        this.intervalId = setInterval(() => {
            this.remaining -= 100;
            this.onTick(this.remaining / this.duration);
            
            if (this.remaining <= 0) {
                this.stop();
                this.onExpire();
            }
        }, 100);
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
```

### Mobile Optimization
- **Touch Targets**: Minimum 44px touch targets for answer options
- **Viewport Scaling**: Proper viewport meta tag for mobile devices
- **Performance**: Optimized animations for mobile hardware
- **Accessibility**: High contrast colors, readable font sizes

### CSS Grid Layout for Minimalist Design
```css
.answers-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 0;
    position: relative;
    width: 100%;
    height: 300px;
}

.answer-option {
    background: transparent;
    border: 1px solid #00ffff;
    color: #00ffff;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.grid-divider {
    position: absolute;
    background: #00ffff;
    box-shadow: 0 0 10px #00ffff;
}

.grid-divider.horizontal {
    left: 0;
    right: 0;
    top: 50%;
    height: 2px;
    transform: translateY(-50%);
}

.grid-divider.vertical {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    transform: translateX(-50%);
}

/* Timer border effect */
.question-card {
    border: 3px solid #00ffff;
    transition: border-color 0.1s ease;
}

.timer-active {
    border-color: #00ffff;
    box-shadow: 0 0 20px #00ffff;
}

.timer-warning {
    border-color: #ffaa00;
    box-shadow: 0 0 20px #ffaa00;
}

.timer-critical {
    border-color: #ff0000;
    box-shadow: 0 0 30px #ff0000;
}
```

## Error Handling & Robustness

### Deck Loading Error Handling
- **Missing Decks**: Graceful fallback if deck files missing/corrupted
- **Invalid Metadata**: Validation with user-friendly error messages
- **Empty Decks**: Handle edge cases with insufficient cards
- **Network Issues**: Offline capability with cached decks
- **Corrupted JSON**: Parse error handling with recovery options

### Session Continuity
- **Page Refresh**: Maintain session state in localStorage
- **Browser Close**: Save progress automatically
- **Connection Loss**: Continue offline with current deck
- **Memory Limits**: Efficient cleanup of completed sessions
- **Error Recovery**: Auto-restart on critical failures

### Data Validation
```javascript
function validateDeck(deck) {
    const required = ['metadata', 'cards'];
    const metadataFields = ['deck_name', 'max_level', 'available_levels'];
    const cardFields = ['id', 'term', 'definition', 'wrong_answers', 'progression_level'];
    
    // Validate structure
    if (!required.every(field => deck[field])) {
        throw new Error('Invalid deck structure');
    }
    
    // Validate metadata
    if (!metadataFields.every(field => deck.metadata[field])) {
        throw new Error('Invalid deck metadata');
    }
    
    // Validate cards
    if (!Array.isArray(deck.cards) || deck.cards.length === 0) {
        throw new Error('No cards in deck');
    }
    
    deck.cards.forEach(card => {
        if (!cardFields.every(field => card[field])) {
            throw new Error(`Invalid card structure: ${card.id}`);
        }
    });
    
    return true;
}
```

## Future Extensibility

### Potential Enhancements
- **Custom Decks**: User-uploadable card decks via file input
- **Spaced Repetition**: Intelligent review scheduling based on forgetting curves
- **Multi-Language**: Localization support for international users
- **Accessibility**: Screen reader support, keyboard navigation, high contrast
- **Offline Mode**: Full functionality without internet connection
- **Progress Sync**: Cloud save/sync across devices
- **Achievement System**: Badges, milestones, learning streaks
- **Study Analytics**: Detailed learning reports and insights
- **Social Features**: Share decks, compete with friends
- **Audio Support**: Text-to-speech for questions and answers

### Technical Extensibility
- **Plugin Architecture**: Modular system for adding new features
- **Theme System**: Multiple visual themes beyond Tron aesthetic
- **Export Functions**: Save session data, learning progress
- **API Integration**: Connect to external flashcard services
- **Performance Monitoring**: Built-in analytics and optimization
- **A/B Testing**: Framework for experimenting with learning methods

## Success Criteria

### Gameplay Requirements
- [ ] Question displays clearly at top of screen
- [ ] 2x2 answer grid responds to touch/click input
- [ ] Timer system works with visual effects (border dimming)
- [ ] Lives system decreases on wrong answers/timeouts
- [ ] Score increases on correct answers with appropriate bonuses
- [ ] Progressive learning states track correctly
- [ ] Level progression works with dynamic deck levels
- [ ] Session statistics track accurately

### Visual Quality
- [ ] Tron aesthetic consistent throughout interface
- [ ] Smooth animations at 60 FPS
- [ ] Timer effects (blinking, fading) work correctly
- [ ] Cross/plus grid dividers display properly
- [ ] No visual glitches or overlapping elements
- [ ] Responsive design works on multiple screen sizes
- [ ] Level completion animations are satisfying

### Data Integration
- [ ] Dynamic deck loading from assets directory
- [ ] Correct question formation (definition → term)
- [ ] Wrong answers properly randomized and displayed
- [ ] Metadata used for level and difficulty selection
- [ ] Error handling for corrupted/missing decks
- [ ] Session persistence across page refreshes

### Educational Effectiveness
- [ ] Card learning states promote retention
- [ ] Progressive difficulty maintains engagement
- [ ] Timer pressure enhances focus (when enabled)
- [ ] Clear feedback on right/wrong answers
- [ ] Comprehensive statistics for learning assessment
- [ ] Level completion provides sense of achievement
- [ ] End game screens show meaningful progress data

## Development Protocol

### Phase 0: Foundation Setup
- [ ] Create basic HTML structure with Tron CSS styling
- [ ] Implement deck discovery and selection system
- [ ] Set up timer system with visual effects
- [ ] Test responsive design on multiple devices

### Phase 1: Core Gameplay
- [ ] Question display and answer grid functionality
- [ ] Touch/click input handling for answer selection
- [ ] Basic scoring and lives system
- [ ] Visual feedback for correct/wrong answers

### Phase 2: Progressive Learning
- [ ] Card learning state machine implementation
- [ ] Mathematical progression system (42 levels)
- [ ] Beta distribution card selection algorithm
- [ ] Level advancement and completion detection

### Phase 3: Visual Polish
- [ ] Complete Tron aesthetic implementation
- [ ] Timer visual effects (blinking, fading)
- [ ] Smooth animations and transitions
- [ ] Level completion and game over screens

### Phase 4: Testing & Optimization
- [ ] Cross-device compatibility testing
- [ ] Performance optimization for 60 FPS
- [ ] Educational effectiveness validation
- [ ] Bug fixes and edge case handling

---

*This specification provides a comprehensive foundation for developing a progressive flashcard learning application with simplified multiple choice mechanics while maintaining the sophisticated learning progression system and visual appeal of the original Card Blaster concept.*
