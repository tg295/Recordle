import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from "./Components/Footer";
import ImageSlider from "./ImageSlider";
import vinyl from './Images/vinyl.png';
import question from './Images/question.png';
import './fonts.css';
import './index.css';

// TO DO 
// Fix layout - plus and minus need to be anchored to the answer image
// AND the vinyl image needs to be anchored to the "o" in the Recordle header
// AND the main container should always fill the full screen with everything centred

// Then we need to build the answer sumbission form on top of the answer image
// If right we reveal the answer, if wrong we send a try again message and reset the form

// Finally add link to listen the album on Spotify
// And a link to share your result on twitter/fb/insta etc.
// Link to my GitHub

// Extra bits
// Grey out plus sign when you can't go any further
// Shake the input when wrong answer entered

const App = () => {

  const placeholderImage = vinyl; // Replace with your desired placeholder image URL
  const now = new Date();
  const start = new Date(2023, 4, 25);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));

  const [textData, setTextData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(day);
  const [slides, setSlides] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [showReleaseDate, setShowReleaseDate] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [isIncorrectAnswer, setIsIncorrectAnswer] = useState(false);
  const [isFieldVisible, setIsFieldVisible] = useState(false);


  useEffect(() => {
    const fetchTextData = async () => {
      try {
        const response = await fetch('https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/albums_done.txt');
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
          const url = `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/data/${albumId}.json`;
          const response = await fetch(url);
          const jsonData = await response.json();
          console.log(jsonData);
          const newSlides = [
            { url: `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${jsonData.id}_${jsonData.formatted_title}_GEN_0.png`, title: "clue1" },
            { url: `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${jsonData.id}_${jsonData.formatted_title}_GEN_1.png`, title: "clue2" },
            { url: `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${jsonData.id}_${jsonData.formatted_title}_GEN_2.png`, title: "clue3" },
          ];

          const answer = { url: `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${jsonData.id}_${jsonData.formatted_title}_REAL.png`, title: jsonData.title, formatted_title: jsonData.formatted_title }

          setJsonData(jsonData);
          setSlides(newSlides);
          setAnswer(answer);
          setIsAnswerVisible(false); // Hide the answer initially
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
      setShowReleaseDate(false);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValue.trim().toLowerCase() === answer.formatted_title.toLowerCase().replace("_", " ")) {
      setIsAnswerVisible(true); // Show the answer slide
      setIsFieldVisible(true); // Reveal the field values
      setIsIncorrectAnswer(false); // Reset the incorrect answer state
    } else {
      setIsIncorrectAnswer(true);
      setInputKey((prevKey) => prevKey + 1); // Update the key to trigger re-render
      setInputValue("");
      // Add shake animation or display an error message for wrong answer
    }
  };

  const TextBox = () => {
    const [isFieldVisible, setIsFieldVisible] = useState(false); // Track the visibility of the field values

    useEffect(() => {
      if (isAnswerVisible) {
        setIsFieldVisible(true); // Show the field values when the answer is visible
      }
    }, [isAnswerVisible]);

    // if (!isFieldVisible) {
    //   return null; // Render nothing if the field values are not visible
    // }

    const keysToShow = ["title", "artist", "label"]; // Define the keys to include

    return (
      <div style={textBoxStyles}>
        {keysToShow.map((key) => (
          <p key={key}>
            <strong>{key}:</strong> {isFieldVisible ? jsonData[key] : "?"}
          </p>
        ))}
      </div>
    );
  };

  const textBoxStyles = {
    width: "300px",
    height: "100px",
    position: "absolute",
    bottom: "70px",
    right: "-110px",
    padding: "10px",
    fontSize: "12px",
    // border: "3px solid #e66439",
    // borderRadius: "5px",
    // overflow: "hidden",
    fontFamily: "CustomFont2",
    marginBottom: "20px",
  };

  const containerStyles = {
    width: "100%",
    // height: "100vh", // Set height to 100vh for full-screen
    margin: "0",
    boxSizing: "border-box",
    border: "8px solid #e66439",
    borderStyle: "double", //triple
    borderRadius: "5px",
    display: "flex",
    padding: "24px",
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    '@media (maxWidth: 768px)': {
      padding: "20px",
      justifyContent: "center",
    },
  };

  const imgContainerStyles = {
    width: "512px",
    height: "512px",
    margin: "0 auto",
    position: "relative",
    // display: "flex",
  };

  const headerContainerStyles = {
    position: "relative",
    marginBottom: "40px",
  };

  const headerStyles = {
    fontFamily: "CustomFont",
    fontSize: "32px",
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
    fontSize: "18px",
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


  const logoStyles = {
    width: "5%",
    aspectRatio: "1/1",
    height: "100%",
    top: "-1px",
    left: "153px",
    marginTop: 0,
    position: 'absolute',
    // top: "calc(6% - 32px)",
    // left: "calc(38% - 2.5%)",
    // right: 20,
  }

  const releaseDateStyles = {
    cursor: "pointer",
    marginTop: "10px",
    fontFamily: "CustomFont2",
    fontSize: "12px",
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    position: "absolute",
    top: "100px",
    right: "130px"
  };

  const answerContainerStyles = {
    width: "80%",
    height: "22%",
    position: "absolute",
    top: "calc(100% )",
    right: "calc(50% - 23%)",
  }

  const anwserStyles = {
    width: "50%",
    height: "100%",
    border: "3px solid #e66439",
    borderRadius: "5px",
    overflow: "hidden",
    position: "relative",
    backgroundSize: "cover",
    backgroundPosition: "center",
    marginRight: "auto",
    marginLeft: "auto",
    marginTop: "-220px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    '@media (maxWidth: 768px)': {
      width: "90%",
      marginTop: "-150px",
    },
  };

  const answerImageStyles = {
    width: "100%",
    height: "100%",
    // objectFit: "cover",
  };

  const plusStyles = {
    position: "absolute",
    top: "50%",
    right: "85px", // Adjust as needed
    fontSize: "45px",
    color: "#181818",
    zIndex: 1,
    cursor: "pointer",
    transform: "translateY(-50%)", // Center vertically
  };

  const minusStyles = {
    position: "absolute",
    top: "50%",
    left: "85px", // Adjust as needed
    fontSize: "45px",
    color: "#181818",
    zIndex: 1,
    cursor: "pointer",
    transform: "translateY(-50%)", // Center vertically
  };

  const inputContainerStyles = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  };

  const inputStyles = {
    width: "300px",
    padding: "10px",
    fontSize: "10px",
    border: "3px solid #e66439",
    borderRadius: "5px",
    overflow: "hidden",
    fontFamily: "CustomFont2",
    animation: isIncorrectAnswer ? 'shake 0.4s ease-in-out' : 'none',
  };

  const bottomContainerStyles = {
    position: "absolute",
    bottom: 0,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    left: '-5%'
  };

  const enterButtonStyles = {
    marginLeft: "10px",
    padding: "10px",
    background: "#e66439",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontFamily: "CustomFont2",
  };

  const shakeAnimationStyles = {
    animation: "shake 0.5s",
  };


  return (
    <div style={containerStyles}>
      <Router>
        <div>
          <div style={headerContainerStyles} >
            {/* <img src={vinyl} alt="Recordle" style={logoStyles} /> */}
            <h1 style={headerStyles}>Recordle</h1>
            <h2 style={subHeaderStyles}>Day {selectedIndex}</h2>
            <div>
              <div style={minusStyles} onClick={() => handleDayChange(-1)}>{'-'}</div>
              <div style={plusStyles} onClick={() => handleDayChange(1)}>{'+'}</div>
            </div>
          </div>
          {jsonData && (
            <p
              style={releaseDateStyles}
              onClick={handleReleaseDateClick}
            >
              Year of release: {showReleaseDate ? jsonData.release_date.substring(0, 4) : "????"}
            </p>
          )}
          <div style={imgContainerStyles}>
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
                />
                <button type="submit" style={enterButtonStyles}>Go</button>
              </div>
            </form>
            <TextBox />
          </div>
        </div>
        <Footer />
      </Router>
    </div >
  );
};

export default App;

