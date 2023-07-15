import React, { useEffect, useState } from 'react';
import ScaleText from "react-scale-text";
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from "./Components/Footer";
import ImageSlider from "./Components/ImageSlider";
import vinyl from './Images/vinyl.png';
import './fonts.css';
import './index.css';
import { text } from '@fortawesome/fontawesome-svg-core';

// TO DO 
// Link to my GitHub
// could have a message like - close! if the simiarity score is high, or close enough if its over the threshold etc.
// show words that are guessed correctly
// fix layout better
// get loading screen to work, unified
// edit list better

// const delay = ms => new Promise(res => setTimeout(res, ms));
// const wait1sec = async () => {
//   await delay(8000);
//   console.log("Waited 5s");
// };

function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0, index, indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

function wordInThing(word, thing) {
  return thing.toLowerCase().indexOf(word.toLowerCase());
}

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
  // const [isLoading, setIsLoading] = useState(false);
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
  const revealedDays = JSON.parse(localStorage.getItem('revealedDays')) || [];

  const isDayGuessedCorrectly = (day) => {
    return storedDays.includes(day);
  };
  const isDayRevealed = (day) => {
    return revealedDays.includes(day);
  };

  const isPreviousDay = (selectedIndex, day) => {
    return selectedIndex !== day;
  };
  const [showReleaseDate, setShowReleaseDate] = useState(isDayGuessedCorrectly(selectedIndex));
  const [isAnswerVisible, setIsAnswerVisible] = useState(isDayGuessedCorrectly(selectedIndex));

  const [progressMessage, setProgressMessage] = useState(`${storedDays.length} / ${day}`);
  const [isArtistVisible, setIsArtistVisible] = useState(false);
  const [isArtistGifVisible, setIsArtistGifVisible] = useState(false);
  const [isReleaseDateGifVisible, setIsReleaseDateGifVisible] = useState(false);
  var [content, setContent] = useState("");

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
        // setIsLoading(true);
        // console.log(isLoading);
        if (textData.length > 0) {
          const albumId = textData[selectedIndex];
          const url = `${process.env.REACT_APP_BASE_URL}/data/${albumId}.json`;
          // const response = await fetch(url);
          const response = await fetch(url, { cache: "no-store" });
          const jsonData = await response.json();
          const newSlides = [
            { url: `${process.env.REACT_APP_BASE_URL}/img/${jsonData.id}_${jsonData.formatted_title}_GEN_0.png`, title: "clue1" },
            { url: `${process.env.REACT_APP_BASE_URL}/img/${jsonData.id}_${jsonData.formatted_title}_GEN_1.png`, title: "clue2" },
            { url: `${process.env.REACT_APP_BASE_URL}/img/${jsonData.id}_${jsonData.formatted_title}_GEN_2.png`, title: "clue3" },
          ];

          const answer = { url: `${process.env.REACT_APP_BASE_URL}/img/${jsonData.id}_${jsonData.formatted_title}_REAL.png`, title: jsonData.title, formatted_title: jsonData.formatted_title, artist: jsonData.artist }

          setJsonData(jsonData);
          setSlides(newSlides);
          setAnswer(answer);
          if (isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)) {
            setContent(`${jsonData.artist} - ${jsonData.title}`)
            setShowReleaseDate(true);
            setIsAnswerVisible(true);
          }
          else {
            setContent(`${jsonData.artist.replace(/\S/g, '_')} - ${jsonData.title.replace(/\S/g, '_')}`);
            setShowReleaseDate(false);
            setIsAnswerVisible(false);
          }
          if (isPreviousDay(selectedIndex, day)) {
            setSpotifyLink(`https://open.spotify.com/album/${jsonData.id}`);
          } else {
            setSpotifyLink(null);
          }
          // if (isPreviousDay(selectedIndex, day)) {
          //   setShowReleaseDate(isPreviousDay(selectedIndex, day)); // Set showReleaseDate based on whether were on the latest day
          //   setIsAnswerVisible(isPreviousDay(selectedIndex, day)); // Set isAnswerVisible based on whether were on the latest day
          // }
          // else {
          //   setShowReleaseDate(isDayGuessedCorrectly(selectedIndex)); // Set showReleaseDate based on whether the day is correctly guessed
          //   setIsAnswerVisible(isDayGuessedCorrectly(selectedIndex)); // Set isAnswerVisible based on whether the day is correctly guessed
          // }
          setIsIncorrectAnswer(false); // Reset the incorrect answer state
          setProgressMessage(`${storedDays.length} / ${day}`); // Update the progress message
        }
        // setIsLoading(false);
        // console.log(isLoading);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchJsonData();
  }, [selectedIndex, textData]);

  const handleRevealClick = () => {
    setShowReleaseDate(true);
    setIsAnswerVisible(true);
    setIsImageVisible(true);
    setContent(`${jsonData.artist} - ${jsonData.title}`)
    const revealedDays = JSON.parse(localStorage.getItem('revealedDays')) || [];
    if (!revealedDays.includes(selectedIndex)) {
      revealedDays.push(selectedIndex);
      localStorage.setItem('revealedDays', JSON.stringify(revealedDays));
    }

  };
  const handleReleaseDateClick = () => {
    setShowReleaseDate(true);
    if (!isDayGuessedCorrectly(selectedIndex)) {
      setIsReleaseDateGifVisible(true);
    }
    // if (selectedIndex === day) {
    //   setIsReleaseDateGifVisible(true);
    // }
  };

  const handleDayChange = (increment) => {
    // setIsLoading(true);
    // console.log(isLoading);
    const newIndex = selectedIndex + increment;
    // console.log(newIndex);
    // console.log(day);
    if (newIndex >= 0 && newIndex < textData.length) {
      setSelectedIndex(newIndex);
      // setShowReleaseDate(true);
      setIsPlusGreyedOut(newIndex === day); // Update the isPlusGreyedOut state based on the selectedIndex
      setIsMinusGreyedOut(newIndex === 0); // Update the isMinusGreyedOut state based on the selectedIndex
      setIsArtistGifVisible(false);
      setIsReleaseDateGifVisible(false);
      // setIsAnswerVisible(true); // Show the answer slide
    }
    setIsArtistGifVisible(false);
    setIsArtistVisible(false);
    setIsReleaseDateGifVisible(false);
    // if (newIndex === day) {
    //   // console.log("hellooooo")
    //   if (isAnswerVisible === true) {
    //     setIsArtistGifVisible(false);
    //     setIsReleaseDateGifVisible(false);
    //     // console.log("there");
    //   }
    //   else {
    //     if (isArtistVisible === true) {
    //       setIsArtistGifVisible(true);
    //     }
    //     // console.log("hiiii");
    //     if (showReleaseDate === true) {
    //       setShowReleaseDate(true);
    //       setIsReleaseDateGifVisible(true);
    //     }
    //   }
    // }
    // setIsLoading(false);
    // console.log(isLoading);
  };

  // let textBoxContent = isAnswerVisible
  //   ? `${jsonData.artist} - ${jsonData.title}`
  //   : isArtistVisible
  //     ? `${jsonData.artist} - ${jsonData.title.replace(/\S/g, '_')}`
  //     : `${jsonData.artist.replace(/\S/g, '_')} - ${jsonData.title.replace(/\S/g, '_')}`

  const handleSubmit = (event) => {
    event.preventDefault();
    let textAnswerRevealed = `${jsonData.artist} - ${jsonData.title}`;
    let formattedTitle = answer.formatted_title.toLowerCase().replace(/_/g, " ");
    let formattedArtist = answer.artist.toLowerCase().replace(/_/g, " ");
    let inputSimilarityTitle = similarity(formattedTitle, inputValue);
    let inputSimilarityArtist = similarity(formattedArtist, inputValue);
    console.log(inputSimilarityTitle);
    const regex = /([a-zA-Z0-9]{22})/;
    let parsedInput = inputValue.match(regex);
    if (inputSimilarityTitle > 0.8) {
      setContent(textAnswerRevealed);
      setIsAnswerVisible(true); // Show the answer slide
      setShowReleaseDate(true); // Show the release date
      setIsIncorrectAnswer(false); // Reset the incorrect answer state
      const storedDays = JSON.parse(localStorage.getItem('guessedDays')) || [];
      if (!storedDays.includes(selectedIndex)) {
        storedDays.push(selectedIndex);
        localStorage.setItem('guessedDays', JSON.stringify(storedDays));
        setProgressMessage(`${storedDays.length} / ${day}`); // Update the progress message
      }
      setIsArtistGifVisible(false);
      setIsReleaseDateGifVisible(false);
      setInputValue("");
    }
    else if (parsedInput && parsedInput[0] === jsonData.id) {
      setContent(textAnswerRevealed);
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
      setIsArtistGifVisible(false);
      setIsReleaseDateGifVisible(false);
    }
    else if (inputSimilarityArtist > 0.9) {
      var revealedContent = content;
      const words = formattedArtist.split(" ");
      for (var i = 0; i < words.length; i++) {
        const idx = wordInThing(words[i], textAnswerRevealed)
        if (idx >= 0) {
          var word = words[i];
          for (var j = 0; j < word.length; j++) {
            var revealedContent = setCharAt(revealedContent, idx + j, word[j]);
          }
          setContent(revealedContent);
        }
      }
      setIsArtistVisible(true); // Show the artist
      setIsArtistGifVisible(true); // Show the gif
      setInputValue("");
    }
    else {
      var revealedContent = content;
      const words = inputValue.split(" ");
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var indices = getIndicesOf(word, textAnswerRevealed);
        if (indices) {
          for (var j = 0; j < indices.length; j++) {
            for (var k = 0; k < word.length; k++) {
              var revealedContent = setCharAt(revealedContent, indices[j] + k, word[k]);
            }
            setContent(revealedContent);
          }
        }
      }
      const formattedRevealedArtist = revealedContent.split(" - ")[0].toLowerCase()
      const formattedRevealedTitle = revealedContent.split(" - ")[1].toLowerCase()

      let contentSimilarityArtist = similarity(formattedArtist, formattedRevealedArtist);
      let contentSimilarityTitle = similarity(formattedTitle, formattedRevealedTitle);

      if (contentSimilarityTitle > 0.99) {
        setContent(textAnswerRevealed);
        setIsAnswerVisible(true); // Show the answer slide
        setShowReleaseDate(true); // Show the release date
        setIsIncorrectAnswer(false); // Reset the incorrect answer state
        const storedDays = JSON.parse(localStorage.getItem('guessedDays')) || [];
        if (!storedDays.includes(selectedIndex)) {
          storedDays.push(selectedIndex);
          localStorage.setItem('guessedDays', JSON.stringify(storedDays));
          setProgressMessage(`${storedDays.length} / ${day}`); // Update the progress message
        }
        setIsArtistGifVisible(false);
        setIsReleaseDateGifVisible(false);
      }
      else if (contentSimilarityArtist > 0.99) {
        setIsArtistVisible(true); // Show the artist
        setIsArtistGifVisible(true); // Show the gif
      }
      setInputKey((prevKey) => prevKey + 1); // Update the key to trigger re-render
      setInputValue("");
    }
  };

  useEffect(() => {
    if (isAnswerVisible) {
      setIsImageVisible(true);
    }
  }, [isAnswerVisible]);

  const TextBox = ({ content }) => {

    const textBoxParentStyles = {
      width: "100px",
      height: "50px",
      justifyContent: "center",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      // marginLeft: "20px"

    }

    const textBoxStyles = {
      // display: "flex",
      flexDirection: "row",
      // justifyContent: "center",
      // alignItems: "center",
      textAlign: "center",
      marginTop: "25px",
      marginBottom: "1px",
      // marginBottom: "calc(5% - 3vw)",
      padding: "5px",
      // transform: "translateY(-70%)",
      // top: "50%",
      // maxHeight: "15px",
      // fontSize: "min(4vw, 35px)",
      position: "relative",

    };

    if (!jsonData) {
      return null; // Return null if jsonData is not yet loaded
    }

    // if (isAnswerVisible) {
    //   setTextDisplayed(`${jsonData.artist} - ${jsonData.title}`);
    // }
    // else if (isArtistVisible) {
    //   setTextDisplayed(`${jsonData.artist} - ${jsonData.title.replace(/\S/g, '_')}`);
    // }
    // else {
    //   setTextDisplayed(`${jsonData.artist.replace(/\S/g, '_')} - ${jsonData.title.replace(/\S/g, '_')}`);
    // }

    // return <div className="parent" style={textBoxParentStyles}>
    //   <ScaleText style={{ alignItems: "center", justifyContent: "center", display: "flex", textAlign: "center", right: "50%" }}>
    //     <p style={textBoxStyles} className="child">{textBoxContent}</p>
    //   </ScaleText>
    // </div>;
    return <div style={textBoxStyles}>{content}</div>;
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
    transform: isImageVisible ? 'scale(0.8)  translate(-2vw, -2vw)' : 'none', // Shrink the container when the answer is correct 
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
    marginBottom: "10px",
  };

  const headerStyles = {
    fontFamily: "CustomFont",
    fontSize: "7.5vmin",
    fontWeight: "bold",
    color: "black",
    marginTop: "-2px",
    marginBottom: "2vmax",
    textAlign: "center",
    '@media (maxWidth: 768px)': {
      fontSize: "24px",
    },
  };

  const subHeaderStyles = {
    fontFamily: "CustomFont",
    fontSize: "5vmin",
    fontWeight: "bold",
    color: "black",
    order: "-1",
    marginTop: "-1vh",
    marginBottom: "2vmax",
    textAlign: "center",
    '@media (maxWidth: 768px)': {
      fontSize: "24px",
    },
  };

  const releaseDateStyles = {
    fontFamily: "CustomFont2",
    fontSize: "min(3vmin, 30px)",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "3vw",
    marginTop: "0.5vw",
    // position: "relative"
    // maxBottom: "1000px",
  };

  const answerContainerStyles = {
    transition: 'opacity 0.5s, transform 0.5s',
    opacity: isAnswerVisible ? '1' : '0',
    transform: isAnswerVisible ? 'scale(1)' : 'scale(0.1)',
    width: "55vmin",
    height: "33vmin",
    maxWidth: "400px",
    maxHeight: "240px",
    margin: "0 auto",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundPosition: "center",
    right: "-30vmin",
    bottom: "20vw",
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
    position: "absolute",
    top: "20%",
    right: "10px", // Adjust as needed
    fontSize: "10vw",
    color: isPlusGreyedOut ? "#606060" : "#181818",
    zIndex: 1,
    cursor: "pointer",
    transform: "translateY(-50%)", // Center vertically
  };

  const minusStyles = {
    position: "absolute",
    top: "20%",
    left: "10px", // Adjust as needed
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
    marginBottom: "5vh",
    marginLeft: "-5px",
  };

  const bottomContainerStyles = {
    position: "absolute",
    // display: "flex",
    width: "100%",
    bottom: "5vh",
    height: "140px", // Adjust the height as needed
    justifyContent: "center",
    alignItems: "center",
  };

  const inputStyles = {
    width: "65vw",
    marginLeft: "5%",
    height: "3vmin",
    padding: "1vmin",
    fontSize: "3vmin",
    border: "1vmin solid #e66439",
    borderRadius: "5px",
    position: "absolute",
    bottom: "50px",
    // overflow: "hidden",
    fontFamily: "CustomFont2",
    animation: isIncorrectAnswer ? 'shake 0.4s ease-in-out' : 'none',
    // alignItems: "center",
    // justifyContent: "center",
  };

  const enterButtonStyles = {
    // marginLeft: "0px",
    // float: "left",
    // display: "flex",
    height: "8vmin",
    padding: "1vmin",
    fontSize: "5vmin",
    background: "#e66439",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "CustomFont2",
    position: "absolute",
    right: "-15px",
    bottom: "5px",
    // alignItems: "bottom",
    // justifyContent: "bottom",
  };

  const progressMessageStyles = {
    fontFamily: "CustomFont2",
    fontSize: "4vmin",
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

  const gif2styles = {
    transition: 'opacity 0.3s, transform 0.5s',
    opacity: isArtistGifVisible ? '0.6' : '0',
    transform: isArtistGifVisible ? 'scale(1)' : 'scale(0.1)',
    border: "none",
    width: "100px",
    height: "200px",
    top: "65vh",
    left: "6vw",
    position: "absolute",
  }

  const gif3styles = {
    transition: 'opacity 0.3s, transform 0.5s',
    opacity: isReleaseDateGifVisible ? '0.6' : '0',
    transform: isReleaseDateGifVisible ? 'scale(1)' : 'scale(0.1)',
    border: "none",
    width: "90px",
    height: "120px",
    top: "70vh",
    right: "6vw",
    position: "absolute",
  }

  const spotifyLinkStyles = {
    transition: 'opacity 0.5s, transform 0.5s',
    opacity: isAnswerVisible ? '1' : '0',
    transform: isAnswerVisible ? 'scale(1)' : 'scale(0.1)',
    height: "5vmin",
    width: "5vmin",
    position: "absolute",
    top: "18vh",
    left: "65vw",
    animation: "spin 4s linear infinite",
  }

  const revealButtonStyles = {
    fontFamily: "CustomFont2",
    top: "-15px",
    left: "-15px",
    position: "absolute",
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div style={containerStyles}>
      <Router>
        <div>
          <div style={headerContainerStyles} >
            <h1 style={headerStyles}>Recordle</h1>
            <div style={minusStyles} onClick={() => handleDayChange(-1)}>{'-'}</div>
            <div style={plusStyles} onClick={() => handleDayChange(1)}>{'+'}</div>
            <h2 style={subHeaderStyles}>Day {selectedIndex}</h2>
            <button
              style={revealButtonStyles}
              onClick={handleRevealClick}
              disabled={selectedIndex === day || isAnswerVisible}
            >
              Reveal
            </button>
            {/* <h3 style={subHeaderStyles}>Guess the song</h3> */}
            <TextBox content={content} />
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
          <iframe src="https://giphy.com/embed/DpPUDW4XTw4EM" style={gif2styles} class="giphyEmbed"></iframe><p><a href="https://giphy.com/gifs/reaction-a5viI92PAF89q"></a></p>
          <iframe src="https://giphy.com/embed/a5viI92PAF89q" style={gif3styles} class="giphy-embed"></iframe><p><a href="https://giphy.com/gifs/lol-futurama-humor-cFgb5p5e1My3K"></a></p>
          <div>  <p style={progressMessageStyles}>{progressMessage}</p></div>
          <div style={bottomContainerStyles}>
            <form onSubmit={handleSubmit}>
              <div id="input-container" style={inputContainerStyles}>

                <input
                  // disabled={isPreviousDay(selectedIndex, day)}
                  disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)}
                  key={inputKey}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  style={inputStyles}
                  placeholder="Enter album title/id OR artist"
                  autoFocus
                />
                {/* <button disabled={isPreviousDay(selectedIndex, day)} type="submit" style={enterButtonStyles}>Go</button> */}
                <button disabled={isDayGuessedCorrectly(selectedIndex)} type="submit" style={enterButtonStyles}>Go</button>
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

