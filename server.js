require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 连接 MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB 连接成功"))
    .catch(err => console.error("❌ MongoDB 连接失败", err));

// 定义数据模型
const CardSchema = new mongoose.Schema({
    category: String,
    question: String,
    answer: String
});
const Card = mongoose.model('Card', CardSchema);

// 获取所有卡片数据
app.get('/cards', async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 添加新卡片
app.post('/cards', async (req, res) => {
    const { category, question, answer } = req.body;
    try {
        const newCard = new Card({ category, question, answer });
        await newCard.save();
        res.json(newCard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 删除卡片
app.delete('/cards/:id', async (req, res) => {
    try {
        await Card.findByIdAndDelete(req.params.id);
        res.json({ message: "卡片删除成功" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 服务器监听端口
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`服务器运行在 http://localhost:${PORT}`));
