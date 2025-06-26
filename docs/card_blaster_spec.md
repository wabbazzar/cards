# Card Blaster - Game Specification v2.0

## Overview
Card Blaster is an arcade-style flashcard game combining memorization with hand-eye coordination. Players control a ship and shoot correct falling answers while flashcard terms appear as fixed questions at the top of the screen.

## Core Gameplay Loop

### Basic Mechanics
1. **Fixed Question Header**: 1-3 flashcard terms appear as fixed headers at top of screen
2. **Falling Answer Targets**: Multiple choice answers fall from top as hexagonal tiles
3. **Player Response**: Player moves ship left/right and shoots correct falling answers
4. **Hit Sequence**: 
   - Correct hit: Blue particle burst animation (~300ms) → Question changes → Existing targets continue falling with OLD answers while NEW targets spawn with NEW question answers
   - Wrong hit: Red explosion animation → Target disappears → **Lose 1 life**
   - Correct answer hits bottom: Lose life (screen shake effects)
   - Wrong answer hits ship: Lose life (collision explosion effect)
   - Wrong answer hits bottom: No penalty (disappears harmlessly)

### Controls
- **Movement**: Left/Right arrow keys (or A/D) for horizontal ship movement
- **Shooting**: Spacebar to fire projectiles at targets
- **Ship**: Stays at bottom of screen, moves horizontally like Galaxian

### Mobile Touch Controls (NEW)
- **Left Zone Tap**: Move ship left
- **Right Zone Tap**: Move ship right  
- **Game Board Tap**: Fire projectile
- **Swipe Down**: Continuous fire mode
- **Long Press**: Rapid fire mode
- **Swipe Left**: Move ship left (additional modality)
- **Swipe Right**: Move ship right (additional modality)
- **Scoreboard Tap**: Pause/Resume game

## Visual Design - Tron Theme

### Aesthetic Elements
- **Color Palette**: Cyan (#00ffff), electric blue, dark backgrounds with neon highlights
- **Typography**: Futuristic monospace font (Orbitron or similar)
- **Effects**: Glowing outlines, particle effects, geometric shapes
- **Background**: Dark with subtle grid pattern, glowing borders

### Game Elements
- **Ship**: Sleek geometric design with cyan glow trail
- **Question Headers**: Glowing rectangular panels with neon text (1-3 simultaneous)
- **Answer Targets**: Hexagonal shapes with pulsing glow, auto-sizing text
- **Projectiles**: Bright cyan energy bullets
- **Hit Effects**: 
  - **Correct**: Blue particle burst explosion
  - **Incorrect**: Red explosion animation

### Text Handling
- **Answer tiles**: Text shrinks to fit within tile boundaries
- **No overflow**: All text must be fully visible within tile margins
- **Responsive sizing**: Font size adjusts based on content length
- **Minimum readability**: Maintain legible text at all sizes

## Mathematical Progression System (42 Levels)

### Level Structure Overview
- **Levels 1-14**: Single question card (beginner → intermediate)
- **Levels 15-28**: Two simultaneous question cards (intermediate → advanced)  
- **Levels 29-42**: Three simultaneous question cards (advanced → expert)

### Card Dataset Integration
**Static Dataset**: `assets/data_science_cards.json` (52 total cards)
- Cards have `progression_level` (1-7) and `difficulty` (beginner/intermediate/advanced)
- No ingestion system - use static dataset only

### Sample Set Mathematics

#### Sample Set Size Progression
```
Sample Set Size = floor(5 + (level - 1) * 1.12)

Level 1: 5 cards
Level 14: 19 cards  
Level 28: 35 cards
Level 42: 52 cards (full dataset)
```

#### Cards Required to Progress
```
Cards to Progress = floor(Sample Set Size * 0.6)

Level 1: 3 correct answers needed
Level 14: 11 correct answers needed
Level 28: 21 correct answers needed  
Level 42: 31 correct answers needed
```

#### Difficulty Selection Algorithm
```
Target Progression Level = min(7, floor(1 + (level - 1) * 0.15))

Levels 1-7: progression_level 1 cards
Levels 8-14: progression_level 2 cards
Levels 15-21: progression_level 3 cards
...
Levels 36-42: progression_level 7 cards
```

### Beta Distribution Card Selection

#### Probability Weighting System
- **New cards**: Higher selection probability (fresh additions to sample set)
- **Mastered cards**: Lower selection probability over time
- **Implementation**: Use beta distribution with α=2, β=5 for older cards

#### Selection Formula
```
P(card) = {
  0.7 : if card is new to sample set
  0.5 * Beta(2,5) : if card partially learned  
  0.2 * Beta(2,5) : if card mastered
}
```

### Speed and Difficulty Progression

#### Falling Speed Increase
```
Target Speed = base_speed + (level - 1) * 0.05

Level 1: 1.0 pixels/frame
Level 21: 2.0 pixels/frame
Level 42: 3.05 pixels/frame
```

#### Simultaneous Questions
- **Levels 1-14**: 1 question card at top
- **Levels 15-28**: 2 question cards at top
- **Levels 29-42**: 3 question cards at top

## Game Systems

### Lives System
- **Starting Lives**: 5
- **Life Loss Conditions**:
  - Correct answer hits bottom boundary
  - Player shoots wrong answer tile
  - Wrong answer tile hits ship directly
- **Life Gain**: +1 life for each level completed
- **Maximum Lives**: 10 (prevents infinite accumulation)
- **Game Over**: When all lives depleted → Show game over screen

### Scoring System
- **Correct Answer**: +100 points
- **No Speed Bonus**: Keep scoring simple
- **No Streak Multiplier**: Focus on learning progression

### Visual Feedback
- **Correct Hit**: Blue particle burst animation (~300ms)
- **Wrong Hit**: Red explosion animation + life loss flash
- **Life Lost**: Screen shake effect + red border flash
- **Life Gained**: Green glow pulse + heart icon animation
- **Ship Collision**: Orange explosion at ship position
- **No Scoreboard Animation**: Keep HUD static

## Technical Requirements

### Core Features
- **Collision Detection**: Between projectiles and hexagonal targets
- **Physics**: Smooth ship movement, projectile trajectories, falling targets
- **Animation**: Particle bursts (blue/red), explosion effects
- **State Management**: Lives, score, level, sample set composition
- **Content Loading**: Static loading from `assets/data_science_cards.json`

### Target Management
- **Smooth Transition**: When question changes, existing targets continue with old answers while new targets spawn with new answers
- **No Instant Clear**: Targets fall naturally or get shot
- **Text Fitting**: All answer text must fit within tile boundaries with no cutoff
- **Auto-sizing**: Font size adjusts to content length with minimum readability threshold
- **Spatial Distribution**: Targets must not overlap during spawn or movement
- **Collision Avoidance**: Smart spawning system prevents target overlap

### Target Spawning System Requirements

#### Staggered Spawn Timing
- **Sequential Spawning**: Targets spawn individually with 800ms delays between each target
- **No Simultaneous Spawn**: Never spawn all targets at once to prevent clustering
- **Randomized Order**: Shuffle answer order before spawning to vary correct answer timing
- **Queue Management**: Use spawn queue system to control timing precisely

#### Spatial Distribution Requirements
- **Minimum Separation**: 120px minimum distance between target centers
- **Boundary Compliance**: All targets must spawn completely within game board boundaries
- **Overlap Detection**: Check for overlaps with existing targets before placement
- **Fallback Grid**: Use grid positioning if random placement fails after 20 attempts
- **Position Validation**: Verify left + width ≤ board width for all targets

#### Target Positioning Algorithm (Enhanced Anti-Overlap System)
```javascript
// Enhanced boundary-safe positioning with increased separation
const minSeparation = 140; // Increased from 100px to 140px
left = Math.random() * (boardWidth - targetWidth - 20) + 10; // 10px margins
top = -targetHeight - Math.random() * 150; // Start above visible board

// Dual overlap detection system
centerDistance = sqrt((x1-x2)² + (y1-y2)²);
validPosition = centerDistance >= minSeparation;

// Additional rectangular bounds check
if (left < existingLeft + targetWidth + 20 &&
    left + targetWidth + 20 > existingLeft &&
    top < existingTop + targetHeight + 20 &&
    top + targetHeight + 20 > existingTop) {
    validPosition = false;
}

// Enhanced fallback grid system
maxColumns = floor((boardWidth - 40) / (targetWidth + 30));
left = gridX * (targetWidth + 30) + 20; // 20px from edges
top = -targetHeight - (gridY * 80); // 80px vertical spacing above board
```

#### Enhanced Anti-Overlap Features
1. **Increased Separation**: Minimum 140px between target centers (up from 100px)
2. **Dual Detection**: Both circular distance and rectangular bounds checking
3. **Improved Margins**: 10px margins from board edges prevent edge clustering
4. **Above-Board Spawning**: Targets spawn above visible area for natural entry
5. **Enhanced Grid Fallback**: Better spacing and positioning when random fails
6. **Extended Attempts**: Up to 50 positioning attempts (increased from 30)

#### Critical Bug Prevention Checks (Enhanced)
1. **Multi-Layer Overlap Prevention**: Circular distance + rectangular bounds checking
2. **Enhanced Boundary Enforcement**: 10px margins prevent edge spawning issues
3. **Improved Timing Control**: 800ms delays with staggered above-board entry
4. **Robust Fallback System**: Grid positioning with 30px spacing between targets
5. **Extended Validation**: More attempts with better positioning algorithms

#### Testing Requirements
- **Position Verification**: Test all targets spawn within game board boundaries
- **Spacing Validation**: Verify no targets are closer than 120px apart
- **Timing Confirmation**: Confirm targets spawn sequentially with proper delays
- **Boundary Testing**: Ensure no targets extend beyond game board edges
- **Overlap Detection**: Validate collision avoidance system works correctly

### Question Card System

#### Question Display Requirements
- **Fixed Position**: Question card positioned at top center of screen
- **Visual Prominence**: Larger text, distinct styling, always visible
- **Dynamic Updates**: Question changes immediately after correct target hit
- **Smooth Transitions**: Fade out old question, fade in new question (300ms)
- **Progress Tracking**: Visual indication of question progression through level

#### Question Update Logic
- **Trigger**: Successful hit on correct answer target
- **Animation**: Smooth transition between questions
- **Data Source**: Selected from current level's card pool via Beta distribution
- **Persistence**: Question remains until correct answer is hit

## CRITICAL: Data Constraints and Testing

### Dataset Requirements
**DISCOVERED ISSUE**: Mathematical progression system can create impossible scenarios

#### Progression Level Filtering
- Level 1: `progression_level <= 1` (Only 1 card in current dataset!)
- Level 7: `progression_level <= 2` 
- Level 14: `progression_level <= 3`
- etc.

#### Data Validation Requirements
Before implementing any card selection system:
1. **Verify sufficient cards exist** for each progression level
2. **Test edge cases** like single-card scenarios
3. **Ensure minimum viable card pools** (recommend 3+ cards per level)
4. **Document data dependencies** clearly

### Testing Methodology Requirements

#### RULE: Real Game Testing First
**NEVER create isolated test components that work differently from the real game**

Testing Priority:
1. **Test actual game** at `http://localhost:8000/` first
2. **Use real game test harness** (`visual_tests/real_game_test.html`)
3. **Only create isolated tests** for debugging specific components
4. **Verify data constraints** before assuming code bugs

#### Test Coverage Requirements
- **Mathematical System**: Verify all formulas with actual dataset
- **Edge Cases**: Test scenarios with minimal data (1-2 cards)
- **Data Compatibility**: Ensure dataset supports all 42 levels
- **Real Game Functionality**: Test actual game, not isolated components

## Practice Mode System

#### Practice Mode Toggle (Start Screen Only)
- **Location**: Start menu overlay only - NOT during gameplay
- **Purpose**: Educational aid for learning new decks
- **Visual Distinction**: 
  - **Practice Mode ON**: Correct answer targets have subtle green glow/border
  - **Practice Mode OFF**: Correct answers look EXACTLY identical to wrong answers (no visual distinction whatsoever)
- **Persistent Setting**: Toggle state remembered between game sessions
- **No Mid-Game Changes**: Once game starts, practice mode cannot be changed until restart

### Performance
- **Frame Rate**: 60 FPS smooth gameplay
- **Responsive**: Works on desktop and mobile devices
- **Memory Efficient**: Proper cleanup of game objects

## User Interface System

### Mobile-First Responsive Layout
- **Mobile Header**: Score, level, lives in compact header bar
- **Desktop Sidebar**: Extended info panel with larger displays
- **Question Area**: 1-3 question cards at top (level-dependent)
- **Dynamic Sizing**: Auto-adjusting to screen dimensions with safe area support

### HUD Elements
- **Lives**: Visual hearts/icons with glow effects (max 10, current count)
- **Score**: Current points with level-based multiplier display
- **Level**: Current level with progress indicator and cards completed
- **Question Headers**: Fixed position with Tron-style neon borders
- **Practice Mode Toggle**: Visual switch with on/off states and glow effects
- **Scoreboard Layout**: Organized display showing all critical game stats

### Scoreboard System Requirements
- **Mobile Layout**: Compact header with essential info (lives, score, level)
- **Desktop Layout**: Extended sidebar with detailed stats and practice toggle
- **Real-time Updates**: Immediate visual feedback for all stat changes
- **Visual Hierarchy**: Clear importance ordering (lives > score > level > progress)
- **Accessibility**: High contrast, readable fonts, touch-friendly controls

### Game State Overlays

#### Start Menu Overlay
```html
<div class="game-overlay active" id="menuOverlay">
    <h1 class="overlay-title menu-title">Card Blaster</h1>
    <p class="overlay-subtitle">Learn Through Action</p>
    
    <!-- Deck Selection (ONLY in start screen) -->
    <div class="deck-selector">
        <label for="deckSelect" class="deck-label">Select Learning Deck:</label>
        <select id="deckSelect" class="deck-dropdown">
            <option value="data_science_cards.json">Data Science Fundamentals</option>
            <option value="chinese_language_cards.json">Chinese Language Basics</option>
        </select>
    </div>
    
    <!-- Practice Mode Toggle (ONLY in start screen) -->
    <div class="practice-mode-container">
        <label class="practice-toggle">
            <input type="checkbox" id="practiceMode" />
            <span class="practice-slider"></span>
            <span class="practice-label">Practice Mode (Highlight Correct Answers)</span>
        </label>
    </div>
    
    <div class="controls-container">
        <!-- Mobile Controls Section -->
        <div class="control-section mobile-controls">
            <div class="control-title">Touch Controls</div>
            <div class="control-item">
                <span class="control-key">Left Zone Tap</span> → Move ship left
            </div>
            <div class="control-item">
                <span class="control-key">Right Zone Tap</span> → Move ship right
            </div>
            <div class="control-item">
                <span class="control-key">Game Board Tap</span> → Fire projectiles
            </div>
            <div class="control-item">
                <span class="control-key">Scoreboard Tap</span> → Pause/Resume
            </div>
        </div>
        
        <!-- Desktop Controls Section -->
        <div class="control-section desktop-controls">
            <div class="control-title">Keyboard Controls</div>
            <div class="control-item">
                <span class="control-key">← →</span> or <span class="control-key">A D</span> → Move ship
            </div>
            <div class="control-item">
                <span class="control-key">SPACE</span> → Fire projectiles
            </div>
            <div class="control-item">
                <span class="control-key">P</span> → Pause &nbsp;&nbsp; <span class="control-key">R</span> → Restart
            </div>
        </div>
    </div>
    
    <button class="start-button" id="startButton">Start Learning</button>
</div>
```

#### Pause Overlay
```html
<div class="game-overlay" id="pauseOverlay">
    <h1 class="overlay-title pause-title">Game Paused</h1>
    <div class="pause-stats">
        <p class="overlay-text score-text">Current Score: <span id="pauseScore">0</span></p>
        <p class="overlay-text level-text">Level: <span id="pauseLevel">1</span></p>
        <p class="overlay-text progress-text">Cards Mastered: <span id="pauseProgress">0</span></p>
    </div>
    <p class="overlay-text desktop-only">Press P to resume</p>
    <p class="overlay-text mobile-only">Tap anywhere to resume</p>
</div>
```

#### Game Over Overlay
```html
<div class="game-overlay" id="gameOverOverlay">
    <h1 class="overlay-title gameover-title">Learning Complete</h1>
    <div class="game-over-stats">
        <p class="overlay-text score-text">Final Score: <span id="finalScore">0</span></p>
        <p class="overlay-text level-text">Level Reached: <span id="finalLevel">1</span></p>
        <p class="overlay-text cards-text">Cards Mastered: <span id="finalCards">0</span></p>
        <p class="overlay-text accuracy-text">Accuracy: <span id="finalAccuracy">0%</span></p>
    </div>
    <button class="start-button" id="restartButton">Play Again</button>
</div>
```

### Level Progression Animation System

#### Level Up Animation
```css
/* Level up flash animation */
@keyframes levelUpFlash {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
}

/* Level up text animation */
@keyframes levelUpText {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }
    20% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.2);
    }
    40% {
        transform: translate(-50%, -50%) scale(1);
    }
    80% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
    }
}
```

#### Level Progression Sequence
1. **Background Flash**: Cyan glow overlay with radial gradient
2. **Level Text**: "LEVEL X" appears with scale animation
3. **Progress Info**: "NEW CARDS UNLOCKED" or "DIFFICULTY INCREASED"
4. **Life Bonus**: "+1 LIFE GAINED" with green heart animation
5. **Haptic Feedback**: Mobile vibration pattern [100, 50, 100]
6. **Duration**: 2.5 seconds total

#### Question Transition Animation
```css
/* Question change animation */
@keyframes questionFadeOut {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.9); }
}

@keyframes questionFadeIn {
    0% { opacity: 0; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
}
```

### Hit Animation System

#### Correct Hit Animation (Blue Particle Burst)
```css
@keyframes correctHitBurst {
    0% {
        opacity: 1;
        transform: scale(1);
        box-shadow: 0 0 10px #00ffff;
    }
    50% {
        opacity: 0.8;
        transform: scale(1.5);
        box-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff;
    }
    100% {
        opacity: 0;
        transform: scale(2);
        box-shadow: 0 0 50px #00ffff, 0 0 100px #00ffff;
    }
}
```

#### Incorrect Hit Animation (Red Explosion)
```css
@keyframes incorrectHitExplosion {
    0% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
        box-shadow: 0 0 10px #ff0000;
    }
    50% {
        opacity: 0.6;
        transform: scale(1.3) rotate(180deg);
        box-shadow: 0 0 25px #ff0000, 0 0 50px #ff0000;
    }
    100% {
        opacity: 0;
        transform: scale(0.5) rotate(360deg);
        box-shadow: 0 0 40px #ff0000, 0 0 80px #ff0000;
    }
}
```

#### Life System Animations

##### Life Lost Animation (Red Border Flash)
```css
@keyframes lifeLostFlash {
    0% {
        border-color: transparent;
        box-shadow: none;
    }
    25% {
        border-color: #ff0000;
        box-shadow: 0 0 20px #ff0000, inset 0 0 20px rgba(255, 0, 0, 0.3);
    }
    75% {
        border-color: #ff0000;
        box-shadow: 0 0 30px #ff0000, inset 0 0 30px rgba(255, 0, 0, 0.3);
    }
    100% {
        border-color: transparent;
        box-shadow: none;
    }
}
```

##### Life Gained Animation (Green Heart Pulse)
```css
@keyframes lifeGainedPulse {
    0% {
        opacity: 0;
        transform: scale(0.5);
        color: #00ff00;
        text-shadow: 0 0 10px #00ff00;
    }
    50% {
        opacity: 1;
        transform: scale(1.3);
        color: #00ff00;
        text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;
    }
    100% {
        opacity: 1;
        transform: scale(1);
        color: #00ff00;
        text-shadow: 0 0 10px #00ff00;
    }
}
```

##### Ship Collision Animation (Orange Explosion)
```css
@keyframes shipCollisionExplosion {
    0% {
        opacity: 1;
        transform: scale(1);
        box-shadow: 0 0 15px #ff6600;
        background: rgba(255, 102, 0, 0.3);
    }
    30% {
        opacity: 0.8;
        transform: scale(1.5);
        box-shadow: 0 0 30px #ff6600, 0 0 60px #ff6600;
        background: rgba(255, 102, 0, 0.6);
    }
    70% {
        opacity: 0.4;
        transform: scale(2);
        box-shadow: 0 0 50px #ff6600, 0 0 100px #ff6600;
        background: rgba(255, 102, 0, 0.3);
    }
    100% {
        opacity: 0;
        transform: scale(2.5);
        box-shadow: 0 0 80px #ff6600, 0 0 160px #ff6600;
        background: transparent;
    }
}
```

### Responsive Design System

#### Mobile-First Breakpoints
```css
/* Mobile (320px-767px) */
@media (max-width: 767px) {
    .game-header { display: flex; }
    .game-info { display: none; }
    .mobile-controls { display: block; }
    .desktop-controls { display: none; }
}

/* Desktop (768px+) */
@media (min-width: 768px) {
    .game-header { display: none; }
    .game-info { display: flex; }
    .mobile-controls { display: none; }
    .desktop-controls { display: block; }
}
```

#### Safe Area Handling
```css
body {
    padding-bottom: env(safe-area-inset-bottom);
    height: 100dvh; /* Dynamic viewport height for mobile */
}
```

### Control Interaction System

#### Mobile Touch Controls
- **Ship Movement**: Touch and drag in ship area
- **Shooting**: Tap anywhere on screen
- **Pause/Resume**: Long press on score area
- **Zone Feedback**: Visual ripple effects at touch points

#### Desktop Keyboard Controls
- **Movement**: Arrow keys (←→) or A/D keys
- **Shooting**: Spacebar
- **Pause**: P key
- **Restart**: R key

#### Unified Input Handling
```javascript
function handleUnifiedInput(inputType, action) {
    switch(action) {
        case 'move_left':
            moveShip(-1);
            showInputFeedback('left');
            break;
        case 'move_right':
            moveShip(1);
            showInputFeedback('right');
            break;
        case 'shoot':
            fireProjectile();
            showInputFeedback('shoot');
            break;
        case 'pause':
            togglePause();
            showInputFeedback('pause');
            break;
    }
}
```

### Visual Feedback System

#### Input Feedback
- **Touch Feedback**: Cyan ripple at touch point
- **Key Feedback**: Brief highlight of pressed key
- **Action Feedback**: Visual confirmation of game action

#### Performance Monitoring
- **60 FPS Target**: Maintained across all devices
- **Memory Management**: Efficient cleanup of visual effects
- **Battery Optimization**: Reduced animations when battery low

## Level Progression Example

### Level 1 Example
- **Sample Set**: 5 cards (progression_level 1, beginner difficulty)
- **Questions**: 1 simultaneous question
- **Target Speed**: 1.0 pixels/frame
- **To Progress**: Get 3 cards correct
- **Card Selection**: New cards have 70% selection probability

### Level 15 Example  
- **Sample Set**: 19 cards (progression_level 3, intermediate difficulty)
- **Questions**: 2 simultaneous questions
- **Target Speed**: 1.7 pixels/frame
- **To Progress**: Get 11 cards correct
- **Card Selection**: Mastered cards have reduced probability

### Level 42 Example
- **Sample Set**: 52 cards (full dataset, progression_level 7)
- **Questions**: 3 simultaneous questions  
- **Target Speed**: 3.05 pixels/frame
- **To Progress**: Get 31 cards correct (game completion)
- **Card Selection**: All cards available with mastery-based weighting

## Success Metrics
- **Learning Effectiveness**: Progressive difficulty ensures gradual skill building
- **Engagement**: Mathematical progression provides clear advancement goals
- **Skill Development**: Balances memorization with hand-eye coordination
- **Completion**: 42 levels provide substantial learning journey through full dataset

## Enhanced Game Over System

### Game Over Screen Features
- **Comprehensive Stats Display**: Final score, level reached, and lives lost indication
- **Multiple Restart Options**: 
  - **Restart Current Level**: Keep progress, restart at same level with appropriate lives
  - **Restart From Beginning**: Complete reset, return to Level 1
  - **Back to Menu**: Return to start screen for deck/level selection
- **Visual Polish**: Tron-themed buttons with color coding (cyan/orange/gray)

### Restart Current Level Logic
- **Lives Reset**: Starting lives (5) + level bonus - 1, maximum 10 lives
- **Score Reset**: Score returns to 0 but level progress maintained
- **Card Progress Preserved**: Learned cards and progression states remain
- **Level Maintained**: Player continues from their current level

### Restart From Beginning Logic
- **Complete Reset**: All game state returns to initial values
- **Level 1 Start**: Game begins at Level 1 regardless of previous progress
- **Card Learning Reset**: All card states and learned cards cleared
- **Standard Lives**: 5 lives as initial game start

## Level Selection System

### Dynamic Level Selection Based on Deck Metadata
- **Automatic Discovery**: Level options populate dynamically based on selected deck's `available_levels` metadata
- **Deck-Specific Levels**: Each deck defines its own progression levels and maximum level
- **Adaptive Interface**: Level dropdown updates when deck selection changes
- **Metadata Integration**: Uses `max_level` and `available_levels` from deck JSON metadata

### Available Deck Examples
**Data Science Fundamentals**: 2 levels (1-2)
- Level 1: Beginner (1 Question)
- Level 2: Basic (1 Question)

**Data Science Advanced**: 10 levels (1-10)
- Level 1: Beginner (1 Question)
- Levels 2-3: Basic (1 Question)
- Levels 4-6: Intermediate (1-2 Questions)
- Levels 7-8: Advanced (2 Questions)
- Levels 9-10: Expert (2-3 Questions)

**Chinese Language Basics**: 3 levels (1-3)
- Level 1: Beginner (1 Question)
- Level 2: Basic (1 Question)
- Level 3: Intermediate (1 Question)

### Dynamic Level Labeling
- **Descriptive Names**: Automatically generated based on level relative to deck maximum
  - Level 1: Always "Beginner"
  - 1-30% of max: "Basic"
  - 31-60% of max: "Intermediate"  
  - 61-80% of max: "Advanced"
  - 81%+ of max: "Expert"
- **Question Count Indicators**: Shows expected simultaneous questions based on level
  - Levels 1-14: "(1 Question)"
  - Levels 15-28: "(2 Questions)"
  - Levels 29+: "(3 Questions)"

### Deck Discovery System
- **Automatic Detection**: Scans `assets/` directory for `*_cards.json` files
- **Metadata Validation**: Verifies deck structure and metadata completeness
- **Fallback Support**: Provides default options if discovery fails
- **Live Updates**: Deck and level dropdowns populate on game load

### Level Selection Integration
- **Smart Initialization**: First available level selected by default
- **Persistent Choice**: Selected level maintained until restart from beginning
- **Card Pool Access**: Higher starting levels access appropriate progression level cards
- **Difficulty Scaling**: Appropriate target speed and question count for selected level
- **Deck Compatibility**: Level selection respects each deck's unique structure

---

*This specification focuses on core game mechanics with static dataset integration, clear mathematical progression, and smooth gameplay transitions.*