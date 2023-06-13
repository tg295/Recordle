import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ImageSlider from "./ImageSlider";
import vinyl from './Images/vinyl.jpeg';

const App = () => {
  const now = new Date();
  const start = new Date(2023, 4, 31);
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

  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
  };

  const imgContainerStyles = {
    width: "512px",
    height: "512px",
    margin: "0 auto",
  };

  const headerStyles = {
    // position: "relative",
    fontFamily: "VT323, monospace",
    fontSize: "28px",
    fontWeight: "bold",
    color: "black",
    marginTop: "left",
    marginBottom: "top",
    textAlign: "center",
  };

  const releaseDateStyles = {
    cursor: "pointer",
    marginTop: "10px",
    fontFamily: "VT323, monospace",
    fontSize: "16px",
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  };

  const anwserStyles = {
    width: "58%",
    height: "100%",
    borderRadius: "5px",
    // overflow: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
    marginRight: "auto",
    marginLeft: "auto",
    marginTop: "-220px",
  };

  const logoStyles = {
    position: "absolute",
    width: "12%",
    height: "8%",
    top: "16px",
    left: "30px",
  }

  return (
    <div style={containerStyles}>
      <Router>

        <div>
          {/* <Header /> */}
          <img
            src={vinyl}
            alt="Logo"
            style={logoStyles}
          />
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
              <img src={answer.url} alt={answer.title} />
            </div>
          )}
        </div>
        <Footer />
      </Router>
    </div >
  );
};

export default App;

