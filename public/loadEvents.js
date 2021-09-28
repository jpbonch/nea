// function todayOrYesterday(date){
//   if
// }

function loadNbaEvents(){
    fetch("/events/nba")
    .then(response => response.json())
    .then(jsonResult => {console.log(jsonResult); return jsonResult})
    .then(jsonResult => display(jsonResult))

    function display(jsonResult){
        for (let event of jsonResult.api.games){
            var box = document.createElement("div");
            box.addEventListener("click", () => {window.location = "/chat/nba/" + event.gameId}, false)
            box.innerText = event.startTimeUTC;
            box.innerText += " " + event.vTeam.fullName;
            box.innerText += " vs" + event.hTeam.fullName;
            box.className = "box";
            document.getElementById("container").appendChild(box);
        }
    }
}

<div></div>
document.getElementById("nbaButton").addEventListener("click", loadNbaEvents, false)
