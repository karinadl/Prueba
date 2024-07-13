
document.getElementById('searchForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const query = document.getElementById('query').value;
    const resultsDiv = document.getElementById('results');

    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Error fetching videos');
        }

        const videos = await response.json();

        resultsDiv.innerHTML = '';

        videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.innerHTML = `
                <h3>${video.snippet.title}</h3>
                <p>${video.snippet.description}</p>
                <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
                <button onclick="addFavorite('${video.id.videoId}', '${video.snippet.title}', '${video.snippet.description}')">Add to Favorites</button>
            `;
            resultsDiv.appendChild(videoElement);
        });
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = 'Error fetching videos';
    }
});

function addFavorite(videoId, title, description) {
    fetch('/add-favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: getCookie('userId'),
            videoId,
            title,
            description
        })
    })
        .then(response => response.text())
        .then(message => {
            alert(message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


async function loadFavorites() {
    try {
        const response = await fetch('/favorites');
        if (!response.ok) {
            throw new Error('Error fetching favorites');
        }

        const favorites = await response.json();
        const favoritesDiv = document.getElementById('favorites');
        favoritesDiv.innerHTML = '';

        favorites.forEach(favorite => {
            const favoriteElement = document.createElement('div');
            favoriteElement.innerHTML = `
                <h3>${favorite.title}</h3>
                <p>${favorite.description}</p>
                <button onclick="removeFavorite('${favorite.video_id}')">Remove from Favorites</button>
            `;
            favoritesDiv.appendChild(favoriteElement);
        });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('favorites').innerHTML = 'Error fetching favorites';
    }
}

async function removeFavorite(videoId) {
    try {
        const response = await fetch('/remove-favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: getCookie('userId'), videoId })
        });

        if (!response.ok) {
            throw new Error('Error removing favorite');
        }

        alert(await response.text());
        loadFavorites();
    } catch (error) {
        console.error('Error:', error);
        alert('Error removing favorite');
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

loadFavorites();