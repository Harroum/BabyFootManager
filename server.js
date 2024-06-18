const express = require('express');
const { Server } = require('ws');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const wss = new Server({ server });

wss.on('connection', (ws) => 
{
    console.log('New client connected');
    
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.post('/games', async (req, res) => 
{
    const { name } = req.body;
    try {
        const newGame = await pool.query(
            "INSERT INTO games (name) VALUES ($1) RETURNING *",
            [name]
        );
        const totalCount = await getTotalCount();
        const unfinishedCount = await getUnfinishedCount();
        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({ type: 'CREATE', game: newGame.rows[0], totalCount, unfinishedCount }));
            }
        });
        res.json(newGame.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.delete('/games/:id', async (req, res) => 
{
    const { id } = req.params;
    try 
    {
        await pool.query("DELETE FROM games WHERE id = $1", [id]);
        const totalCount = await getTotalCount();
        const unfinishedCount = await getUnfinishedCount();
        wss.clients.forEach((client) => 
        {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({ type: 'DELETE', id, totalCount, unfinishedCount }));
            }
        });
        res.json({ message: "Game deleted" });
    } 
    catch (err) 
    {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.put('/games/:id/finish', async (req, res) => 
{
    const { id } = req.params;
    try 
    {
        const updatedGame = await pool.query(
            "UPDATE games SET status = 'Terminée' WHERE id = $1 RETURNING *",
            [id]
        );
        const totalCount = await getTotalCount();
        const unfinishedCount = await getUnfinishedCount();
        wss.clients.forEach((client) => 
        {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({ type: 'UPDATE', game: updatedGame.rows[0], totalCount, unfinishedCount }));
            }
        });
        res.json(updatedGame.rows[0]);
    } 
    catch (err) 
    {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.get('/games', async (req, res) => 
{
    try 
    {
        const allGames = await pool.query("SELECT * FROM games");
        const totalCount = await getTotalCount();
        const unfinishedCount = await getUnfinishedCount();
        res.json({ games: allGames.rows, totalCount, unfinishedCount });
    } 
    catch (err) 
    {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

async function getTotalCount() 
{
    try 
    {
        const result = await pool.query("SELECT COUNT(*) FROM games");
        return result.rows[0].count;
    } 
    catch (err) 
    {
        console.error(err.message);
        return 0;
    }
}

async function getUnfinishedCount() 
{
    try 
    {
        const result = await pool.query("SELECT COUNT(*) FROM games WHERE status != 'Terminée'");
        return result.rows[0].count;
    } 
    catch (err) 
    {
        console.error(err.message);
        return 0;
    }
}
