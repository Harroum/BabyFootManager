document.addEventListener('DOMContentLoaded', () => 
{
    const gameForm = document.getElementById('createGameForm');
    const gameNameInput = document.getElementById('gameName');
    const gamesContainer = document.getElementById('games');
    const unfinishedCountElement = document.getElementById('unfinishedCount');
    const totalCountElement = document.getElementById('totalCount');

    const socket = new WebSocket(`ws://${window.location.host}`);
    
    socket.addEventListener('message', (event) => 
    {
        const message = JSON.parse(event.data);
        if (message.type === 'CREATE') 
        {
            addGameToDOM(message.game);
            updateCounts(message.totalCount, message.unfinishedCount);
        } 
        else if (message.type === 'DELETE') 
        {
            removeGameFromDOM(message.id);
            updateCounts(message.totalCount, message.unfinishedCount);
        } 
        else if (message.type === 'UPDATE') 
        {
            updateGameInDOM(message.game);
            updateCounts(message.totalCount, message.unfinishedCount);
        }
    });

    gameForm.addEventListener('submit', async (event) => 
    {
        event.preventDefault();
        const gameName = gameNameInput.value.trim();
        if (gameName === '') return;

        const response = await fetch('/games', 
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: gameName })
        });
        const newGame = await response.json();
        gameNameInput.value = '';
    });

    async function loadGames() 
    {
        const response = await fetch('/games');
        const data = await response.json();
        gamesContainer.innerHTML = '';
        data.games.forEach(game => 
        {
            addGameToDOM(game);
        });
        updateCounts(data.totalCount, data.unfinishedCount);
    }


    function addGameToDOM(game) 
    {
        const gameElement = document.createElement('div');
        gameElement.className = `game ${game.status}`;
        gameElement.id = `game-${game.id}`;
        gameElement.innerHTML = `
            <span>${game.name}</span>
            <span>
                <button class="btn btn-primary btn-sm" onclick="finishGame(${game.id})">Terminer <i class="fa-solid fa-hourglass-end"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="deleteGame(${game.id})">Supprimer <i class="fa-solid fa-trash"></i></button>
            </span>
        `;
        gamesContainer.appendChild(gameElement);
    }


    function removeGameFromDOM(id) 
    {
        const gameElement = document.getElementById(`game-${id}`);
        if (gameElement) {
            gamesContainer.removeChild(gameElement);
        }
    }

    function updateGameInDOM(game) 
    {
        const gameElement = document.getElementById(`game-${game.id}`);
        if (gameElement) {
            gameElement.className = `game ${game.status}`;
            gameElement.querySelector('span').innerText = game.name;
        }
    }

    function updateCounts(totalCount, unfinishedCount) 
    {
        unfinishedCountElement.innerText = `${unfinishedCount}`;
    }

    window.finishGame = async (id) => 
    {
        await fetch(`/games/${id}/finish`, { method: 'PUT' });
    }

    window.deleteGame = async (id) => 
    {
        await fetch(`/games/${id}`, { method: 'DELETE' });
    }


    loadGames();
});