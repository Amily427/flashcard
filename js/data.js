const API_URL = "https://flashcard-iqayw879n-flashcards-projects.vercel.app/cards";  // 本地测试
// 如果你部署到了 Vercel 或其他云端，改为你的远程 API
// const API_URL = "https://your-vercel-app.vercel.app/cards";

// 加载数据
async function loadCards() {
    try {
        const response = await fetch(API_URL);
        const cards = await response.json();
        document.querySelector('.cards-grid').innerHTML = ""; // 清空现有内容
        cards.forEach(renderCard);
    } catch (error) {
        console.error("❌ 加载卡片数据失败:", error);
    }
}

function attachCardFlip(card) {
    card.addEventListener('click', function () {
        card.classList.toggle('flipped');
    });
}

// 在 `renderCard` 里确保新创建的卡片能翻转
function renderCard(card) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';
    cardContainer.setAttribute('data-category', card.category);

    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    const frontDiv = document.createElement('div');
    frontDiv.className = 'card-face card-front';
    frontDiv.innerHTML = `
        <div class="card-title">网络协议 | ${card.category}</div>
        <div class="card-question">${card.question}</div>
        <div class="card-footer">
          <div class="card-tag">${card.category}</div>
          <div class="footer-tip">点击查看答案</div>
        </div>
    `;

    const backDiv = document.createElement('div');
    backDiv.className = 'card-face card-back';
    backDiv.innerHTML = `
        <div class="answer-section">
          <div class="answer-title">答案</div>
          <div class="answer-content">${card.answer}</div>
        </div>
        <div class="card-footer">
          <div class="card-tag">${card.category}</div>
          <div class="footer-tip">点击返回问题</div>
        </div>
    `;

    cardDiv.appendChild(frontDiv);
    cardDiv.appendChild(backDiv);
    cardContainer.appendChild(cardDiv);

    // 绑定翻转功能
    attachCardFlip(cardDiv);

    document.querySelector('.cards-grid').appendChild(cardContainer);
}

// 确保已有卡片也能翻转
document.querySelectorAll('.card').forEach(card => {
    attachCardFlip(card);
});


// 绑定页面加载事件
window.addEventListener('load', loadCards);

document.getElementById('submitCard').addEventListener('click', async function () {
    const category = document.getElementById('newCategory').value.trim();
    const question = document.getElementById('newQuestion').value.trim();
    const answer = document.getElementById('newAnswer').value.trim();

    if (!category || !question || !answer) {
        alert("请填写完整信息！");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, question, answer })
        });
        const newCard = await response.json();
        renderCard(newCard); // 立即渲染新卡片
        document.getElementById('newCategory').value = "";
        document.getElementById('newQuestion').value = "";
        document.getElementById('newAnswer').value = "";
    } catch (error) {
        console.error("❌ 添加卡片失败:", error);
    }
});

function attachCardFlip(card) {
    card.addEventListener('click', function () {
        card.classList.toggle('flipped');
    });
}

document.querySelectorAll('.card').forEach(card => {
    attachCardFlip(card);
});

// 获取模态框元素
const modal = document.getElementById('addCardModal');
const openBtn = document.getElementById('openAddCardModal');
const closeBtn = document.getElementById('cancelCard');

// 监听 "添加新卡片" 按钮，显示模态框
document.getElementById('openAddCardModal').addEventListener('click', function (event) {
    event.preventDefault();
    modal.style.display = "flex"; // 让模态框可见
});

// 监听 "取消" 按钮，关闭模态框
document.getElementById('cancelCard').addEventListener('click', function () {
    modal.style.display = "none"; // 隐藏模态框
});
