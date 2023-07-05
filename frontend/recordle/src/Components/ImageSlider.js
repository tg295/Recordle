import { useState } from "react";
import React from 'react';

const slideStyles = {
    width: "35vh",
    aspectRatio: "16/9",
    height: "35vh",
    borderRadius: "5px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "3px solid #e66439",
    // padding: "0 10px",
    // objectFit: "cover",
};

const rightArrowStyles = {
    position: "absolute",
    top: "40%",
    transform: "translate(180%, 0)",
    right: "2%",
    fontSize: "45px",
    color: "#181818",
    zIndex: 1,
    cursor: "pointer",
};

const leftArrowStyles = {
    position: "absolute",
    top: "40%",
    transform: "translate(-180%, 0)",
    // left: "20px",
    fontSize: "45px",
    color: "#181818",
    zIndex: 1,
    cursor: "pointer",
};

const sliderStyles = {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    position: "relative",
    width: "100%",
    height: "100%",
    // objectFit: "cover",
};

const sliderContainerStyles = {
    position: "relative",
    width: "100%",
    height: "100%",
    // padding: "0 15px",
    // objectFit: "cover",
};

// const dotsContainerStyles = {
//     display: "flex",
//     justifyContent: "center",
//     position: "absolute",
//     marginTop: "260px",
// };

// const dotStyle = {
//     margin: "0 3px",
//     cursor: "pointer",
//     fontSize: "20px",
// };

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
    // const goToSlide = (slideIndex) => {
    //     setCurrentIndex(slideIndex);
    // };
    // const slideStylesWidthBackground = {
    //     ...slideStyles,
    //     backgroundImage: `url(${slides[currentIndex].url})`,
    // };

    const calculateArrowLeftPosition = () => {
        const screenWidth = window.innerWidth;
        const maxContainerWidth = parseInt(slideStyles.width);
        const maxArrowLeftPosition = (screenWidth - maxContainerWidth) / 2;

        // Calculate arrow position based on the current container width
        const currentContainerWidth = Math.min(maxContainerWidth, screenWidth);
        const currentArrowLeftPosition = (screenWidth - currentContainerWidth) / 2;

        // Scale the arrow position based on the maximum arrow left position
        const scaledArrowLeftPosition =
            (currentArrowLeftPosition / maxArrowLeftPosition) * 2;

        // Adjust the scaling factor to control the speed of arrow movement
        const adjustedArrowLeftPosition = scaledArrowLeftPosition * 0.001; // Adjust the factor (0.5) as per your preference

        return `${adjustedArrowLeftPosition}%`;
    };

    const arrowLeftPosition = calculateArrowLeftPosition();

    return (
        <div style={sliderContainerStyles}>
            <div style={sliderStyles}>
                <div>
                    <div onClick={goToPrevious} style={{ ...leftArrowStyles, left: arrowLeftPosition }}>
                        {"<"}
                    </div>
                    <div onClick={goToNext} style={{ ...rightArrowStyles, right: arrowLeftPosition }}>
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
                    />
                )}
            </div>
        </div>

    );
};

export default ImageSlider;
