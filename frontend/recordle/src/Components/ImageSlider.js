import { useState } from "react";
import React from 'react';
import isImageVisible from './../App.js';
// import rightArrowStyles from './../App.js';

const slideStyles = {
    width: "70vmin",
    maxWidth: "400px",
    aspectRatio: "16/9",
    height: "70vmin",
    maxHeight: "400px",
    borderRadius: "5px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "3px solid #e66439",
    position: "absolute",
    // padding: "0 10px",
    // objectFit: "cover",
};

const rightArrowStyles = {
    position: "absolute",
    bottom: "45%",
    // right: "5vw",
    transform: isImageVisible ? 'translate(80vw,0)' : "translate(38vmin, 0)", // Shrink the container when the answer is correct
    // right: isImageVisible ? "200px" : "250px",
    fontSize: "12vmin",
    color: "#181818",
    cursor: "pointer",
};

const leftArrowStyles = {
    position: "absolute",
    bottom: "45%",
    // left: "-46vmin"
    transform: "translate(-47vmin, 0)",
    // left: "20px",
    fontSize: "12vmin",
    color: "#181818",
    cursor: "pointer",
};

const sliderStyles = {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    position: "absolute",
    width: "100%",
    height: "100%",
    // objectFit: "cover",
};

const sliderContainerStyles = {
    position: "relative",
    width: "100%",
    height: "50vh",
    // padding: "0 15px",
    // objectFit: "cover",
};

const ImageSlider = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // Added loading state

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };
    const goToNext = () => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };
    return (
        <div style={sliderContainerStyles}>
            <div style={sliderStyles}>
                <div>
                    <div onClick={goToPrevious} style={{ ...leftArrowStyles }}>
                        {"<"}
                    </div>
                    <div onClick={goToNext} style={{ ...rightArrowStyles }}>
                        {">"}
                    </div>
                </div>
                {isLoading ? (
                    <div style={slideStyles}>Loading...</div>
                ) : (
                    <img
                        src={slides[currentIndex].url}
                        style={{ ...slideStyles }}
                        onLoad={handleImageLoad}
                        alt="loading..."
                    />
                )}
            </div>
        </div>

    );
};

export default ImageSlider;
