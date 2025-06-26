/**
 * Flashcard Reader - Mobile-First Learning Engine
 * Features: Dynamic deck discovery, progressive learning, timer system, unified input
 */

class FlashcardEngine {
    constructor() {
        // Game State
        this.currentDeck = null;
        this.currentLevel = 1;
        this.currentCard = null;
        this.currentQuestion = null;
        this.correctAnswerIndex = -1;
        this.availableCards = [];
        this.cardStates = new Map(); // Track card learning progress
        this.gameStats = this.initializeStats();
        
        // Timer System
        this.timerDuration = 0; // seconds, 0 = no timer
        this.timerInterval = null;
        this.timeRemaining = 0;
        
        // UI Elements
        this.elements = {};
        this.overlays = {};
        
        // Initialize
        this.initializeElements();
        this.initializeEventListeners();
        this.discoverDecks();
    }

    initializeStats() {
        return {
            score: 0,
            lives: 5,
            streak: 0,
            longestStreak: 0,
            totalAttempts: 0,
            correctAnswers: 0,
            sessionStartTime: Date.now(),
            cardsInCurrentLevel: 0,
            cardsMastered: 0,
            levelStartTime: Date.now()
        };
    }

    initializeElements() {
        // Main UI Elements
        this.elements = {
            // Overlays
            startOverlay: document.getElementById('startOverlay'),
            gameContainer: document.getElementById('gameContainer'),
            levelCompleteOverlay: document.getElementById('levelCompleteOverlay'),
            gameOverOverlay: document.getElementById('gameOverOverlay'),
            victoryOverlay: document.getElementById('victoryOverlay'),
            
            // Dropdowns
            deckSelect: document.getElementById('deckSelect'),
            levelSelect: document.getElementById('levelSelect'),
            timerSelect: document.getElementById('timerSelect'),
            
            // Game Elements
            questionText: document.getElementById('questionText'),
            questionCard: document.getElementById('questionCard'),
            answersGrid: document.getElementById('answersGrid'),
            
            // Answer Buttons
            answer0: document.getElementById('answer0'),
            answer1: document.getElementById('answer1'),
            answer2: document.getElementById('answer2'),
            answer3: document.getElementById('answer3'),
            
            // Stats Display
            heartsContainer: document.getElementById('heartsContainer'),
            currentScore: document.getElementById('currentScore'),
            currentStreak: document.getElementById('currentStreak'),
            currentLevel: document.getElementById('currentLevel'),
            cardProgress: document.getElementById('cardProgress'),
            currentAccuracy: document.getElementById('currentAccuracy'),
            levelProgress: document.getElementById('levelProgress'),
            
            // Buttons
            startLearning: document.getElementById('startLearning'),
            restartLevel: document.getElementById('restartLevel'),
            restartGame: document.getElementById('restartGame'),
            backToMenu: document.getElementById('backToMenu'),
            selectNewDeck: document.getElementById('selectNewDeck')
        };

        // Answer buttons array for easy access
        this.answerButtons = [
            this.elements.answer0,
            this.elements.answer1,
            this.elements.answer2,
            this.elements.answer3
        ];
    }

    initializeEventListeners() {
        // Start Game
        this.elements.startLearning.addEventListener('click', () => this.startGame());
        
        // Answer Selection - Unified Input Handling
        this.answerButtons.forEach((button, index) => {
            // Touch/Mouse Events
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectAnswer(index);
            });
            
            // Touch Feedback
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.classList.add('touch-feedback');
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('touch-feedback');
            });
            
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                button.classList.remove('touch-feedback');
            });
        });

        // Keyboard Controls (Desktop Enhancement)
        document.addEventListener('keydown', (e) => {
            if (this.elements.gameContainer.style.display !== 'none') {
                const key = e.key;
                if (key >= '1' && key <= '4') {
                    e.preventDefault();
                    this.selectAnswer(parseInt(key) - 1);
                }
            }
        });

        // Restart/Menu Buttons
        this.elements.restartLevel.addEventListener('click', () => this.restartLevel());
        this.elements.restartGame.addEventListener('click', () => this.restartGame());
        this.elements.backToMenu.addEventListener('click', () => this.backToMenu());
        this.elements.selectNewDeck.addEventListener('click', () => this.backToMenu());

        // Deck Selection Change
        this.elements.deckSelect.addEventListener('change', () => this.updateLevelOptions());
    }

    async discoverDecks() {
        try {
            // Discover all *_cards.json files in assets/ directory
            const deckFiles = [
                'data_science_cards.json'
                // Add more deck files as they're created
            ];

            const deckOptions = [];
            
            for (const filename of deckFiles) {
                try {
                    const response = await fetch(`assets/${filename}`);
                    if (response.ok) {
                        const deck = await response.json();
                        if (this.validateDeckStructure(deck)) {
                            deckOptions.push({
                                filename: filename,
                                metadata: deck.metadata,
                                deck: deck
                            });
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to load deck ${filename}:`, error);
                }
            }

            this.populateDeckDropdown(deckOptions);
            
        } catch (error) {
            console.error('Deck discovery failed:', error);
            this.elements.deckSelect.innerHTML = '<option value="">No decks available</option>';
        }
    }

    validateDeckStructure(deck) {
        return deck &&
               deck.metadata &&
               deck.metadata.deck_name &&
               deck.metadata.max_level &&
               deck.metadata.available_levels &&
               Array.isArray(deck.cards) &&
               deck.cards.length > 0;
    }

    populateDeckDropdown(deckOptions) {
        this.elements.deckSelect.innerHTML = '';
        
        if (deckOptions.length === 0) {
            this.elements.deckSelect.innerHTML = '<option value="">No valid decks found</option>';
            return;
        }

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a deck...';
        this.elements.deckSelect.appendChild(defaultOption);

        // Add deck options
        deckOptions.forEach((deckOption, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${deckOption.metadata.deck_name} (${deckOption.metadata.card_count} cards)`;
            option.dataset.deck = JSON.stringify(deckOption.deck);
            this.elements.deckSelect.appendChild(option);
        });

        // Auto-select first deck if only one available
        if (deckOptions.length === 1) {
            this.elements.deckSelect.selectedIndex = 1;
            this.updateLevelOptions();
        }
    }

    updateLevelOptions() {
        const selectedOption = this.elements.deckSelect.selectedOptions[0];
        if (!selectedOption || !selectedOption.dataset.deck) {
            this.elements.levelSelect.innerHTML = '<option value="1">Level 1</option>';
            return;
        }

        const deck = JSON.parse(selectedOption.dataset.deck);
        const availableLevels = deck.metadata.available_levels || [1];
        
        this.elements.levelSelect.innerHTML = '';
        availableLevels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = `Level ${level}`;
            this.elements.levelSelect.appendChild(option);
        });
    }

    startGame() {
        const selectedDeckOption = this.elements.deckSelect.selectedOptions[0];
        if (!selectedDeckOption || !selectedDeckOption.dataset.deck) {
            alert('Please select a deck first!');
            return;
        }

        // Load selected deck
        this.currentDeck = JSON.parse(selectedDeckOption.dataset.deck);
        this.currentLevel = parseInt(this.elements.levelSelect.value) || 1;
        this.timerDuration = this.elements.timerSelect.value === 'none' ? 0 : parseInt(this.elements.timerSelect.value);

        // Initialize game state
        this.gameStats = this.initializeStats();
        this.cardStates.clear();
        this.loadLevelCards();
        
        // Show game container
        this.elements.startOverlay.classList.remove('active');
        this.elements.gameContainer.style.display = 'flex';
        
        // Start first question
        this.nextQuestion();
        this.updateUI();
    }

    loadLevelCards() {
        // Get cards for current level
        this.availableCards = this.currentDeck.cards.filter(card => 
            card.progression_level === this.currentLevel
        );

        // Initialize card states
        this.availableCards.forEach(card => {
            if (!this.cardStates.has(card.id)) {
                this.cardStates.set(card.id, {
                    state: 'new', // new, struggling, learned
                    consecutiveCorrect: 0,
                    attempts: 0,
                    correctCount: 0
                });
            }
        });

        this.gameStats.cardsInCurrentLevel = this.availableCards.length;
        this.gameStats.levelStartTime = Date.now();
    }

    getRandomCard() {
        // Get cards that aren't mastered yet
        const activeCards = this.availableCards.filter(card => {
            const state = this.cardStates.get(card.id);
            return state.state !== 'learned';
        });

        if (activeCards.length === 0) {
            return null; // Level complete
        }

        // Simple random selection
        return activeCards[Math.floor(Math.random() * activeCards.length)];
    }

    nextQuestion() {
        this.currentCard = this.getRandomCard();
        
        if (!this.currentCard) {
            this.levelComplete();
            return;
        }

        // Setup question
        this.elements.questionText.textContent = this.currentCard.definition;
        
        // Create answer options (correct + wrong answers)
        const allAnswers = [this.currentCard.term, ...this.currentCard.wrong_answers];
        
        // Shuffle answers
        const shuffledAnswers = this.shuffleArray([...allAnswers]);
        this.correctAnswerIndex = shuffledAnswers.indexOf(this.currentCard.term);
        
        // Update answer buttons
        this.answerButtons.forEach((button, index) => {
            const answerText = button.querySelector('.answer-text');
            answerText.textContent = shuffledAnswers[index] || '';
            
            // Reset button state
            button.classList.remove('correct', 'wrong', 'timer-blink');
            button.disabled = false;
        });

        // Start timer if enabled
        if (this.timerDuration > 0) {
            this.startTimer();
        }

        // Clear previous timer effects
        this.elements.questionCard.classList.remove('timer-active', 'timer-warning', 'timer-critical');
    }

    startTimer() {
        this.timeRemaining = this.timerDuration;
        this.elements.questionCard.classList.add('timer-active');
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerEffects();
            
            if (this.timeRemaining <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    updateTimerEffects() {
        const percentage = this.timeRemaining / this.timerDuration;
        
        // Timer border effects
        if (percentage <= 0.2) {
            this.elements.questionCard.classList.add('timer-critical');
            this.elements.questionCard.classList.remove('timer-warning', 'timer-active');
        } else if (percentage <= 0.5) {
            this.elements.questionCard.classList.add('timer-warning');
            this.elements.questionCard.classList.remove('timer-critical', 'timer-active');
            
            // Start answer blinking at 50% time remaining
            this.answerButtons.forEach(button => {
                button.classList.add('timer-blink');
            });
        }
    }

    handleTimeout() {
        this.clearTimer();
        
        // Show timeout effect
        this.elements.answersGrid.classList.add('timeout');
        
        // Lose a life
        this.gameStats.lives--;
        this.gameStats.totalAttempts++;
        this.gameStats.streak = 0;
        
        // Update card state (timeout counts as wrong)
        const cardState = this.cardStates.get(this.currentCard.id);
        cardState.attempts++;
        cardState.consecutiveCorrect = 0;
        if (cardState.state === 'new') {
            cardState.state = 'struggling';
        }
        
        setTimeout(() => {
            this.elements.answersGrid.classList.remove('timeout');
            
            if (this.gameStats.lives <= 0) {
                this.gameOver();
            } else {
                this.nextQuestion();
                this.updateUI();
            }
        }, 1500);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.elements.questionCard.classList.remove('timer-active', 'timer-warning', 'timer-critical');
        this.answerButtons.forEach(button => {
            button.classList.remove('timer-blink');
        });
    }

    selectAnswer(answerIndex) {
        if (this.answerButtons[answerIndex].disabled) return;
        
        this.clearTimer();
        
        // Disable all buttons
        this.answerButtons.forEach(button => {
            button.disabled = true;
        });

        const isCorrect = answerIndex === this.correctAnswerIndex;
        const selectedButton = this.answerButtons[answerIndex];
        const correctButton = this.answerButtons[this.correctAnswerIndex];

        // Update game stats
        this.gameStats.totalAttempts++;
        
        if (isCorrect) {
            this.handleCorrectAnswer(selectedButton);
        } else {
            this.handleWrongAnswer(selectedButton, correctButton);
        }
    }

    handleCorrectAnswer(button) {
        button.classList.add('correct');
        
        // Update stats
        this.gameStats.score += 100;
        this.gameStats.correctAnswers++;
        this.gameStats.streak++;
        this.gameStats.longestStreak = Math.max(this.gameStats.longestStreak, this.gameStats.streak);
        
        // Speed bonus if timer was active
        if (this.timerDuration > 0 && this.timeRemaining > 0) {
            const speedBonus = Math.floor((this.timeRemaining / this.timerDuration) * 50);
            this.gameStats.score += speedBonus;
        }

        // Gain life every 1000 points (max 10)
        if (this.gameStats.score > 0 && this.gameStats.score % 1000 === 0) {
            this.gameStats.lives = Math.min(10, this.gameStats.lives + 1);
        }

        // Update card state
        const cardState = this.cardStates.get(this.currentCard.id);
        cardState.attempts++;
        cardState.correctCount++;
        cardState.consecutiveCorrect++;

        // Check if card is mastered
        if (cardState.state === 'new' && cardState.consecutiveCorrect >= 1) {
            cardState.state = 'learned';
            this.gameStats.cardsMastered++;
        } else if (cardState.state === 'struggling' && cardState.consecutiveCorrect >= 2) {
            cardState.state = 'learned';
            this.gameStats.cardsMastered++;
        }

        setTimeout(() => {
            this.nextQuestion();
            this.updateUI();
        }, 1000);
    }

    handleWrongAnswer(selectedButton, correctButton) {
        selectedButton.classList.add('wrong');
        correctButton.classList.add('correct');
        
        // Update stats
        this.gameStats.lives--;
        this.gameStats.streak = 0;
        
        // Update card state
        const cardState = this.cardStates.get(this.currentCard.id);
        cardState.attempts++;
        cardState.consecutiveCorrect = 0;
        if (cardState.state === 'new') {
            cardState.state = 'struggling';
        }

        setTimeout(() => {
            if (this.gameStats.lives <= 0) {
                this.gameOver();
            } else {
                this.nextQuestion();
                this.updateUI();
            }
        }, 1500);
    }

    levelComplete() {
        // Check if all cards in current level are mastered
        const allMastered = this.availableCards.every(card => {
            const state = this.cardStates.get(card.id);
            return state.state === 'learned';
        });

        if (allMastered) {
            this.showLevelComplete();
        } else {
            // Continue with remaining cards
            this.nextQuestion();
        }
    }

    showLevelComplete() {
        this.elements.gameContainer.style.display = 'none';
        
        // Update level complete stats
        document.getElementById('completedLevel').textContent = this.currentLevel;
        document.getElementById('levelCards').textContent = this.gameStats.cardsMastered;
        
        const accuracy = this.gameStats.totalAttempts > 0 ? 
            Math.round((this.gameStats.correctAnswers / this.gameStats.totalAttempts) * 100) : 0;
        document.getElementById('levelAccuracy').textContent = accuracy + '%';
        
        const levelTime = Math.floor((Date.now() - this.gameStats.levelStartTime) / 1000);
        document.getElementById('levelTime').textContent = this.formatTime(levelTime);
        
        // Check if more levels available
        const nextLevel = this.currentLevel + 1;
        const hasNextLevel = this.currentDeck.metadata.available_levels.includes(nextLevel);
        
        if (hasNextLevel) {
            document.getElementById('nextLevel').textContent = nextLevel;
            this.elements.levelCompleteOverlay.classList.add('active');
            
            // Auto-advance after animation
            setTimeout(() => {
                this.advanceToNextLevel();
            }, 3000);
        } else {
            this.victory();
        }
    }

    advanceToNextLevel() {
        this.currentLevel++;
        this.elements.levelCompleteOverlay.classList.remove('active');
        this.loadLevelCards();
        this.elements.gameContainer.style.display = 'flex';
        this.nextQuestion();
        this.updateUI();
    }

    gameOver() {
        this.elements.gameContainer.style.display = 'none';
        
        // Update final stats
        document.getElementById('finalScore').textContent = this.gameStats.score;
        document.getElementById('finalLevel').textContent = this.currentLevel;
        document.getElementById('finalCards').textContent = this.gameStats.cardsMastered;
        
        const accuracy = this.gameStats.totalAttempts > 0 ? 
            Math.round((this.gameStats.correctAnswers / this.gameStats.totalAttempts) * 100) : 0;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        
        const sessionTime = Math.floor((Date.now() - this.gameStats.sessionStartTime) / 1000);
        document.getElementById('sessionTime').textContent = this.formatTime(sessionTime);
        document.getElementById('totalAttempts').textContent = this.gameStats.totalAttempts;
        document.getElementById('longestStreak').textContent = this.gameStats.longestStreak;
        
        this.elements.gameOverOverlay.classList.add('active');
    }

    victory() {
        this.elements.gameContainer.style.display = 'none';
        
        // Update victory stats
        document.getElementById('victoryScore').textContent = this.gameStats.score;
        document.getElementById('totalCards').textContent = this.currentDeck.metadata.card_count;
        
        const accuracy = this.gameStats.totalAttempts > 0 ? 
            Math.round((this.gameStats.correctAnswers / this.gameStats.totalAttempts) * 100) : 0;
        document.getElementById('victoryAccuracy').textContent = accuracy + '%';
        
        const completionTime = Math.floor((Date.now() - this.gameStats.sessionStartTime) / 1000);
        document.getElementById('completionTime').textContent = this.formatTime(completionTime);
        
        this.elements.victoryOverlay.classList.add('active');
    }

    updateUI() {
        // Update hearts display
        const hearts = '❤️'.repeat(this.gameStats.lives) + '🖤'.repeat(Math.max(0, 5 - this.gameStats.lives));
        this.elements.heartsContainer.textContent = hearts;
        
        // Update score and streak
        this.elements.currentScore.textContent = this.gameStats.score;
        this.elements.currentStreak.textContent = this.gameStats.streak;
        this.elements.currentLevel.textContent = this.currentLevel;
        
        // Update progress
        this.elements.cardProgress.textContent = `${this.gameStats.cardsMastered}/${this.gameStats.cardsInCurrentLevel}`;
        
        // Update accuracy
        const accuracy = this.gameStats.totalAttempts > 0 ? 
            Math.round((this.gameStats.correctAnswers / this.gameStats.totalAttempts) * 100) : 0;
        this.elements.currentAccuracy.textContent = accuracy + '%';
        
        // Update progress bar
        const progressPercentage = this.gameStats.cardsInCurrentLevel > 0 ? 
            (this.gameStats.cardsMastered / this.gameStats.cardsInCurrentLevel) * 100 : 0;
        this.elements.levelProgress.style.width = progressPercentage + '%';
    }

    restartLevel() {
        this.elements.gameOverOverlay.classList.remove('active');
        this.gameStats.lives = 5;
        this.loadLevelCards();
        this.elements.gameContainer.style.display = 'flex';
        this.nextQuestion();
        this.updateUI();
    }

    restartGame() {
        this.elements.gameOverOverlay.classList.remove('active');
        this.startGame();
    }

    backToMenu() {
        this.elements.gameContainer.style.display = 'none';
        this.elements.levelCompleteOverlay.classList.remove('active');
        this.elements.gameOverOverlay.classList.remove('active');
        this.elements.victoryOverlay.classList.remove('active');
        this.elements.startOverlay.classList.add('active');
        this.clearTimer();
    }

    // Utility Functions
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardEngine = new FlashcardEngine();
    console.log('🚀 Flashcard Reader initialized!');
}); 