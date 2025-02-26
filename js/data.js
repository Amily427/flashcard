// Firebase 初始化
var firebaseConfig = {
    apiKey: "AIzaSyANMQt_XtEaDIh3pUj9E8GyDEOoCyxdJy4",
    authDomain: "flashcard-6b843.firebaseapp.com",
    projectId: "flashcard-6b843",
    storageBucket: "flashcard-6b843.firebasestorage.app",
    messagingSenderId: "166893598458",
    appId: "1:166893598458:web:75a17c666180b1d0f43b43",
    measurementId: "G-F4VB44S28F"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// 全局筛选条件与搜索关键词
let currentCategory = "全部";
let currentSearch = "";

// 更新卡片显示（支持分类与搜索组合筛选）
function updateCardsVisibility() {
    const cards = document.querySelectorAll('.card-container');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardText = card.querySelector('.card-front').innerText.toLowerCase();
        const matchesCategory = (currentCategory === "全部" || cardCategory === currentCategory);
        const matchesSearch = (cardText.indexOf(currentSearch.toLowerCase()) !== -1);
        card.style.display = (matchesCategory && matchesSearch) ? "" : "none";
    });
}

// 分类栏点击事件
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.innerText;
        updateCardsVisibility();
    });
});

// 搜索框事件
document.querySelector('.search-input').addEventListener('input', function () {
    currentSearch = this.value;
    updateCardsVisibility();
});

// 卡片翻转功能
function attachCardFlip(card) {
    card.addEventListener('click', function () {
        card.classList.toggle('flipped');
    });
}
document.querySelectorAll('.card').forEach(card => {
    attachCardFlip(card);
});

// 渲染一张卡片
function renderCard(data, id) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';
    cardContainer.setAttribute('data-category', data.category);

    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    const frontDiv = document.createElement('div');
    frontDiv.className = 'card-face card-front';
    frontDiv.innerHTML = `
          <div class="card-title">网络协议 | ${data.category}</div>
          <div class="card-question">${data.question}</div>
          <div class="card-footer">
            <div class="card-tag">${data.category}</div>
            <div class="footer-tip">点击查看答案</div>
          </div>
        `;

    const backDiv = document.createElement('div');
    backDiv.className = 'card-face card-back';
    backDiv.innerHTML = `
          <div class="back-side-header">
            <div class="back-side-title">答案</div>
            <div class="back-side-decoration"></div>
          </div>
          <div class="answer-section">
            <div class="answer-title">答案内容</div>
            <div class="answer-content">${data.answer}</div>
          </div>
          <div class="card-footer">
            <div class="card-tag">${data.category}</div>
            <div class="footer-tip">点击返回问题</div>
          </div>
        `;

    cardDiv.appendChild(frontDiv);
    cardDiv.appendChild(backDiv);
    attachCardFlip(cardDiv);
    cardContainer.appendChild(cardDiv);
    document.querySelector('.cards-grid').appendChild(cardContainer);
}

// 从 Firestore 加载卡片数据并渲染
function loadCards() {
    db.collection("cards").get().then(snapshot => {
        snapshot.forEach(doc => {
            renderCard(doc.data(), doc.id);
        });
        updateTotalCount();
    }).catch(err => {
        console.error("加载卡片数据出错：", err);
    });
}

// 保存新卡片到 Firestore
function saveCard(data) {
    return db.collection("cards").add(data);
}

// 更新总卡片数显示（假设预置卡片数为 12）
function updateTotalCount() {
    const statElem = document.querySelector('.stat-value');
    db.collection("cards").get().then(snapshot => {
        let count = snapshot.size;
        let baseCount = 12;
        statElem.innerText = baseCount + count;
    });
}

// 更新添加卡片模态框中的预览效果
function updatePreview() {
    const category = document.getElementById('newCategory').value.trim() || "类别";
    const question = document.getElementById('newQuestion').value.trim() || "问题预览";
    document.getElementById('cardPreview').innerHTML = `
          <div class="card-title">网络协议 | ${category}</div>
          <div class="card-question">${question}</div>
          <div class="card-footer">
            <div class="card-tag">${category}</div>
            <div class="footer-tip">预览</div>
          </div>
        `;
}
document.getElementById('newCategory').addEventListener('input', updatePreview);
document.getElementById('newQuestion').addEventListener('input', updatePreview);

// 模态框显示与隐藏
const modal = document.getElementById('addCardModal');
document.querySelector('.add-card-btn').addEventListener('click', function (e) {
    e.preventDefault();
    modal.style.display = "flex";
    updatePreview();
});
document.getElementById('cancelCard').addEventListener('click', function () {
    modal.style.display = "none";
});





// 提交新卡片
document.getElementById('submitCard').addEventListener('click', function () {
    const category = document.getElementById('newCategory').value.trim();
    const question = document.getElementById('newQuestion').value.trim();
    const answer = document.getElementById('newAnswer').value.trim();
    if (!category || !question || !answer) {
        alert("请填写完整信息！");
        return;
    }
    const newCardData = { category, question, answer };
    saveCard(newCardData).then(docRef => {
        renderCard(newCardData, docRef.id);
        updateTotalCount();
        document.getElementById('newCategory').value = "";
        document.getElementById('newQuestion').value = "";
        document.getElementById('newAnswer').value = "";
        document.getElementById('cardPreview').innerHTML = "";
        modal.style.display = "none";
        updateCardsVisibility();
    }).catch(err => {
        console.error("保存卡片出错：", err);
    });
});

window.addEventListener('load', loadCards);