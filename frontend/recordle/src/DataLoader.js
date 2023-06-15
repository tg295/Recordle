async function downloadJSON(url) {
    const response = await (fetch(url));
    const content = await (response.json());
    console.log(content);
    return content;
}

function downloadTextFileAndReadToArray(url) {
    return fetch(url)
        .then(response => response.text())
        .then(data => data.split('\n'))
        .then(array => array.filter(item => item.trim() !== ''));
}

async function downloadAlbumList() {
    const response = await (fetch("https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/albums_done.txt"));
    const content = await (response.text());
    const textByLine = content.split("\n");
    console.log(textByLine);
    return textByLine;
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

function getAlbumOfTheDay(answers) {
    const now = new Date()
    const start = new Date(2023, 5, 6)
    console.log(now.toString());
    console.log(start.toString());
    const diff = Number(now) - Number(start)
    let day = Math.floor(diff / (1000 * 60 * 60 * 24))
    /*   while (day > answers.length) {
        day -= answers.length
      } */
    console.log(`album idx: ${day}`);
    console.log(answers[day]);
    return answers[day]
}
function AlbumLoader() {
    const answers = downloadAlbumList();
    console.log(answers);
    const album_id = getAlbumOfTheDay(answers);
    console.log("album of the day: " + album_id);
    const album_data_url = `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/data/${album_id}.json`;
    console.log(album_data_url);

    var album_data = downloadJSON(album_data_url);

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
}

const DataLoader


export default DataLoader;