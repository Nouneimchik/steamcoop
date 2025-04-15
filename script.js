document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.createElement('button');
    addButton.textContent = '+ Додати гру';
    addButton.style = 'position: relative; font-size: 22px; z-index: 1000;';
    addButton.className = 'addButton';
    document.body.appendChild(addButton);

    const container = document.querySelector('.body');

    // Завантаження збережених ігор
    const savedGames = JSON.parse(localStorage.getItem('games')) || [];
    savedGames.forEach(game => createGameBlock(game.appId, game.name, game.infoText, game.sizeText));

    addButton.addEventListener('click', async () => {
        const url = prompt('Вставте посилання на гру в Steam:');
        if (!url) return;

        const appId = extractAppId(url);
        if (!appId) {
            alert('Посилання некоректне!');
            return;
        }

        try {
            const response = await fetch(`https://steam-coop-site.netlify.app/netlify/functions/getSteamInfo/${appId}`);
            if (!response.ok) throw new Error('Помилка запиту до сервера!');

            const game = await response.json();
            if (!game.success) throw new Error('Не вдалося отримати дані з Steam!');

            const name = game.data.name || 'Назва невідома';
            const infoText = 'Режим невідомий';
            const sizeText = 'Розмір N/A';

            createGameBlock(appId, name, infoText, sizeText);
            saveGame(appId, name, infoText, sizeText);
        } catch (error) {
            console.error(error);
            alert('Сталася помилка при завантаженні даних!');
        }
    });

    function extractAppId(url) {
        const match = url.match(/app\/(\d+)/);
        return match ? match[1] : null;
    }

    function createGameBlock(appId, name, infoText, sizeText) {
        const wrapper = document.createElement('div');
        wrapper.className = 'spis';
        wrapper.innerHTML = `
            <button class="delete-btn" style="
                position: absolute;
                top: 5px;
                right: 5px;
                z-index: 10;
                background: red;
                color: white;
                border: none;
                cursor: pointer;
                padding: 2px 8px;
                font-size: 16px;">✕</button>

            <a href="https://store.steampowered.com/app/${appId}/" target="_blank">
                <img class="img" src="https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg" alt="">
            </a>
            <p class="text" contenteditable="false">${name}</p>
            <p class="info">${infoText}</p>
            <p class="size">${sizeText}</p>
        `;

        const infoP = wrapper.querySelector('.info');
        const sizeP = wrapper.querySelector('.size');

        // Редагування тексту
        [infoP, sizeP].forEach(el => {
            el.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = el.textContent;
                input.style.fontSize = 'inherit';
                input.style.width = '150px';

                el.replaceWith(input);
                input.focus();

                input.addEventListener('blur', () => {
                    const newP = document.createElement('p');
                    newP.className = el.className;
                    newP.textContent = input.value;
                    input.replaceWith(newP);
                    newP.addEventListener('click', () => {
                        newP.dispatchEvent(new Event('click'));
                    });
                    updateSavedGames();
                });
            });
        });

        // Видалення блоку
        wrapper.querySelector('.delete-btn').addEventListener('click', () => {
            wrapper.remove();
            updateSavedGames();
        });

        container.appendChild(wrapper);
    }

    function saveGame(appId, name, infoText, sizeText) {
        const games = JSON.parse(localStorage.getItem('games')) || [];
        games.push({ appId, name, infoText, sizeText });
        localStorage.setItem('games', JSON.stringify(games));
    }

    function updateSavedGames() {
        const allGames = [];
        document.querySelectorAll('.spis').forEach(block => {
            const appId = block.querySelector('a').href.match(/app\/(\d+)/)[1];
            const name = block.querySelector('.text').textContent;
            const infoText = block.querySelector('.info') ? block.querySelector('.info').textContent : '';
            const sizeText = block.querySelector('.size') ? block.querySelector('.size').textContent : '';
            allGames.push({ appId, name, infoText, sizeText });
        });
        localStorage.setItem('games', JSON.stringify(allGames));
    }
});
