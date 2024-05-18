// app.js
document.addEventListener('DOMContentLoaded', () => {
    const personsList = document.getElementById('persons-list');
    const groupList = document.getElementById('group-list');
    const groupCount = document.getElementById('group-count');
    const searchButton = document.getElementById('search-button');
    const playerNameInput = document.getElementById('player-name');

    // Maximum number of players allowed in the group
    const MAX_PLAYERS = 11;
    const MIN_PLAYERS_TO_DISPLAY = 50;

    // Set to track displayed players by ID
    const displayedPlayers = new Set();

    // Fetch and display players initially
    fetchPlayerData('');

    // Event listener for the search button
    searchButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        displayedPlayers.clear(); // Clear previously displayed players for new search
        fetchPlayerData(playerName);
    });

    // Fetch data from API
    function fetchPlayerData(playerName) {
        const apiURL = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`;
        personsList.innerHTML = ''; // Clear previous results
        let allPlayers = [];
        const fetchAndDisplay = async (url) => {
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data && data.player) {
                    // Filter players to only include those with a photo
                    const playersWithPhoto = data.player.filter(person => person.strThumb && !displayedPlayers.has(person.idPlayer));
                    playersWithPhoto.forEach(player => displayedPlayers.add(player.idPlayer));
                    allPlayers = allPlayers.concat(playersWithPhoto);
                    if (allPlayers.length < MIN_PLAYERS_TO_DISPLAY && playersWithPhoto.length > 0) {
                        // Fetch more players with the next search result
                        const nextPlayer = playersWithPhoto[playersWithPhoto.length - 1].strPlayer;
                        fetchAndDisplay(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(nextPlayer)}`);
                    } else {
                        displayPlayers(allPlayers.slice(0, MIN_PLAYERS_TO_DISPLAY));
                    }
                } else {
                    if (allPlayers.length === 0) {
                        personsList.innerHTML = '<p>No players found.</p>';
                    } else {
                        displayPlayers(allPlayers.slice(0, MIN_PLAYERS_TO_DISPLAY));
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchAndDisplay(apiURL);
    }

    // Display all players
    function displayPlayers(players) {
        personsList.innerHTML = ''; // Clear previous results
        players.forEach(person => {
            const personBox = createPersonBox(person);
            personsList.appendChild(personBox);
        });
    }

    // Create a person box
    function createPersonBox(person) {
        const box = document.createElement('div');
        box.classList.add('person-box');

        const img = document.createElement('img');
        img.src = person.strThumb;

        const name = document.createElement('span');
        name.textContent = `Name: ${person.strPlayer}`;

        const nationality = document.createElement('span');
        nationality.textContent = `Nationality: ${person.strNationality}`;

        const team = document.createElement('span');
        team.textContent = `Team: ${person.strTeam}`;

        const sport = document.createElement('span');
        sport.textContent = `Sport: ${person.strSport}`;

        const salary = document.createElement('span');
        salary.textContent = `Salary: ${person.strSigning || 'N/A'}`;

        const gender = document.createElement('span');
        gender.textContent = `Gender: ${person.strGender}`;

        const description = document.createElement('span');
        description.textContent = `Description: ${person.strDescriptionEN ? person.strDescriptionEN.split(' ').slice(0, 15).join(' ') + '...' : 'N/A'}`;

        const socialMedia = document.createElement('div');
        socialMedia.classList.add('social-media');

        const socialLinks = {
            strFacebook: 'fab fa-facebook',
            strTwitter: 'fab fa-twitter',
            strInstagram: 'fab fa-instagram',
            strYoutube: 'fab fa-youtube',
            strLinkedin: 'fab fa-linkedin',
            strWebsite: 'fas fa-globe'
        };

        for (const [key, iconClass] of Object.entries(socialLinks)) {
            if (person[key]) {
                const link = document.createElement('a');
                link.href = `https://${person[key]}`;
                link.target = '_blank';
                const icon = document.createElement('i');
                icon.className = iconClass;
                link.appendChild(icon);
                socialMedia.appendChild(link);
            }
        }

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        const buttonAdd = document.createElement('button');
        buttonAdd.textContent = 'Add to Group';
        buttonAdd.onclick = () => addToGroup(person, buttonAdd); // Pass the button element to the addToGroup function

        const buttonDetails = document.createElement('button');
        buttonDetails.id = 'details-button';
        buttonDetails.textContent = 'Details';
        buttonDetails.onclick = () => showDetails(person);

        buttonGroup.appendChild(buttonAdd);
        buttonGroup.appendChild(buttonDetails);

        box.appendChild(img);
        box.appendChild(name);
        box.appendChild(nationality);
        box.appendChild(team);
        box.appendChild(sport);
        box.appendChild(salary);
        box.appendChild(gender);
        box.appendChild(description);
        box.appendChild(socialMedia);
        box.appendChild(buttonGroup);

        return box;
    }

    // Add person to the group
    function addToGroup(person, addButton) {
        if (groupList.children.length >= MAX_PLAYERS) {
            alert(`You can only add ${MAX_PLAYERS} players to your group.`);
            return;
        }

        const groupBox = document.createElement('div');
        groupBox.classList.add('group-box');

        const name = document.createElement('span');
        name.textContent = person.strPlayer;

        groupBox.appendChild(name);
        groupList.appendChild(groupBox);

        // Update total count
        updateGroupCount();

        // Change button text and color
        addButton.textContent = 'Already Added';
        addButton.style.backgroundColor = 'red';
        addButton.disabled = true; // Disable the button after adding to group
    }

    // Update total count
    function updateGroupCount() {
        const count = groupList.children.length;
        groupCount.textContent = `Total Persons: ${count}`;
    }

    // Show details of the player
    function showDetails(person) {
        const apiURL = `https://www.thesportsdb.com/api/v1/json/3/lookupplayer.php?id=${person.idPlayer}`;
        fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                if (data && data.players && data.players.length > 0) {
                    const player = data.players[0];
                    const details = `
                        <div class="modal-content">
                            <img src="${player.strThumb}" alt="${player.strPlayer}" class="player-image">
                            <div class="player-details">
                                <p><strong>Name:</strong> ${player.strPlayer}</p>
                                <p><strong>ID:</strong> ${player.idPlayer}</p>
                                <p><strong>Nationality:</strong> ${player.strNationality}</p>
                                <p><strong>Gender:</strong> ${player.strGender}</p>
                            </div>
                        </div>
                    `;
                    // Create a modal popup
                    const modal = document.createElement('div');
                    modal.classList.add('modal');
                    modal.innerHTML = details;
                    // Append modal to the body
                    document.body.appendChild(modal);
                    // Close modal when clicked outside of it
                    modal.addEventListener('click', function(event) {
                        if (event.target === modal) {
                            modal.remove();
                        }
                    });
                } else {
                    alert('Details not available.');
                }
            })
            .catch(error => console.error('Error fetching details:', error));
    }

});
