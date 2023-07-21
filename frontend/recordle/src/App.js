import React, { useEffect, useState } from 'react';
// import ScaleText from "react-scale-text";
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from "./Components/Footer";
import ImageSlider from "./Components/ImageSlider";
import vinyl from './Images/vinyl.png';
import './fonts.css';
import './index.css';
import Blink from 'react-blink-text';
import { ColorRing } from 'react-loader-spinner'
import { text } from '@fortawesome/fontawesome-svg-core';


// import { text } from '@fortawesome/fontawesome-svg-core';
// import styled, { keyframes } from 'styled-components';
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

const removeAccents = str =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const scrollToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
};

function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen === 0) {
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
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [textData, setTextData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(day);
  const [slides, setSlides] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [spotifyLink, setSpotifyLink] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
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

  // const isPreviousDay = (selectedIndex, day) => {
  //   return selectedIndex !== day;
  // };
  const [showReleaseDate, setShowReleaseDate] = useState(isDayGuessedCorrectly(selectedIndex));
  const [isAnswerVisible, setIsAnswerVisible] = useState(isDayGuessedCorrectly(selectedIndex));

  const [progressMessage, setProgressMessage] = useState(`${storedDays.length} / ${day}`);
  // const [isArtistVisible, setIsArtistVisible] = useState(false);
  // const [isArtistGifVisible, setIsArtistGifVisible] = useState(false);
  // const [isReleaseDateGifVisible, setIsReleaseDateGifVisible] = useState(false);
  var [content, setContent] = useState("");

  useEffect(() => {
    const fetchTextData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/albums_filtered.txt`, { cache: "no-cache" });
        const data = await response.text();
        const dataArray = data.split('\n').filter(item => item.trim() !== '');
        setTextData(dataArray);
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchTextData();
  }, []);

  useEffect(() => {
    const fetchJsonData = async () => {
      try {
        setIsLoading(true);
        // console.log(isLoading);
        if (textData.length > 0) {
          const albumId = textData[selectedIndex];
          const url = `${process.env.REACT_APP_BASE_URL}/data/${albumId}.json`;
          const response = await fetch(url);
          // const response = await fetch(url, { cache: "no-store" });
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
            setSpotifyLink(`https://open.spotify.com/album/${jsonData.id}`);
          }
          else {
            setContent(`${jsonData.artist.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/g, '_')} - ${jsonData.title.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/g, '_')}`);
            setShowReleaseDate(false);
            setIsAnswerVisible(false);
            setSpotifyLink(null);
          }
          // if (isPreviousDay(selectedIndex, day)) {
          //   setSpotifyLink(`https://open.spotify.com/album/${jsonData.id}`);
          // } else {
          //   setSpotifyLink(null);
          // }
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
        setIsLoading(false);
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
      // setIsReleaseDateGifVisible(true);
    }
    // if (selectedIndex === day) {
    //   setIsReleaseDateGifVisible(true);
    // }
  };

  const handleDayChange = (increment) => {
    setAttempts(0);
    setIsCorrectAnswer(false);
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
      // setIsArtistGifVisible(false);
      // setIsReleaseDateGifVisible(false);
      // setIsAnswerVisible(true); // Show the answer slide
    }
    // setIsArtistGifVisible(false);
    // setIsArtistVisible(false);
    // setIsReleaseDateGifVisible(false);
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

  const handleAttempts = (attempts) => {
    if (attempts === 1) {
      return "hole in one";
    }
    else if (attempts === 2) {
      return "eagle";
    }
    else if (attempts === 3) {
      return "birdie";
    }
    else if (attempts === 4) {
      return "par";
    }
    else if (attempts === 5) {
      return "bogey";
    }
    else if (attempts === 6) {
      return "double bogey";
    }
    else if (attempts === 7) {
      return "triple bogey";
    }
    else {
      return `done in ${attempts} ...`;
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setAttempts(attempts + 1);
    let textAnswerRevealed = `${jsonData.artist} - ${jsonData.title}`;
    let formattedTitle = answer.formatted_title.toLowerCase().replace(/_/g, " ");
    let formattedArtist = answer.artist.toLowerCase().replace(/_/g, " ");
    let inputSimilarityTitle = similarity(removeAccents(formattedTitle), inputValue);
    let inputSimilarityArtist = similarity(removeAccents(formattedArtist), inputValue);
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
      // setIsArtistGifVisible(false);
      // setIsReleaseDateGifVisible(false);
      setInputValue("");
      setIsCorrectAnswer(true);
      setSpotifyLink(`https://open.spotify.com/album/${jsonData.id}`);

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
      // setIsArtistGifVisible(false);
      // setIsReleaseDateGifVisible(false);
      setIsCorrectAnswer(true);
      setSpotifyLink(`https://open.spotify.com/album/${jsonData.id}`);

    }
    else if (inputSimilarityArtist > 0.9) {
      var revealedContent = content;
      const words = formattedArtist.split(" ");
      for (var i = 0; i < words.length; i++) {
        const idx = wordInThing(words[i].toLowerCase(), textAnswerRevealed.toLowerCase())
        if (idx >= 0) {
          var word = words[i];
          for (var j = 0; j < word.length; j++) {
            var revealedContent = setCharAt(revealedContent, idx + j, word[j]);
          }
          setContent(revealedContent);
        }
      }
      // setIsArtistVisible(true); // Show the artist
      // setIsArtistGifVisible(true); // Show the gif
      setInputValue("");
    }
    else {
      var revealedContent = content;
      // const answerWords = " " + textAnswerRevealed;
      const words = inputValue.split(" ");
      for (var i = 0; i < words.length; i++) {
        var word = words[i].toLowerCase();
        // const re = new RegExp(`/\b${word}\b/`);
        const re = RegExp(`\\b${word}\\b`, 'g');
        let allMatchItr = textAnswerRevealed.toLowerCase().matchAll(re);
        var indices = [];
        let m = null;
        for (m of allMatchItr) {
          indices.push(m.index);
        }
        // var indices = getIndicesOf(word, answerWords);
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

      if (contentSimilarityTitle > 0.90) {
        setContent(textAnswerRevealed);
        setIsAnswerVisible(true); // Show the answer slide
        setShowReleaseDate(true); // Show the release date
        setIsIncorrectAnswer(false); // Reset the incorrect answer state
        setIsCorrectAnswer(true);
        setSpotifyLink(`https://open.spotify.com/album/${jsonData.id}`);
        const storedDays = JSON.parse(localStorage.getItem('guessedDays')) || [];
        if (!storedDays.includes(selectedIndex)) {
          storedDays.push(selectedIndex);
          localStorage.setItem('guessedDays', JSON.stringify(storedDays));
          setProgressMessage(`${storedDays.length} / ${day}`); // Update the progress message
        }
        // setIsArtistGifVisible(false);
        // setIsReleaseDateGifVisible(false);
      }
      else if (contentSimilarityArtist > 0.99) {
        // setIsArtistVisible(true); // Show the artist
        // setIsArtistGifVisible(true); // Show the gif
      }
      setInputKey((prevKey) => prevKey + 1); // Update the key to trigger re-render
      setInputValue("");
    }
    // console.log(content);
  };

  useEffect(() => {
    if (isAnswerVisible) {
      setIsImageVisible(true);
    }
  }, [isAnswerVisible]);

  const TextBox = ({ content }) => {

    const textBoxParentStyles = {
      width: "100%",
      // marginTop: "0.1vh",
      // marginBottom: "0.1vh",
      height: "calc(60px - 2vw)",
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
      marginTop: "3vh",
      // marginBottom: "10px",
      // marginBottom: "calc(5% - 3vw)",
      padding: "2px",
      // transform: "translateY(-70%)",
      // top: "50%",
      // maxHeight: "15px",
      fontSize: "min(4vw, 40px)",
      position: "relative",

    };

    if (!jsonData) {
      return null; // Return null if jsonData is not yet loaded
    }
    return <div className="parent" style={textBoxParentStyles}>
      <p style={textBoxStyles}>{content}</p>
    </div>;
    // return <div className="parent" style={textBoxParentStyles}>
    //   <ScaleText style={{ alignItems: "center", justifyContent: "center", display: "flex", textAlign: "center", right: "50%" }}>
    //     <p style={textBoxStyles} className="child">{content}</p>
    //   </ScaleText>
    // </div>;
    // return <div className="parent" style={textBoxParentStyles}>
    //   <div id="my-content">{content}</div>
    //   <script src="fitty.min.js"></script>
    //   <script>
    //     fitty('#my-content', minSize=20, maxSize=200)
    //   </script>
    // </div>
    // return <div style={textBoxStyles}>{content}</div>;
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
    position: "fixed",
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
    width: "100%",
    height: "100%",
    // margin: "0 auto",
    position: "relative",
    transform: isImageVisible ? 'scale(0.85)  translate(-10vw, -6vh)' : 'none', // Shrink the container when the answer is correct 
    transition: 'transform 0.3s ease', // Add a smooth transition effect
  };

  const defaultImgStyles = {

    // bottom: "10px",
    top: "20%",
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

  // const spotifyLinkStyles = {
  //   transition: 'opacity 0.5s, transform 0.5s',
  //   opacity: isAnswerVisible ? '1' : '0',
  //   transform: isAnswerVisible ? 'scale(1)' : 'scale(0.1)',
  //   marginTop: "2vh",
  //   // marginBottom: "2vmax",
  //   height: "5vmin",
  //   width: "5vmin",
  //   position: "absolute",
  //   top: "30px",
  //   left: "65%",
  //   // transform: "translate(0%, -50%)",
  //   animation: "spin 4s linear infinite",
  // }


  const releaseDateStyles = {
    fontFamily: "CustomFont2",
    fontSize: "min(3vmin, 30px)",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "3px",
    marginTop: "4vmin",
    // position: "relative"
    // maxBottom: "1000px",
  };

  const answerContainerStyles = {
    transition: 'opacity 0.5s, transform 0.5s',
    opacity: isAnswerVisible ? '1' : '0',
    transform: isAnswerVisible ? 'scale(1)' : 'scale(0.1)',
    width: "40vmin",
    height: "40vmin",
    maxWidth: "300px",
    maxHeight: "300px",
    margin: "0 auto",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundPosition: "center",
    right: "-10vw",
    bottom: "24vw",
    // marginBottom: "200px",
  }

  const anwserStyles = {
    width: "100%",
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
    top: "9%",
    right: "40px", // Adjust as needed
    fontSize: "10vw",
    color: isPlusGreyedOut ? "#606060" : "#181818",
    zIndex: 1,
    cursor: "pointer",
    transform: "translateY(-10%)", // Center vertically
  };

  const minusStyles = {
    position: "fixed",
    top: "9%",
    left: "40px", // Adjust as needed
    fontSize: "10vw",
    color: isMinusGreyedOut ? "#606060" : "#181818",
    zIndex: 1,
    cursor: "pointer",
    transform: "translateY(-10%)", // Center vertically
  };

  const bottomContainerStyles = {
    position: "fixed",
    width: "100%",
    bottom: "calc(10vh - 80px)",
    height: "140px", // Adjust the height as needed
    left: "3%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const inputContainerStyles = {
    width: "100%",
    height: "100%",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const inputStyles = {
    width: "65vw",
    height: "3vh",
    padding: "1vmin",
    fontSize: "2.5vmin",
    border: "1vmin solid #e66439",
    borderRadius: "5px",
    position: "relative",
    fontFamily: "CustomFont2",
    animation: isIncorrectAnswer ? "shake 0.4s ease-in-out" : "none",
  };

  const enterButtonStyles = {
    height: "20%",
    width: "10vmin",
    padding: "3vmin",
    fontSize: "3vmin",
    background: "#e66439",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "CustomFont2",
    position: "relative",
    marginLeft: "1vmin",
  };

  const progressMessageStyles = {
    fontFamily: "CustomFont2",
    fontSize: "4vmin",
    // fontWeight: "bold",
    color: "#87469B",
    marginTop: "-3px",
    top: "1.5%",
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

  // const gifStyles = {
  //   transition: 'opacity 0.3s, transform 0.5s',
  //   opacity: isDayGuessedCorrectly(selectedIndex) ? '0.6' : '0',
  //   transform: isDayGuessedCorrectly(selectedIndex) ? 'scale(1)' : 'scale(0.1)',
  //   border: "none",
  //   width: "15vmax",
  //   height: "200px",
  //   top: "60vh",
  //   left: "6vw",
  //   position: "absolute",
  // }

  // const gif2styles = {
  //   transition: 'opacity 0.3s, transform 0.5s',
  //   opacity: isArtistGifVisible ? '0.6' : '0',
  //   transform: isArtistGifVisible ? 'scale(1)' : 'scale(0.1)',
  //   border: "none",
  //   width: "15vmax",
  //   height: "200px",
  //   top: "60vh",
  //   left: "6vw",
  //   position: "absolute",
  // }

  // const gif3styles = {
  //   transition: 'opacity 0.3s, transform 0.5s',
  //   opacity: isReleaseDateGifVisible ? '0.6' : '0',
  //   transform: isReleaseDateGifVisible ? 'scale(1)' : 'scale(0.1)',
  //   border: "none",
  //   width: "15vmax",
  //   height: "120px",
  //   top: "70vh",
  //   right: "6vw",
  //   position: "absolute",
  // }

  // const revealButtonStyles = {
  //   fontFamily: "CustomFont2",
  //   fontSize: "3vmin",
  //   top: "-15px",
  //   left: "-15px",
  //   position: "absolute",
  // }

  const attemptsStyles = {
    animation: "blink .75s linear infinite",
    fontFamily: "CustomFont2",
    fontSize: "3vmin",
    top: "-15px",
    left: "-15px",
    position: "absolute",
    // animation: `${blinkingEffect} 1s linear infinite;`
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const spotifyLogoStyles = {
    transition: 'opacity 0.5s, transform 0.5s',
    opacity: isAnswerVisible ? '1' : '0',
    transform: isAnswerVisible ? 'scale(1)' : 'scale(0.1)',
    // marginTop: "2vh",
    // marginBottom: "2vmax",
    height: "10vmin",
    width: "10vmin",
    position: "fixed",
    zIndex: 16777271,
    // top: "30px",
    // left: "65%",
    // transform: "translate(0%, -50%)",
    animation: "spin 5000ms linear infinite, y 30s linear infinite alternate, x 12s linear infinite alternate",
  }

  const loadingStyles = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    position: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  };

  return (
    <div style={containerStyles}>
      <div>
        <a href={spotifyLink} target="_blank" rel="noopener noreferrer">
          <img style={spotifyLogoStyles} src="https://pixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com/image/8554553e351ae8c.png" alt="Spotify logo"></img>
        </a>
      </div>
      <Router>
        <div>
          <div style={headerContainerStyles} >
            <h1 style={headerStyles}>Recordle</h1>
            <div style={minusStyles} onClick={() => handleDayChange(-1)}>{'-'}</div>
            <div style={plusStyles} onClick={() => handleDayChange(1)}>{'+'}</div>
            <h2 style={subHeaderStyles}>Day {selectedIndex}</h2>
            {/* <button
              style={revealButtonStyles}
              onClick={handleRevealClick}
              disabled={selectedIndex === day || isAnswerVisible}
            >
              Reveal
            </button> */}
            <div style={attemptsStyles}>
              <Blink fontSize="4vmin" color="#87469B" blinkTime={isCorrectAnswer ? 1 : 0}
                text={!isAnswerVisible ? `tries: ${attempts}` : isCorrectAnswer ? handleAttempts(attempts) : ""}>
              </Blink>
            </div>
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
            {/* <a href={spotifyLink} target="_blank" rel="noopener noreferrer">
              <img style={spotifyLinkStyles} src="https://pixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com/image/8554553e351ae8c.png" alt="Spotify link"></img>
            </a> */}
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
          <div style={loadingStyles}>
            <ColorRing
              visible={isLoading}
              position="absolute"
              height="100"
              width="200"
              ariaLabel="blocks-loading"
              wrapperClass="blocks-wrapper"
              colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
            />
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
          {/* <iframe src="https://giphy.com/embed/4oMoIbIQrvCjm" style={gifStyles} class="gifyEmbed"></iframe><p><a href="https://giphy.com/gifs/the-simpsons-bart-simpson-4oMoIbIQrvCjm"></a></p>
          <iframe src="https://giphy.com/embed/DpPUDW4XTw4EM" style={gif2styles} class="giphyEmbed"></iframe><p><a href="https://giphy.com/gifs/reaction-a5viI92PAF89q"></a></p>
          <iframe src="https://giphy.com/embed/a5viI92PAF89q" style={gif3styles} class="giphy-embed"></iframe><p><a href="https://giphy.com/gifs/lol-futurama-humor-cFgb5p5e1My3K"></a></p> */}
          <div>  <p style={progressMessageStyles}>{progressMessage}</p></div>
          <div style={bottomContainerStyles}>
            <form onSubmit={handleSubmit}>
              <div id="input-container" style={inputContainerStyles}>
                <input
                  // disabled={isPreviousDay(selectedIndex, day)}
                  disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)}
                  key={inputKey}
                  class='form-control'
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  style={inputStyles}
                  placeholder="Enter album title/word/uri OR artist"
                  autoFocus
                />
                {/* <button disabled={isPreviousDay(selectedIndex, day)} type="submit" style={enterButtonStyles}>Go</button> */}
                <button onClick={scrollToTop} disabled={isDayGuessedCorrectly(selectedIndex)} type="submit" style={enterButtonStyles}>Go</button>
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

