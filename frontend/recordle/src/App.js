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
// Store the one that the user is on in local storage - that way they can't leave until they've completed it
// Else if they haven't started one, then it defaults to the most recent
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

function bringAnswerToFront() {
  document.getElementById('answer').style.zIndex = 3;
  document.getElementById('clues').style.zIndex = 2;
}

function loadLives(lives) {
  // if (lives === 0) {
  //   return ":("
  // }
  let livesString = "";
  for (let i = 0; i < lives; i++) {
    livesString += "♥";
  }
  return livesString;
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
  const [lives, setLives] = useState(5);
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
            setContent(`${jsonData.artist} • ${jsonData.title}`)
            setShowReleaseDate(true);
            setIsAnswerVisible(true);
            setSpotifyLink(`https://open.spotify.com/album/${jsonData.id}`);
          }
          else {
            setContent(`${jsonData.artist.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/g, '_')} • ${jsonData.title.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]/g, '_')}`);
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

  // const handleRevealClick = () => {
  //   setShowReleaseDate(true);
  //   setIsAnswerVisible(true);
  //   setIsImageVisible(true);
  //   setContent(`${jsonData.artist} • ${jsonData.title}`)
  //   const revealedDays = JSON.parse(localStorage.getItem('revealedDays')) || [];
  //   if (!revealedDays.includes(selectedIndex)) {
  //     revealedDays.push(selectedIndex);
  //     localStorage.setItem('revealedDays', JSON.stringify(revealedDays));
  //   }

  // };

  const handleReleaseDateClick = () => {
    setLives(lives - 1);
    setAttempts(attempts + 1);
    setShowReleaseDate(true);
    // setIsMinusGreyedOut(true);
    // setIsPlusGreyedOut(true);
    // if (!isDayGuessedCorrectly(selectedIndex)) {
    // setIsReleaseDateGifVisible(true);
    // }
    // if (selectedIndex === day) {
    //   setIsReleaseDateGifVisible(true);
    // }
  };

  const handleDayChange = (increment) => {
    // if (attempts === 0) {
    bringAnswerToFront();
    setInputValue("");
    setLives(5);
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
    // }
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

  // const handleAttempts = (attempts) => {
  //   if (attempts === 1) {
  //     return "hole in one";
  //   }
  //   else if (attempts === 2) {
  //     return "eagle";
  //   }
  //   else if (attempts === 3) {
  //     return "birdie";
  //   }
  //   else if (attempts === 4) {
  //     return "par";
  //   }
  //   else if (attempts === 5) {
  //     return "bogey";
  //   }
  //   else if (attempts === 6) {
  //     return "double bogey";
  //   }
  //   else if (attempts === 7) {
  //     return "triple bogey";
  //   }
  //   else {
  //     return `done in ${attempts} ...`;
  //   }
  // }

  // const handleLives = (lives) => {
  //   if (lives === 5) {
  //     return "hole in one"
  //   }
  //   else if (lives === 4) {
  //     return "eagle"
  //   }
  //   else if (lives === 3) {
  //     return "birdie"
  //   }
  //   else if (lives === 2) {
  //     return "par"
  //   }
  //   else if (lives === 1) {
  //     return "bogey"
  //   }
  // }

  const handleSubmit = (event) => {
    event.preventDefault();
    setAttempts(attempts + 1);
    console.log(`attempts: ${attempts}`);
    // if (attempts > 0) {
    //   setIsMinusGreyedOut(true);
    //   setIsPlusGreyedOut(true);
    // }
    let textAnswerRevealed = `${jsonData.artist} • ${jsonData.title}`;
    let formattedTitle = answer.formatted_title.toLowerCase().replace(/_/g, " ");
    let formattedArtist = answer.artist.toLowerCase().replace(/_/g, " ");
    let inputSimilarityTitle = similarity(removeAccents(formattedTitle), inputValue);
    let inputSimilarityArtist = similarity(removeAccents(formattedArtist), inputValue);
    console.log(`input similarity: ${inputSimilarityTitle}`);
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
      // setAttempts(0);
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
      // setAttempts(0);
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
        if (indices.length > 0) {
          for (var j = 0; j < indices.length; j++) {
            for (var k = 0; k < word.length; k++) {
              var revealedContent = setCharAt(revealedContent, indices[j] + k, word[k]);
            }

            setContent(revealedContent);
          }
          setIsIncorrectAnswer(false);
          // const formattedRevealedArtist = revealedContent.split(" • ")[0].toLowerCase()
          const formattedRevealedTitle = revealedContent.split(" • ")[1].toLowerCase()

          // let contentSimilarityArtist = similarity(formattedArtist, formattedRevealedArtist);
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
            // setAttempts(0);
            // setIsArtistGifVisible(false);
            // setIsReleaseDateGifVisible(false);
          }
        }
        else {
          setLives(lives - 1);
          console.log(`lives: ${lives}`);
          if (lives === 1) {
            setContent(textAnswerRevealed);
            setIsAnswerVisible(true); // Show the answer slide
            setShowReleaseDate(true); // Show the release date
            setIsCorrectAnswer(false);
            const revealedDays = JSON.parse(localStorage.getItem('revealedDays')) || [];
            if (!revealedDays.includes(selectedIndex)) {
              revealedDays.push(selectedIndex);
              localStorage.setItem('revealedDays', JSON.stringify(revealedDays));
            }
          }
          setIsIncorrectAnswer(true);
        }
      }
      // else if (contentSimilarityArtist > 0.99) {
      // setIsArtistVisible(true); // Show the artist
      // setIsArtistGifVisible(true); // Show the gif
      // }
      setInputKey((prevKey) => prevKey + 1); // Update the key to trigger re-render
      setInputValue("");
    }
    console.log(`attempts: ${attempts}`);
    bringAnswerToFront();
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
      color: "#5F0443",
      textAlign: "center",
      // textShadow: "-1px 0 pink, 0 1px pink, 1px 0 pink, 0 -1px pink",
      marginTop: "5vmin",
      // marginBottom: "10px",
      // marginBottom: "calc(5% - 3vw)",
      padding: "1px",
      // transform: "translateY(-70%)",
      // top: "50%",
      // maxHeight: "15px",
      fontSize: "min(4vmin, 30px)",
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
    // height: "100%",
    // height: "100vh", // Set height to 100vh for full-screen
    margin: "0",
    boxSizing: "border-box",
    border: "8px double #b90a85da",
    // borderStyle: "double", //triple
    borderRadius: "5px",
    // display: "flex",
    padding: "24px",
    position: "fixed",
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
    bottom: "7vh",
    // margin: "0 auto",
    position: "relative",
    transform: isImageVisible ? 'scale(0.85)  translate(max(-10vw, -200px), -1vh)' : 'none', // Shrink the container when the answer is correct 
    transition: 'transform 0.3s ease', // Add a smooth transition effect
    // zIndex: 1
  };

  const defaultImgStyles = {

    // bottom: "10px",
    top: "20%",
    width: "85%",
    height: "50vh",
    margin: "0 auto",
    position: "relative",
    bottom: "7vh",
    transition: 'transform 0.3s ease', // Add a smooth transition effect
  };


  const headerContainerStyles = {
    position: "relative",
    marginBottom: "10px",
  };

  const headerStyles = {
    fontFamily: "CustomFont",
    fontSize: "5vmax",
    fontWeight: "bold",
    color: "black",
    // textShadowColor: "white",
    // textShadowColor: '#585858',
    // textShadowOffset: { width: 5, height: 5 },
    // textShadowRadius: 10,
    textShadow: "-5px 0 #b90a85da, 0 2px #b90a85da, 1px 0 #b90a85da, 0 -1px #b90a85da",
    marginTop: "1vh",
    marginBottom: "2vmax",
    textAlign: "center",
    '@media (maxWidth: 768px)': {
      fontSize: "24px",
    },
  };

  const subHeaderStyles = {
    fontFamily: "CustomFont",
    fontSize: "3vmax",
    fontWeight: "bold",
    color: "black",
    order: "-1",
    marginTop: "-1vh",
    marginBottom: "0.5vmax",
    textShadow: "-2px 0 #b90a85da, 0 1px #b90a85da, 0.5px 0 #b90a85da, 0 -0.5px #b90a85da",
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
    fontSize: "min(3vmin, 20px)",
    color: "#5F0443",
    padding: "0.5px",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    // textShadow: "-0.5px 0 #e66439, 0 0.5px #e66439, 0.5px 0 #e66439, 0 -0.5px #e66439",
    marginBottom: "-100px",
    // left: "15%",
    width: "100%",
    left: "30vw",
    top: "8vh",
    // height: "120%",
    marginTop: "3vw",
    position: "absolute",
    // maxBottom: "1000px",
    transition: 'opacity 0.2s, transform 0.5s',
    transform: "rotate(20deg)",
    opacity: showReleaseDate ? '1' : '0.2',
    // borderRadius: "20px",
    // border: "1px solid #e66439",
    // borderRadius: "5px",
    // backgroundColor: "#b90a85da"
    zIndex: 5
  };

  const answerContainerStyles = {
    transition: 'opacity 0.5s, transform 0.5s',
    opacity: isAnswerVisible ? '1' : '0',
    transform: isAnswerVisible ? 'scale(1)' : 'scale(0.1)',
    width: "40vmin",
    height: "40vmin",
    maxWidth: "250px",
    maxHeight: "250px",
    margin: "0 auto",
    position: "fixed",
    justifyContent: "center",
    alignItems: "center",
    backgroundPosition: "center",
    left: "max(52vw, 150px)",
    bottom: "max(35vh, 37vmin)",
    // marginBottom: "200px",
  }

  const anwserStyles = {
    width: "100%",
    height: "100%",
    border: "3px solid #b90a85da",
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
    right: "30px", // Adjust as needed
    fontSize: "min(10vw, 100px)",
    color: isPlusGreyedOut ? "#606060" : "#181818",
    textShadow: "-1px 0 #b90a85da, 0 1px #b90a85da, 1px 0 #b90a85da, 0 -1px #b90a85da",
    zIndex: 1,
    cursor: "pointer",
    transform: "translateY(-10%)", // Center vertically
  };

  const minusStyles = {
    position: "fixed",
    top: "9%",
    left: "30px", // Adjust as needed
    fontSize: "min(10vw, 100px)",
    textShadow: "-1px 0 #b90a85da, 0 1px #b90a85da, 1px 0 #b90a85da, 0 -1px #b90a85da",
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
    left: "1%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const inputContainerStyles = {
    width: "100%",
    height: "100%",
    bottom: "max(22vmin, 21vh)",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const inputStyles = {
    width: "min(80vmin, 450px)",
    height: "min(2vh, 15px)",
    padding: "min(1vmin, 5px)",
    fontSize: "2vmin",
    textAlign: "center",
    border: "0.5vmin solid #b90a85da",
    borderRadius: "5px",
    position: "relative",
    fontFamily: "CustomFont2",
    animation: isIncorrectAnswer ? "shake 0.4s ease-in-out" : "none",
    opacity: isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex) ? "0.1" : "0.7",
    transition: 'opacity 0.2s, transform 0.5s',
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
    color: "#5F0443",
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
    top: "15px",
    left: "15px",
    position: "fixed",
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

  const keyboardStyles = {
    bottom: "4vh",
    position: "fixed",
    fontSize: "0.3vmin",
    // padding: "0.5rem",
    display: "flex",
    margin: "1rem 0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  }

  const spaceBarStyles = {
    width: "50vmin",
  }

  const formStyles = {
    // marginBottom: "1px",
    position: "relative"
  }

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
              <Blink fontSize="3.5vmin" color="#b62c2c" blinkTime={isCorrectAnswer ? 1 : 0}
                text={!isAnswerVisible ? `${loadLives(lives)}` : isCorrectAnswer ? loadLives(lives) : ""}>
              </Blink>
            </div>
            {/* <h3 style={subHeaderStyles}>Guess the song</h3> */}
            <TextBox content={content} />
            {jsonData && (
              <p
                style={releaseDateStyles}
                onClick={handleReleaseDateClick}
              >
                {showReleaseDate ? `[ ${jsonData.release_date.substring(0, 4)} ]` : "[ ???? ]"}
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
          <div id="clues" style={isAnswerVisible ? imgContainerStyles : defaultImgStyles}>
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
          <div id="answer" onClick={bringAnswerToFront} style={answerContainerStyles}>
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
            <form onSubmit={handleSubmit} style={formStyles}>
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
                  placeholder="feed me album titles"
                  autoFocus
                />
                {/* <button disabled={isPreviousDay(selectedIndex, day)} type="submit" style={enterButtonStyles}>Go</button> */}
                {/* <button onClick={scrollToTop} disabled={isDayGuessedCorrectly(selectedIndex)} type="submit" style={enterButtonStyles}>Go</button> */}
              </div>
            </form>
            <div style={keyboardStyles} id="keyboard-cont">
              <div class="first-row">
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "q")} class="keyboard-button">q</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "w")} class="keyboard-button">w</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "e")} class="keyboard-button">e</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "r")} class="keyboard-button">r</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "t")} class="keyboard-button">t</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "y")} class="keyboard-button">y</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "u")} class="keyboard-button">u</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "i")} class="keyboard-button">i</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "o")} class="keyboard-button">o</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "p")} class="keyboard-button">p</button>
              </div>
              <div class="second-row">
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "a")} class="keyboard-button">a</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "s")} class="keyboard-button">s</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "d")} class="keyboard-button">d</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "f")} class="keyboard-button">f</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "g")} class="keyboard-button">g</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "h")} class="keyboard-button">h</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "j")} class="keyboard-button">j</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "k")} class="keyboard-button">k</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "l")} class="keyboard-button">l</button>
              </div>
              <div class="third-row">
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "z")} class="keyboard-button">z</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "x")} class="keyboard-button">x</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "c")} class="keyboard-button">c</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "v")} class="keyboard-button">v</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "b")} class="keyboard-button">b</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "n")} class="keyboard-button">n</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + "m")} class="keyboard-button">m</button>
              </div>
              <div class="fourth-row">
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue.slice(0, -1))} class="keyboard-button">Del</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={() => setInputValue(inputValue + " ")} style={spaceBarStyles} class="keyboard-button">space</button>
                <button disabled={isDayGuessedCorrectly(selectedIndex) || isDayRevealed(selectedIndex)} onClick={handleSubmit} type="submit" class="keyboard-button">Enter</button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </Router >
    </div >
  );
};

export default App;

