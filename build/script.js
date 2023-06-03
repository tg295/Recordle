
function evalSubmission() {
    // use regex to determine whether sub is a title or 
    // spotify album ID / URI / URL
    // send either sub type to its relevant eval channel
    // if return True then notify success
    // if return False then notify failure
}

function matchTitle() {
    // try to match title submission to real title
    // return True or False
}

function matchID() {
    // match submitted album identifier to real identifier
    // return True or False
}

async function downloadJSON(url) {
    const response = await (fetch(url));
    const content = await (response.json());
    console.log(content);
    return content;
}

function initGame() {
    // read text file to get album of the day
    // use the album ID to pull the album data from S3
    // return the album data
    const album_id = getAlbumOfTheDay();
    const album_data_url = `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/data/${album_id}.json`;
    console.log(album_data_url);
    var album_data = downloadJSON(album_data_url);
    return album_data

}

function getAlbumClueURL(album_data, n) {
    // for clue n (e.g. 0, 1, 2)
    // return formatted URL for grabbing image 
    // from S3
    return `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${album_data.id}_${album_data.formatted_title}_GEN_${n}.png`
}

function getAlbumAnswerURL(album_data) {
    // for clue n (e.g. 0, 1, 2)
    // return formatted URL for grabbing image 
    // from S3
    return `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${album_data.id}_${album_data.formatted_title}_REAL.png`
}

function getAlbumOfTheDay() {
    const now = new Date()
    const start = new Date(2023, 4, 23)
    console.log(now.toString());
    console.log(start.toString());
    const diff = Number(now) - Number(start)
    let day = Math.floor(diff / (1000 * 60 * 60 * 24))
    /*   while (day > answers.length) {
        day -= answers.length
      } */
    console.log(`album idx: ${day}`);
    return answers[day]
}

const answers = [
    "7nXJ5k4XgRj5OLg9m8V3zc",
    "5h3WJG0aZjNOrayFu3MhCS",
    "04sSPjO9MQFQ6fG4lpBI3G"
]

const album_id = getAlbumOfTheDay();
console.log("album of the day: " + album_id);
const album_data_url = `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/data/${album_id}.json`;
console.log(album_data_url);

var album_data = await downloadJSON(album_data_url);

var answer = document.getElementById("answer0");
answer.src = getAlbumAnswerURL(album_data);
console.log(answer.src);

var clue1 = document.getElementById("clue1");
clue1.src = getAlbumClueURL(album_data, 0);
console.log(clue1.src);

var clue2 = document.getElementById("clue2");
clue2.src = getAlbumClueURL(album_data, 1);
console.log(clue2.src);

var clue3 = document.getElementById("clue3");
clue3.src = getAlbumClueURL(album_data, 2);
console.log(clue3.src);