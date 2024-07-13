const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const axios = require('axios');

const app = express();
const pool = new Pool({
    user: 'postgres',
    host: '192.168.56.1',
    database: 'innovatube',
    password: '010601',
    port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'view')));

// Ruta para servir el formulario de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'html', 'register.html'));
});

// Ruta para servir el formulario de inicio de sesión
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'html', 'login.html'));
});

// Ruta para servir el formulario de favoritos
app.get('/favorites', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'html', 'favorites.html'));
});

// Ruta para procesar el registro
app.post('/register', async (req, res) => {
    const { nombres, apellidos, usuario, email, contraseña } = req.body;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    try {
        const result = await pool.query(
            'INSERT INTO users (first_name, last_name, username, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [nombres, apellidos, usuario, email, hashedPassword]
        );
        res.send('Usuario registrado');
    } catch (err) {
        res.status(400).send('Error registrando usuario');
    }
});

// Ruta para procesar el inicio de sesión
app.post('/login', async (req, res) => {
    const { usuario, contraseña } = req.body;
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [usuario]
        );
        if (result.rows.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }

        const user = result.rows[0];

        const isValidPassword = await bcrypt.compare(contraseña, user.password);

        if (!isValidPassword) {
            return res.status(400).send('Contraseña incorrecta');
        }

        // Inicio de sesión exitoso
        res.redirect('/index.html');
    } catch (err) {
        res.status(400).send('Error al iniciar sesión');
    }
});

// Ruta para buscar videos de YouTube
app.post('/search', async (req, res) => {
    const { query } = req.body;
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: query,
                key: 'AIzaSyAJnDsC_z_i8xbUVcKk2T8tH6fbtCuntjg',
                maxResults: 10
            }
        });
        res.json(response.data.items);
    } catch (err) {
        console.error('Error fetching videos:', err);
        res.status(500).send('Error fetching videos');
    }
});

// Ruta para añadir a favoritos
app.post('/add-favorite', async (req, res) => {
    const { userId, videoId, title, description } = req.body;
    try {
        await pool.query(
            'INSERT INTO favorites (user_id, video_id, title, description) VALUES ($1, $2, $3, $4)',
            [userId, videoId, title, description]
        );
        res.send('Video added to favorites');
    } catch (err) {
        console.error('Error adding favorite:', err);
        res.status(500).send('Error adding favorite');
    }
});

app.post('/remove-favorite', async (req, res) => {
    const { userId, videoId } = req.body;
    try {
        await pool.query(
            'DELETE FROM favorites WHERE user_id = $1 AND video_id = $2',
            [userId, videoId]
        );
        res.send('Video removed from favorites');
    } catch (err) {
        console.error('Error removing favorite:', err);
        res.status(500).send('Error removing favorite');
    }
});

app.get('/favorites', async (req, res) => {
    const userId = req.cookies.userId;
    try {
        const result = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching favorites:', err);
        res.status(500).send('Error fetching favorites');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});