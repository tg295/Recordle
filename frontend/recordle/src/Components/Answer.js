import { useState } from "react";
import React from 'react';

const slideStyles = {
    width: "50%",
    height: "50%",
    borderRadius: "5px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "3px solid #e66439",
    borderRadius: "5px",
};

const rightArrowStyles = {
    position: "absolute",
    top: "25%",
    transform: "translate(0, -50%)",
    right: "90px",
    fontSize: "45px",
    color: "#181818",
    zIndex: 1,
    cursor: "pointer",
};

const leftArrowStyles = {
    position: "absolute",
    top: "25%",
    transform: "translate(0, -50%)",
    left: "90px",
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
                    {"-"}
                </div>
                <div onClick={goToNext} style={rightArrowStyles}>
                    {"+"}
                </div>
            </div>
            <div style={slideStylesWidthBackground}></div>
        </div>
    );
};

{
    answer && (
        <div style={anwserStyles}>
            <img src={answer.url} alt={answer.title} style={answerImageStyles} />
        </div>
    )
}

export default ImageSlider;
