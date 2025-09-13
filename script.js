const storyTextEl = document.getElementById('story-text');
const whiteBoardEl = document.getElementById('white-board');
const titleScreenEl = document.getElementById('title-screen');
const movieBars = document.getElementById('movie-bars');
const newGameBtn = document.getElementById('new-game');
const continueBtn = document.getElementById('continue-game');
const settingsBtn = document.getElementById('settings');
const continueInput = document.getElementById('continue-input');
const loadSaveBtn = document.getElementById('load-save');
const saveCodeInput = document.getElementById('save-code');
const settingsPanel = document.getElementById('settings-panel');
const brightnessInput = document.getElementById('brightness');
const fullscreenCheckbox = document.getElementById('fullscreen');

let paragraphs = [];

async function loadStory() {
    const response = await fetch('story.json');
    const story = await response.json();
    paragraphs = story.paragraphs;
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function playStory() {
    for (let i = 0; i < paragraphs.length; i++) {
        storyTextEl.textContent = paragraphs[i];
        storyTextEl.style.opacity = 1;
        await delay(3450);
        if (i !== paragraphs.length - 1) {
            storyTextEl.style.opacity = 0;
            await delay(880);
        }
    }

    // 最后一段动画
    await delay(2340);
    whiteBoardEl.style.height = '100%';
    storyTextEl.style.transform = 'translate(-50%, -150%)';
    await delay(2000);

    movieBars.querySelector('#top-bar').style.height = '10%';
    movieBars.querySelector('#bottom-bar').style.height = '10%';

    whiteBoardEl.style.background = 'linear-gradient(to right, black, white)';

    titleScreenEl.style.display = 'block';
}

// 菜单交互
newGameBtn.addEventListener('click', () => location.reload());
continueBtn.addEventListener('click', () => {
    continueInput.style.display = 'block';
});
settingsBtn.addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
});

// 加载存档（示例逻辑）
loadSaveBtn.addEventListener('click', () => {
    const code = saveCodeInput.value.trim();
    if (code) alert(`已加载存档: ${code}`);
});

// 亮度调节
brightnessInput.addEventListener('input', () => {
    document.body.style.filter = `brightness(${brightnessInput.value})`;
});

// 全屏
fullscreenCheckbox.addEventListener('change', () => {
    if (fullscreenCheckbox.checked) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
});

loadStory().then(playStory);
