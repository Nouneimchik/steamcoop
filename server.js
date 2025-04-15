const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/steaminfo/:appid', async (req, res) => {
    const appId = req.params.appid;

    try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=uk`);
        const data = await response.json();
        res.json(data[appId]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Помилка при запиті до Steam API' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Проксі-сервер запущено на http://localhost:${PORT}`));
