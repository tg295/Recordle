import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ImageSlider from "./ImageSlider";
import vinyl from './Images/vinyl.png';
import './fonts.css';

// So we set a start date - we don't allow the user to go back before this date. 
// We also set a current date - this is the date that the user is currently on - defaulting to today's date.
// We then calculate the difference between the current date and today's date, and use that to set the day idx.
// We have limits to ensure the user can't go back before the start date, or go forward past today's date.

// When the user hits a plus sign next to the date, we increment the day idx by 1, and then fetch the data for that day.
// When the user hits a minus sign next to the date, we decrement the day idx by 1, and then fetch the data for that day.

const App = () => {
  const now = new Date();
  const start = new Date(2023, 5, 14);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));

  const [textData, setTextData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(day);
  const [slides, setSlides] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [showReleaseDate, setShowReleaseDate] = useState(false);

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

          const newSlides = [
            { url: `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${jsonData.id}_${jsonData.formatted_title}_GEN_0.png`, title: "clue1" },
            { url: `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${jsonData.id}_${jsonData.formatted_title}_GEN_1.png`, title: "clue2" },
            { url: `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${jsonData.id}_${jsonData.formatted_title}_GEN_2.png`, title: "clue3" },
          ];

          const answer = { url: `https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/${jsonData.id}_${jsonData.formatted_title}_REAL.png`, title: "answer" }

          setJsonData(jsonData);
          setSlides(newSlides);
          setAnswer(answer);
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

  const handleDayChange = (index) => {
    setSelectedIndex(index);
    setShowReleaseDate(false);
  };

  const containerStyles = {
    border: "3px solid #e66439",
    borderStyle: "solid",
    borderRadius: "5px",
    display: "flex",
    padding: "24px",
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
  };

  const headerStyles = {
    fontFamily: "CustomFont",
    fontSize: "24px",
    fontWeight: "bold",
    color: "black",
    marginTop: "-2px",
    marginBottom: "top",
    textAlign: "center",
    '@media (maxWidth: 768px)': {
      fontSize: "24px",
    },
  };

  const releaseDateStyles = {
    cursor: "pointer",
    marginTop: "10px",
    fontFamily: "CustomFont2",
    fontSize: "16px",
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  };

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
    objectFit: "cover",
  };

  const logoStyles = {
    width: "5%",
    aspectRatio: "1/1",
    height: "3%",
    top: "34px",
    left: "98px",
    marginTop: 0,
    position: 'absolute',
    // right: 20,
  }

  const contentStyles = {
    flex: "1 0 auto",
  };

  return (
    <div style={containerStyles}>
      <Router>
        <div>
          {/* <Header selectedIndex={selectedIndex} textData={textData} handleDayChange={handleDayChange} /> */}
          {/* {[...Array(10)].map((_, index) => (
            <img
              key={index}
              src={vinyl}
              alt="Vinyl"
              style={{ width: "8%", marginBottom: "2px", marginTop: -20, }}
            />
          ))} */}
          <img src={vinyl} alt="Recordle" style={logoStyles} />
          <h1 style={headerStyles}>Recordle - Day {selectedIndex}</h1>
          {jsonData && (
            <p
              style={releaseDateStyles}
              onClick={handleReleaseDateClick}
            >
              Release date: {showReleaseDate ? jsonData.release_date : "???"}
            </p>
          )}
          <div style={imgContainerStyles}>
            {slides.length > 0 && jsonData ? (
              <ImageSlider slides={slides} />
            ) : (
              <p>Loading slides...</p>
            )}
          </div>
          {answer && (
            <div style={anwserStyles}>
              <img src={answer.url} alt={answer.title} style={answerImageStyles} />
            </div>
          )}
        </div>
        <Footer />
      </Router>
    </div >
  );
};

export default App;

