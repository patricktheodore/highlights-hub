const gameContainerDiv = $('#game-container');
const fixturesContainerDiv = $('.fixtures-table-head');
const leagueTableContainer = $('.league-table');
const dateToday = moment().format('YYYY-MM-DD');

let userTeamName = localStorage.getItem('team'); 
if (!userTeamName) {
    document.location = "https://patricktheodore.github.io/football-highlights-dashboard/"
};

let teamName = userTeamName.replace(" FC", "");

function getHighlightVideo(videos) {
    return videos.filter(function (video) {
        return video.title.toLowerCase() === 'highlights';
    })
}

function getHighlights() {
    fetch("https://www.scorebat.com/video-api/v3/")
        .then(function (response) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);

            //search data for teamName
            for (let i = 0; i < data.response.length; i++) {
                if (data.response[i].title.includes(teamName) && !data.response[i].competition.includes('Women')) { // fixes issue where womens team highlights were being loaded in the wrong location

                    const gameDiv = $('<div>').attr({ class: "cell small-12 align-center video-link-div" });
                    const gameTitle = $('<button>').text(data.response[i].title).addClass('game-title' + i).attr('id', 'video-reveal-button');
                    const gameTitleItem = $('<div>');
                    const iconDown = $('<i>').addClass('fas fa-caret-down');
                    const highlightsDateUTC = data.response[i].date;
                    const highlightsDate = moment.utc(highlightsDateUTC).local().format("DD - MMM");
                    const highlightsDateLocal = $('<div>').text(highlightsDate).attr({ class: "highlights-date" });
                    const highlightsCompetition = $('<div>').text(data.response[i].competition).addClass('highlights-competition');


                    gameContainerDiv.append(
                        gameDiv.append(
                            gameTitle.append(iconDown),
                            gameTitleItem
                        )
                    );

                    const highlightVideos = getHighlightVideo(data.response[i].videos);

                    const videoContainer = document.createElement('div');
                    videoContainer.setAttribute('style', 'width: 100%');
                    videoContainer.setAttribute('style', 'display: none');
                    videoContainer.innerHTML = highlightVideos[0].embed;
                    gameTitleItem.append(videoContainer, highlightsCompetition, highlightsDateLocal);

                    $('.game-title' + i).click(function () {
                        $(videoContainer).toggle();
                    });
                }
            }
        }
        );
}

$(document).ready(function () {
    getHighlights();
    getStandings();
});

function getStandings() {
    fetch("https://api.football-data.org/v2/competitions/2021/standings", {
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

            //run a for loop on array length
            for (let i = 0; i < data.standings[0].table.length; i++) {

                //set teamID to teams id in array. 
                if (data.standings[0].table[i].team.name === userTeamName) {
                    const teamID = data.standings[0].table[i].team.id;
                    getFixtures(teamID);
                }


                const tableRow = $('<tr>');
                const teamPos = $('<td>').text(data.standings[0].table[i].position).attr({ class: "league-pos" });
                const teamCrestContainer = $('<td>').attr({ class: "league-icon" });
                const teamCrestImg = $('<img>').attr({ src: data.standings[0].table[i].team.crestUrl, class: "team-crest-img" });
                const teamName = $('<td>').text(data.standings[0].table[i].team.name).attr({ class: "team-name" });
                const teamForm = $('<span>').attr({ class: "teamForm" });
                const teamWins = $('<span>').text(data.standings[0].table[i].won).attr({ class: "wins" });
                const teamDraws = $('<span>').text(data.standings[0].table[i].draw).attr({ class: "draws" });
                const teamLosses = $('<span>').text(data.standings[0].table[i].lost).attr({ class: "losses" });
                const teamPlayedGames = $('<td>').text(data.standings[0].table[i].playedGames).addClass('gamesPlayedCol');
                const teamGoalsDiff = $('<td>').text(data.standings[0].table[i].goalDifference).addClass('goalDifCol');
                const teamPoints = $('<td>').text(data.standings[0].table[i].points).attr({ class: "points" });

                leagueTableContainer.append(
                    tableRow.append(
                        teamPos,
                        teamCrestContainer.append(teamCrestImg),
                        teamName.append(teamForm.append(
                            teamWins,
                            teamDraws,
                            teamLosses)),
                        teamPlayedGames,
                        teamGoalsDiff,
                        teamPoints
                    )
                );
            }
        });
}

function getTeamLogo(teamID) {
    return fetch(`https://api.football-data.org/v2/teams/${teamID}`, {
        headers: {
            'X-Auth-Token': "d9a5e68af1764fc0acc74a34bc2ebb48"
        },
    })
        .then((response) => response.json())
        .then(function (result) {
            return result.crestUrl
        })
}

function createHomeTeam(name, icon) {
    const iconImg = $("<img>")
    iconImg.attr({ src: icon, class: "team-crest-img" })
    const teamHome = $('<td>').text(name);
    teamHome.append(iconImg)
    return teamHome
}

function createAwayTeam(name, icon) {
    const iconImg = $("<img>")
    iconImg.attr({ src: icon, class: "team-crest-img" })
    const teamAway = $('<td>').text(name);
    teamAway.prepend(iconImg)
    return teamAway
}

function getFixtures(teamID) {
    fetch(`https://api.football-data.org/v2/teams/${teamID}/matches?status=SCHEDULED&dateFROM=${dateToday}`, {
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
        .then(async function (data) {
            console.log(data);
            for (let i = 0; i < 3; i++) {
                const match = data.matches[i]
                const tableRow = $('<tr>');
                const competition = $('<p>').text(match.competition.name).attr({ class: "competition-tag" });
                const utcDate = data.matches[i].utcDate;
                const gameDate = moment.utc(utcDate).local().format("DD - MMM");
                const gameDateLocal = $('<td>').text(gameDate).attr({ class: "date-tag" });
                console.log(gameDate);
                const homeTeamIcon = await getTeamLogo(match.homeTeam.id);
                const awayTeamIcon = await getTeamLogo(match.awayTeam.id);

                const homeTeam = createHomeTeam(match.homeTeam.name, homeTeamIcon).attr({ class: "home-team-tag" });
                const awayTeam = createAwayTeam(match.awayTeam.name, awayTeamIcon).attr({ class: "away-team-tag" });

                const vsEl = $('<p>').text(' vs ').attr({ class: 'vs-tag' });

                fixturesContainerDiv.append(
                    tableRow.append(
                        homeTeam,
                        gameDateLocal.append(vsEl.append(competition)),
                        awayTeam
                    )
                );
            }
        });
};

// adds option to choose another team from the home screen
const backBtn = $('.back-link')

backBtn.on('click', function() {
    localStorage.clear();
    document.location = "https://patricktheodore.github.io/football-highlights-dashboard/";
})



// --------- future development ----------- //

//use other api to display score, and loop through array to find highlights using the away team as key with this api. 

//displaying team name is not needed, re use icon function from below for teams. 

//try and not use async function sam wrote. 

//store icons on page load??? get id and icon url at the same time

//use fetch(`http://api.football-data.org/v2/teams/${teamID}/matches?status=FINISHED`

//if ((response.hometeam.name === userteams opponents || awayteam.name) && (response.awayteam.name === || ....) then load highlights
