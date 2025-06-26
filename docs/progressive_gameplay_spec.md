# Progressive Gameplay Specification
## Card Blaster Enhanced Learning System

### Overview
Card Blaster will be enhanced with progressive learning mechanics, multi-deck support, and adaptive difficulty. Players select from available card decks, choose starting difficulty levels, and progress through increasingly challenging content with a sophisticated card mastery system.

## Core Game Mechanics

### Scoring & Lives System
- **Starting Lives**: 5 lives per game session
- **Scoring**: +100 points per correct answer only
- **Life Loss Conditions**:
  - -1 life for incorrect answer (shooting wrong target)
  - -1 life for correct answer hitting bottom of board (missed opportunity)
- **Life Gain**: +1 life for every 1000 points earned
- **Maximum Lives**: No cap specified (can exceed 5)

### Card Learning State Machine
Each card progresses through distinct learning states:

#### State 1: New Card
- **Initial State**: Never seen before
- **Correct Answer**: Card becomes "Learned" → removed from rotation
- **Incorrect Answer**: Card becomes "Struggling" → requires remediation

#### State 2: Struggling Card  
- **Requirement**: Must get 2 consecutive correct answers to become "Learned"
- **Correct Answer**: Increment consecutive counter (1/2 → 2/2 → Learned)
- **Incorrect Answer**: Reset consecutive counter to 0, remains "Struggling"
- **Persistence**: Continues appearing until mastered

#### State 3: Learned Card
- **Status**: Permanently removed from game rotation
- **Replacement**: Triggers addition of next available card from higher progression level

## Level Progression System

### Level Advancement Rules
- **Progression Trigger**: ALL cards in current level must be mastered
- **Level Transition**: Unlock all cards from next progression level
- **Starting Level**: Player-selectable (1 through max available in deck)
- **Skip Behavior**: Starting at higher levels skips lower level content entirely

### Card Pool Management
- **Active Pool**: All cards from current progression level
- **Replacement Logic**: Each learned card immediately replaced by next-level card (if available)
- **End Condition**: Game victory when all cards in all levels are mastered

## Deck Selection System

### Deck Discovery
- **File Pattern**: Scan `/assets` directory for files ending in `_cards.json`
- **Auto-Population**: Dynamically build deck selection dropdown
- **Metadata Required**: Each deck must include metadata section

### Deck Metadata Structure
```json
{
  "metadata": {
    "deck_name": "Data Science Fundamentals",
    "description": "Core concepts in data science and machine learning", 
    "total_cards": 10,
    "available_levels": [1, 2],
    "max_level": 2,
    "category": "Technology",
    "difficulty_range": "Beginner to Intermediate"
  },
  "cards": [
    // existing card array structure
  ]
}
```

### Initial Deck Support
- **Data Science**: `data_science_cards.json` (Levels 1-2)
- **Chinese Language**: `chinese_language_cards.json` (Levels 1-7)
- **Extensible**: Additional decks can be added by dropping files in assets

## User Interface Enhancements

### Start Screen Additions
- **Deck Selection**: Dropdown menu populated from available `_cards.json` files
- **Starting Difficulty**: Dropdown with "Level 1", "Level 2", etc. up to deck's max_level
- **Practice Mode Toggle**: Existing highlight correct answers feature (retained)

### Level Completion Animation
- **Inspiration**: Use satisfying animations from `tetris_index.html`
- **Trigger**: When all cards in a progression level are mastered
- **Content**: 
  - "LEVEL X COMPLETE!" text with glow effects
  - Cards learned count
  - Next level preview
  - Particle effects/screen flash

### End Game Screens

#### Game Over (0 Lives)
- **Trigger**: Lives reach 0
- **Display**:
  - Final score
  - Cards learned this session
  - Accuracy rate (correct/total attempts)
  - Time played
  - Progression level reached
- **Options**: Return to deck selection screen

#### Victory (All Cards Mastered)
- **Trigger**: All cards in all levels mastered
- **Display**:
  - Victory celebration animation
  - Final score
  - Total cards mastered
  - Overall accuracy rate
  - Total time to completion
  - Deck completion badge/achievement
- **Options**: Return to deck selection screen

## Session Statistics Tracking

### Real-Time Stats
- **Cards Learned**: Count of cards moved to "Learned" state
- **Accuracy Rate**: Percentage of correct answers (correct shots / total shots)
- **Current Streak**: Consecutive correct answers
- **Level Progress**: X/Y cards mastered in current level

### Session Summary Stats
- **Total Attempts**: All shots fired
- **Correct Answers**: Successful hits on correct targets
- **Wrong Answers**: Hits on incorrect targets  
- **Missed Opportunities**: Correct targets that hit bottom
- **Time Played**: Session duration
- **Peak Lives**: Maximum lives reached during session
- **Levels Completed**: Number of progression levels cleared

## Technical Implementation Notes

### State Management
- **Stateless Design**: No server-side persistence required
- **Session-Based**: All progress reset between game sessions
- **Card States**: Track per-card learning state in memory
- **Deck Loading**: Dynamic loading based on user selection

### Performance Considerations
- **Lazy Loading**: Load selected deck only when game starts
- **Memory Management**: Clean up previous deck data when switching
- **Animation Performance**: Ensure 60fps during level completion effects

### Error Handling
- **Missing Decks**: Graceful fallback if deck files missing/corrupted
- **Invalid Metadata**: Validation and user-friendly error messages
- **Level Boundaries**: Handle edge cases when no higher levels available

## Future Extensibility

### Potential Enhancements
- **Custom Decks**: User-uploadable card decks
- **Difficulty Modifiers**: Speed multipliers, life modifiers
- **Achievement System**: Badges for various accomplishments
- **Leaderboards**: High scores per deck (local storage)
- **Study Mode**: Review learned cards without gameplay

### Data Structure Flexibility
- **Metadata Evolution**: Additional fields can be added to deck metadata
- **Card Properties**: Support for images, audio, hints, explanations
- **Localization**: Multi-language support through metadata
- **Categories**: Nested categorization for large deck collections

---

*This specification provides the foundation for implementing a robust, extensible progressive learning system that maintains the core arcade gameplay while adding meaningful educational progression mechanics.*
