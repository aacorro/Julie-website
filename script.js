// -------- Magic Trick --------
function getEvenNumber() {
    return [2,4,6,8,10][Math.floor(Math.random()*5)];
}

function startMagicTrick() {
    const n = getEvenNumber();
    alert("Think of a number (1–10)"); 
    alert("Multiply by 2");
    alert(`Add ${n}`);
    alert("Divide by 2");
    alert("Subtract your original number");
    alert(`✨ MAGIC! The answer is ${n/2}`);
}

// -------- Leaderboard Helpers --------
function saveScore(key, name, score) {
    const scores = JSON.parse(localStorage.getItem(key)) || [];
    scores.push({ name, score });
    scores.sort((a,b) => a.score - b.score);
    localStorage.setItem(key, JSON.stringify(scores.slice(0,10)));
}

function renderLeaderboard(key, el, suffix="") {
    el.innerHTML = "";
    (JSON.parse(localStorage.getItem(key)) || []).forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name} – ${s.score}${suffix}`;
        el.appendChild(li);
    });
}

// -------- Reaction Game --------
const reactionBox = document.getElementById("reactionBox");
const reactionBtn = document.getElementById("reactionStartBtn");
const reactionMsg = document.getElementById("reactionMessage");
const reactionLB = document.getElementById("reactionLeaderboard");

let startTime, active, timeout;

reactionBtn.onclick = () => {
    reactionBox.style.background = "#ff6b6b";
    reactionBox.textContent = "WAIT…";
    reactionMsg.textContent = "";
    active = false;

    timeout = setTimeout(() => {
        reactionBox.style.background = "#51cf66";
        reactionBox.textContent = "CLICK!";
        startTime = Date.now();
        active = true;
    }, Math.random()*3000 + 2000);
};

reactionBox.onclick = () => {
    if (!active) return;
    const time = Date.now() - startTime;
    reactionMsg.textContent = `${time} ms`;
    const name = prompt("Name?");
    if (name) saveScore("reaction", name, time);
    renderLeaderboard("reaction", reactionLB, " ms");
    active = false;
};

renderLeaderboard("reaction", reactionLB, " ms");


/* ==================== MEMORY GAME ==================== */
const memoryBoard = document.getElementById("memoryBoard");
const memoryTimer = document.getElementById("memoryTimer");
const memoryLeaderboard = document.getElementById("memoryLeaderboard");

// Emoji pairs for cards
const emojis = ["🐶","🐶","🐱","🐱","🐸","🐸","🦄","🦄"];
let flipped = [];
let matchedPairs = 0;
let lock = false;

// Timer variables
let memoryStartTime = null;
let memoryTimerInterval = null;

// Shuffle helper
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Leaderboard helpers
function saveScore(key, name, score) {
    const scores = JSON.parse(localStorage.getItem(key)) || [];
    scores.push({ name, score });
    scores.sort((a,b) => a.score - b.score); // lower time is better
    localStorage.setItem(key, JSON.stringify(scores.slice(0,10)));
}

function getScores(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function renderMemoryLeaderboard() {
    if(!memoryLeaderboard) return;
    memoryLeaderboard.innerHTML = "";
    getScores("memoryScores").forEach((s,i) => {
        const li = document.createElement("li");
        li.textContent = `${i+1}. ${s.name} - ${s.score.toFixed(1)}s`;
        memoryLeaderboard.appendChild(li);
    });
}

// Timer functions
function startMemoryTimer() {
    if(memoryTimerInterval) return;
    memoryStartTime = Date.now();
    memoryTimer.textContent = "Time: 0.0s";

    memoryTimerInterval = setInterval(() => {
        const elapsed = (Date.now() - memoryStartTime)/1000;
        memoryTimer.textContent = `Time: ${elapsed.toFixed(1)}s`;
    }, 100);
}

function stopMemoryTimer() {
    clearInterval(memoryTimerInterval);
    memoryTimerInterval = null;
    const finalTime = (Date.now() - memoryStartTime)/1000;
    memoryTimer.textContent = `Final Time: ${finalTime.toFixed(2)}s`;
    return finalTime;
}

// Initialize / reset game
function startMemoryGame() {
    memoryBoard.innerHTML = "";
    flipped = [];
    matchedPairs = 0;
    lock = false;
    memoryStartTime = null;
    clearInterval(memoryTimerInterval);
    memoryTimer.textContent = "Time: 0.0s";

    // Duplicate emojis and shuffle
    const gameEmojis = [...emojis];
    shuffle(gameEmojis);

    gameEmojis.forEach(emoji => {
        const card = document.createElement("div");
        card.className = "memory-card";
        card.dataset.emoji = emoji;
        card.textContent = ""; // face-down
        card.addEventListener("click", () => flipCard(card));
        memoryBoard.appendChild(card);
    });
}

// Flip logic
function flipCard(card) {
    if(lock || card.classList.contains("flipped")) return;

    if(!memoryStartTime) startMemoryTimer();

    card.textContent = card.dataset.emoji;
    card.classList.add("flipped");
    flipped.push(card);

    if(flipped.length === 2) checkMatch();
}

// Check for match
function checkMatch() {
    lock = true;
    const [a,b] = flipped;

    if(a.dataset.emoji === b.dataset.emoji) {
        a.classList.add("matched");
        b.classList.add("matched");
        matchedPairs++;
        flipped = [];
        lock = false;

        // All matched
        if(matchedPairs === emojis.length/2) endMemoryGame();
    } else {
        setTimeout(() => {
            a.textContent = "";
            b.textContent = "";
            a.classList.remove("flipped");
            b.classList.remove("flipped");
            flipped = [];
            lock = false;
        }, 800);
    }
}

// End of game
function endMemoryGame() {
    const finalTime = stopMemoryTimer();

    const name = prompt("You won! Enter your name:");
    if(name) {
        saveScore("memoryScores", name, finalTime);
        renderMemoryLeaderboard();
    }

    setTimeout(startMemoryGame, 1000); // restart after 1s
}

// Start game immediately
startMemoryGame();
renderMemoryLeaderboard();
