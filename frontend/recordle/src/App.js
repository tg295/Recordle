import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from "./Components/Footer";
import ImageSlider from "./Components/ImageSlider";
import vinyl from './Images/vinyl.png';
import './fonts.css';
import './index.css';

// TO DO 
// Link to my GitHub
// could have a message like - close! if the simiarity score is high, or close enough if its over the threshold etc.

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = [];
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i === 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

const App = () => {

  const placeholderImage = vinyl; // Replace with your desired placeholder image URL
  const now = new Date();
  const start = new Date(2023, 5, 6);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));

  // const [showClueMessage, setShowClueMessage] = useState(true);
  const [textData, setTextData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(day);
  const [slides, setSlides] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [spotifyLink, setSpotifyLink] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [isIncorrectAnswer, setIsIncorrectAnswer] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isPlusGreyedOut, setIsPlusGreyedOut] = useState(selectedIndex === day);
  const [isMinusGreyedOut, setIsMinusGreyedOut] = useState(selectedIndex === 0);

  const storedDays = JSON.parse(localStorage.getItem('guessedDays')) || [];
  const isDayGuessedCorrectly = (day) => {
    return storedDays.includes(day);
  };
  const isPreviousDay = (selectedIndex, day) => {
    return selectedIndex !== day;
  };
  const [showReleaseDate, setShowReleaseDate] = useState(isDayGuessedCorrectly(selectedIndex));
  const [isAnswerVisible, setIsAnswerVisible] = useState(isDayGuessedCorrectly(selectedIndex));
  const [progressMessage, setProgressMessage] = useState(`${storedDays.length} / ${day}`);
  const [isArtistVisible, setIsArtistVisible] = useState(false);

  useEffect(() => {
    const fetchTextData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/albums_filtered.txt`, { cache: "no-cache" });
        const data = await response.text();
        const dataArray = data.split('\n').filter(item => item.trim() !== '');
        setTextData(dataArray);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchTextData();
  }, []);

  useEffect(() => {
    const fetchJsonData = async () => {
      try {
        if (textData.length > 0) {
          const albumId = textData[selectedIndex];
          const url = `${process.env.REACT_APP_BASE_URL}/data/${albumId}.json`;
          const response = await fetch(url);
          const jsonData = await response.json();
          const newSlides = [
            { url: `${process.env.REACT_APP_BASE_URL}/img/${jsonData.id}_${jsonData.formatted_title}_GEN_0.png`, title: "clue1" },
            { url: `${process.env.REACT_APP_BASE_URL}/img/${jsonData.id}_${jsonData.formatted_title}_GEN_1.png`, title: "clue2" },
            { url: `${process.env.REACT_APP_BASE_URL}/img/${jsonData.id}_${jsonData.formatted_title}_GEN_2.png`, title: "clue3" },
          ];

          const answer = { url: `${process.env.REACT_APP_BASE_URL}/img/${jsonData.id}_${jsonData.formatted_title}_REAL.png`, title: jsonData.title, formatted_title: jsonData.formatted_title, artist: jsonData.artist }

          console.log(isPreviousDay);
          console.log(isDayGuessedCorrectly);
          setJsonData(jsonData);
          setSlides(newSlides);
          setAnswer(answer);
          setSpotifyLink(`https://open.spotify.com/album/${jsonData.id}`);
          // setShowReleaseDate(isDayGuessedCorrectly(selectedIndex)); // Set showReleaseDate based on whether the day is correctly guessed
          // setIsAnswerVisible(isDayGuessedCorrectly(selectedIndex)); // Set isAnswerVisible based on whether the day is correctly guessed
          setShowReleaseDate(isPreviousDay(selectedIndex, day)); // Set showReleaseDate based on whether were on the latest day
          setIsAnswerVisible(isPreviousDay(selectedIndex, day)); // Set isAnswerVisible based on whether were on the latest day
          setIsIncorrectAnswer(false); // Reset the incorrect answer state
          setProgressMessage(`${storedDays.length} / ${day}`); // Update the progress message
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchJsonData();
  }, [selectedIndex, textData]);

  const handleReleaseDateClick = () => {
    setShowReleaseDate(true);
  };

  const handleDayChange = (increment) => {
    const newIndex = selectedIndex + increment;
    if (newIndex >= 0 && newIndex < textData.length) {
      setSelectedIndex(newIndex);
      setIsAnswerVisible(true); // Show the answer slide
      setShowReleaseDate(true);
      setIsArtistVisible(true);
      setIsPlusGreyedOut(newIndex === day); // Update the isPlusGreyedOut state based on the selectedIndex
      setIsMinusGreyedOut(newIndex === 0); // Update the isMinusGreyedOut state based on the selectedIndex

    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let formattedTitle = answer.formatted_title.toLowerCase().replace(/_/g, " ");
    let formattedArtist = answer.artist.toLowerCase().replace(/_/g, " ");
    let inputSimilarityTitle = similarity(formattedTitle, inputValue);
    let inputSimilarityArtist = similarity(formattedArtist, inputValue);
    console.log(inputSimilarityTitle);
    const regex = /([a-zA-Z0-9]{22})/;
    let parsedInput = inputValue.match(regex);
    if (inputSimilarityTitle > 0.8) {
      setIsAnswerVisible(true); // Show the answer slide
      setShowReleaseDate(true); // Show the release date
      setIsIncorrectAnswer(false); // Reset the incorrect answer state
      const storedDays = JSON.parse(localStorage.getItem('guessedDays')) || [];
      if (!storedDays.includes(selectedIndex)) {
        storedDays.push(selectedIndex);
        localStorage.setItem('guessedDays', JSON.stringify(storedDays));
        setProgressMessage(`${storedDays.length} / ${day}`); // Update the progress message
      }
      setInputValue("");
    }
    else if (inputSimilarityArtist > 0.9) {
      setIsArtistVisible(true); // Show the artist
      setInputValue("");
    }
    else if (parsedInput && parsedInput[0] === jsonData.id) {
      setIsAnswerVisible(true); // Show the answer slide
      setShowReleaseDate(true); // Show the release date
      setIsIncorrectAnswer(false); // Reset the incorrect answer state
      const storedDays = JSON.parse(localStorage.getItem('guessedDays')) || [];
      if (!storedDays.includes(selectedIndex)) {
        storedDays.push(selectedIndex);
        localStorage.setItem('guessedDays', JSON.stringify(storedDays));
        setProgressMessage(`${storedDays.length} / ${day}`); // Update the progress message
      }
      setInputValue("");
    } else {
      setIsIncorrectAnswer(true);
      setInputKey((prevKey) => prevKey + 1); // Update the key to trigger re-render
      setInputValue("");
      // Add shake animation or display an error message for wrong answer
    }
  };

  useEffect(() => {
    if (isAnswerVisible) {
      setIsImageVisible(true);
    }
  }, [isAnswerVisible]);

  const TextBox = () => {

    const textBoxStyles = {
      // display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      marginTop: "40px",
      fontSize: "3.5vw",
      position: "relative",

    };

    if (!jsonData) {
      return null; // Return null if jsonData is not yet loaded
    }

    const textBoxContent = isAnswerVisible
      ? `${jsonData.artist} - ${jsonData.title}`
      : isArtistVisible
        ? `${jsonData.artist} - ${jsonData.title.replace(/\S/g, '?')}`
        : `${jsonData.artist.replace(/\S/g, '?')} - ${jsonData.title.replace(/\S/g, '?')}`;

    return <div style={textBoxStyles}>{textBoxContent}</div>;
  };

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setShowClueMessage(false);
  //   }, 4000); // Hide the pulsating message after 4 seconds

  //   return () => clearTimeout(timeout);
  // }, []);

  const containerStyles = {
    width: "100%",
    // height: "100vh", // Set height to 100vh for full-screen
    margin: "0",
    boxSizing: "border-box",
    border: "8px double #e66439",
    // borderStyle: "double", //triple
    borderRadius: "5px",
    // display: "flex",
    padding: "24px",
    position: "relative",
    overflowY: "scroll",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    '@media (maxWidth: 768px)': {
      padding: "20px",
      justifyContent: "center",
    },
  };

  const imgContainerStyles = {
    // bottom: "10px",
    width: "80%",
    height: "80%",
    // margin: "0 auto",
    position: "relative",
    transform: isImageVisible ? 'scale(0.8)  translate(-2%, -20%)' : 'none', // Shrink the container when the answer is correct 
    transition: 'transform 0.3s ease', // Add a smooth transition effect
  };

  const defaultImgStyles = {

    // bottom: "10px",
    width: "80%",
    height: "80%",
    margin: "0 auto",
    position: "relative",
    transition: 'transform 0.3s ease', // Add a smooth transition effect
  };


  const headerContainerStyles = {
    position: "relative",
    marginBottom: "10%",
  };

  const headerStyles = {
    fontFamily: "CustomFont",
    fontSize: "7.5vw",
    fontWeight: "bold",
    color: "black",
    marginTop: "-2px",
    marginBottom: "top",
    textAlign: "center",
    '@media (maxWidth: 768px)': {
      fontSize: "24px",
    },
  };

  const subHeaderStyles = {
    fontFamily: "CustomFont",
    fontSize: "4vw",
    fontWeight: "bold",
    color: "black",
    order: "-1",
    marginTop: "-5px",
    marginBottom: "top",
    textAlign: "center",
    '@media (maxWidth: 768px)': {
      fontSize: "24px",
    },
  };

  const releaseDateStyles = {
    fontFamily: "CustomFont2",
    fontSize: "3vw",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  };

  const answerContainerStyles = {
    transition: 'opacity 0.5s, transform 0.5s',
    opacity: isAnswerVisible ? '1' : '0',
    transform: isAnswerVisible ? 'scale(1)' : 'scale(0.1)',
    width: "35vh",
    height: "22vh",
    margin: "0 auto",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundPosition: "center",
    right: "calc(-30%)",
    bottom: "15vh",
  }

  const anwserStyles = {
    width: "65%",
    height: "100%",
    border: "3px solid #e66439",
    borderRadius: "5px",
    justifyContent: "center",
    alignItems: "center",
  };

  const answerImageStyles = {
    width: "100%",
    height: "100%",
  };

  const plusStyles = {
    position: "fixed",
    top: "12%",
    right: "40px", // Adjust as needed
    fontSize: "10vw",
    color: isPlusGreyedOut ? "#606060" : "#181818",
    zIndex: 1,
    cursor: "pointer",
    transform: "translateY(-50%)", // Center vertically
  };

  const minusStyles = {
    position: "fixed",
    top: "12%",
    left: "40px", // Adjust as needed
    fontSize: "10vw",
    color: isMinusGreyedOut ? "#606060" : "#181818",
    zIndex: 1,
    cursor: "pointer",
    transform: "translateY(-50%)", // Center vertically
  };

  const inputContainerStyles = {
    width: "100%",
    // maxWidth: "900px",
    height: "100%",
    // display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "80px",
    marginLeft: "-5px",
    animation: isAnswerVisible ? 'none' : 'shake 0.4s ease-in-out',
  };

  const inputStyles = {
    width: "65%",
    height: "2%",
    padding: "10px",
    fontSize: "70%",
    border: "3px solid #e66439",
    height: "3vh",
    padding: "8px",
    fontSize: "3vw",
    border: "1vw solid #e66439",
    borderRadius: "5px",
    position: "fixed",
    bottom: "5.2vh",
    // overflow: "hidden",
    fontFamily: "CustomFont2",
    animation: isIncorrectAnswer ? 'shake 0.4s ease-in-out' : 'none',
    alignItems: "center",
    justifyContent: "center",
  };

  const bottomContainerStyles = {
    position: "fixed",
    display: "flex",
    bottom: "10px",
    height: "140px", // Adjust the height as needed
    justifyContent: "center",
    alignItems: "center",
  };

  const enterButtonStyles = {
    // marginLeft: "50px",
    // float: "left",
    // display: "flex",
    padding: "3%",
    fontSize: "5vw",
    background: "#e66439",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "CustomFont2",
    position: "fixed",
    left: "82%",
    bottom: "5.3vh",
    alignItems: "bottom",
    justifyContent: "bottom",
  };

  const shakeAnimationStyles = {
    // animation: "shake 0.5s",
    animation: isIncorrectAnswer ? 'shake 0.4s ease-in-out' : 'none',
  };

  const progressMessageStyles = {
    fontFamily: "CustomFont2",
    fontSize: "16px",
    fontWeight: "bold",
    color: "black",
    marginTop: "-2px",
    top: "1%",
    right: "2%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  }

  // const pulsatingMessageStyles = {
  //   position: 'absolute',
  //   top: '50%',
  //   left: '50%',
  //   transform: 'translate(-50%, -50%)',
  //   display: 'flex',
  //   alignItems: 'center',
  //   fontSize: '14px',
  //   fontWeight: 'bold',
  //   padding: '10px',
  //   borderRadius: '5px',
  //   animation: 'pulsate 1s infinite',
  // };

  // const arrowStyles = {
  //   position: 'absolute',
  //   top: '50%',
  //   left: 'calc(50% + 50px)',
  //   transform: 'translate(-50%, -50%)',
  //   display: 'inline-block',
  //   padding: '4px',
  //   transform: 'rotate(45deg)',
  // };

  const gifStyles = {
    transition: 'opacity 0.3s, transform 0.5s',
    opacity: isDayGuessedCorrectly(selectedIndex) ? '0.6' : '0',
    transform: isDayGuessedCorrectly(selectedIndex) ? 'scale(1)' : 'scale(0.1)',
    border: "none",
    width: "100px",
    height: "200px",
    top: "60vh",
    left: "6vw",
    position: "absolute",
  }

    position: "absolute",
  }

  const spotifyLinkStyles = {
    transition: 'opacity 0.5s, transform 0.5s',
    opacity: isAnswerVisible ? '1' : '0',
    transform: isAnswerVisible ? 'scale(1)' : 'scale(0.1)',
    height: "30px",
    width: "30px",
    position: "absolute",
    top: "90%",
    left: "80%",
    animation: "spin 4s linear infinite",
  }

  return (
    <div style={containerStyles}>
      <Router>
        <div>
          <div style={headerContainerStyles} >
            <h1 style={headerStyles}>Recordle</h1>
            <div style={minusStyles} onClick={() => handleDayChange(-1)}>{'-'}</div>
            <div style={plusStyles} onClick={() => handleDayChange(1)}>{'+'}</div>
            <h2 style={subHeaderStyles}>Day {selectedIndex}</h2>

            {/* <h3 style={subHeaderStyles}>Guess the song</h3> */}
            <TextBox />
            {jsonData && (
              <p
                style={releaseDateStyles}
                onClick={handleReleaseDateClick}
              >
                Year of release: {showReleaseDate ? jsonData.release_date.substring(0, 4) : "????"}
              </p>
            )}
            <a href={spotifyLink} target="_blank" rel="noopener noreferrer">
              <img style={spotifyLinkStyles} src="https://pixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com/image/8554553e351ae8c.png" alt="Spotify link"></img>
            </a>
            {/* {showClueMessage && (
              <div style={pulsatingMessageStyles}>
                <span>Click me for a clue!</span>
                <span style={arrowStyles}></span>
              </div>
            )} */}
          </div>
          <div style={isAnswerVisible ? imgContainerStyles : defaultImgStyles}>
            {slides.length > 0 && jsonData ? (
              <ImageSlider slides={slides} />
            ) : (
              <p>Loading slides...</p>
            )}
          </div>
          <div style={answerContainerStyles}>
            {answer && (
              <div style={anwserStyles}>
                {isAnswerVisible ? (
                  <img src={answer.url} alt={answer.title} style={answerImageStyles} />
                ) : (<img src={placeholderImage} alt="Placeholder" style={answerImageStyles} />)}
              </div>
            )}
          </div>
          <iframe src="https://giphy.com/embed/4oMoIbIQrvCjm" style={gifStyles} class="gifyEmbed"></iframe><p><a href="https://giphy.com/gifs/the-simpsons-bart-simpson-4oMoIbIQrvCjm"></a></p>
          <div>  <p style={progressMessageStyles}>{progressMessage}</p></div>
          <div style={bottomContainerStyles}>
            <form onSubmit={handleSubmit}>
              <div id="input-container" style={{ ...inputContainerStyles, ...(isAnswerVisible ? {} : shakeAnimationStyles) }}>

                <input
                  key={inputKey}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  style={inputStyles}
                  placeholder="Enter album title / Spotify ID"
                  autoFocus
                />
                <button type="submit" style={enterButtonStyles}>Go</button>

              </div>
            </form>
          </div>
        </div>
        <Footer />
      </Router >
    </div >
  );
};

export default App;

