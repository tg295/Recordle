import React, { useEffect, useState } from 'react';
import ImageSlider from "./ImageSlider";

const App = () => {
  const now = new Date();
  const start = new Date(2023, 4, 25);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));

  const [textData, setTextData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(day);
  const [slides, setSlides] = useState([]);
  const [jsonData, setJsonData] = useState(null);

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

          setJsonData(jsonData);
          setSlides(newSlides);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchJsonData();
  }, [selectedIndex, textData]);

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
    fontFamily: "Arial, sans-serif",
    fontSize: "32px",
    fontWeight: "bold",
    color: "black",
    marginTop: "left",
    marginBottom: "top",
  };

  return (
    <div style={containerStyles}>
      <div>
        <h1 style={headerStyles}>Day {selectedIndex}</h1>
        <div style={imgContainerStyles}>
          {slides.length > 0 && jsonData ? (
            <ImageSlider slides={slides} />
          ) : (
            <p>Loading slides...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

