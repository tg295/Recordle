import { useState } from "react";
import React from 'react';
// import isImageVisible from './../App.js';
import { ColorRing } from 'react-loader-spinner'
// import setIsLoading from './../App.js';
// import rightArrowStyles from './../App.js';


const slideStyles = {
    width: "40vh",
    maxWidth: "300px",
    aspectRatio: "16/9",
    height: "40vh",
    maxHeight: "300px",
    borderRadius: "5px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "3px solid #b90a85da",
    boxShadow: "5px 10px #5F0443",
    position: "absolute",
    // padding: "0 10px",
    // objectFit: "cover",
};

// const rightArrowStyles = {
//     position: "absolute",
//     bottom: "45%",
//     // marginLeft: "38vw",
//     // maxLeft: "2vw",
//     transform: isImageVisible ? 'translate(100vw,0)' : "translate(28vmin, 0)", // Shrink the container when the answer is correct
//     // right: isImageVisible ? "200px" : "250px",
//     fontSize: "12vmin",
//     color: "#181818",
//     cursor: "pointer",
//     '@media (minWidth: 768px)': {
//         marginLeft: "90%"
//     },
// };

// const leftArrowStyles = {
//     position: "absolute",
//     bottom: "45%",
//     // right: "100vmin",
//     // marginLeft: "5vw",
//     // left: "-46vmin"
//     transform: "translate(-55vmin, 0)",
//     // left: "20px",
//     // marginLeft: "5vw",
//     fontSize: "12vmin",
//     color: "#181818",
//     cursor: "pointer",
// };

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

const ImageSlider = ({ slides }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // const goToPrevious = () => {
    //     setIsLoading(true);
    //     const isFirstSlide = currentIndex === 0;
    //     const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    //     setCurrentIndex(newIndex);
    // };
    const goToNext = () => {
        // document.getElementById('clues').style.zIndex = 0;
        document.getElementById('answer').style.zIndex = -1;
        setIsLoading(true);
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };
    return (
        <div id="slider" style={sliderContainerStyles}>
            <div style={sliderStyles}>
                {/* <div>
                    <div onClick={goToPrevious} style={{ ...leftArrowStyles }}>
                        {"<"}
                    </div>
                    <div onClick={goToNext} style={{ ...rightArrowStyles }}>
                        {">"}
                    </div>
                </div> */}
                <img
                    src={slides[currentIndex].url}
                    onClick={goToNext}
                    style={{ ...slideStyles }}
                    onLoad={handleImageLoad}
                    alt="loading..."
                />
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
            </div>
        </div>

    );
};

export default ImageSlider;
