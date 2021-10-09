const teamSelect = $('#team-select');
const teamSelectBtn = $('#team-select-btn');

let selectedTeam;
let teamNameData = [];

function getTeams() {
    fetch("https://api.football-data.org/v2/competitions/2021/teams", {
        headers: {
            'X-Auth-Token': "d9a5e68af1764fc0acc74a34bc2ebb48"
        },
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);

            for (let i = 0; i < data.teams.length; i++) {
                const teamNameYeah = data.teams[i].name;

                teamNameData.push(teamNameYeah);
            }

            teamNameData.sort(function (a, b) {
                a = a.toLowerCase();
                b = b.toLowerCase();
                if (a > b) return 1;
                if (a < b) return -1;
                return 0;
            });

            console.log(teamNameData);

            for (let i = 0; i < teamNameData.length; i++) {
                const teamName = $('<option>').attr('value', teamNameData[i]).text(teamNameData[i]);

                teamSelect.append(teamName);
            }
        });
}



$(document).ready(function () {
    
    var userTeam = localStorage.getItem('team');

    if (userTeam) {
        document.location = "./assets/html/main-display.html"
    } 
    
    getTeams();

    teamSelect.change(function () {
        selectedTeam = $(this).children("option:selected").val();
        console.log(selectedTeam);
    });
});

teamSelectBtn.on('click', function (event) {
    event.preventDefault();
    if (!selectedTeam) {
        $('#open-button').trigger('click');
    } else {
        localStorage.setItem('team', selectedTeam);
        document.location = "./assets/html/main-display.html"
    }
});

$(document).foundation();

//on page load
//get local storage
//if empty, do nothing
//if populated, team name = local storage
//document location. main index. 