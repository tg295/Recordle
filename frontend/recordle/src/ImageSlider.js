import { useState } from "react";
import React from 'react';

const slideStyles = {
    width: "60%",
    height: "60%",
    borderRadius: "5px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "3px solid #e66439",
};

const rightArrowStyles = {
    position: "absolute",
    top: "30%",
    transform: "translate(0, -50%)",
    right: "65px",
    fontSize: "45px",
    color: "#181818",
    zIndex: 1,
    cursor: "pointer",
};

const leftArrowStyles = {
    position: "absolute",
    top: "30%",
    transform: "translate(0, -50%)",
    left: "65px",
    fontSize: "45px",
    color: "#181818",
    zIndex: 1,
    cursor: "pointer",
};

const sliderStyles = {
    position: "relative",
    height: "100%",
    justifyContent: "center",
    display: "flex",
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
    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };
    const slideStylesWidthBackground = {
        ...slideStyles,
        backgroundImage: `url(${slides[currentIndex].url})`,
    };

    return (
        <div style={sliderStyles}>
            <div>
                <div onClick={goToPrevious} style={leftArrowStyles}>
                    {"<"}
                </div>
                <div onClick={goToNext} style={rightArrowStyles}>
                    {">"}
                </div>
            </div>
            <div style={slideStylesWidthBackground}></div>
            {/* <div style={dotsContainerStyles}>
                {slides.map((slide, slideIndex) => (
                    <div
                        style={dotStyle}
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                    >
                        ■
                    </div>
                ))}
            </div> */}
        </div>
    );
};

export default ImageSlider;
