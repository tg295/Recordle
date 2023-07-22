import React from 'react'

// const footerStyle = {
//     fontFamily: "VT323, monospace",
//     backgroundPosition: "left",
//     justifyContent: "left",
//     // display: "flex",
//     marginRight: "auto",
//     postition: "fixed",
//     left: "0",
//     bottom: "0",
//     right: "0",
//     fontSize: "8px",
//     flexDirection: "column"
// };

const footerStyle = {
    fontFamily: "CustomFont2",
    color: "white",
    backgroundPosition: "left",
    justifyContent: "left",
    display: "flex",
    alignItems: "center",
    padding: "1.5vh",
    fontSize: "1.5vh",
    position: "fixed",
    left: "0",
    bottom: "0",
    width: "100%",
    borderTop: "1px solid #ccc",
    backgroundColor: "#009900",
};

const beerContainerStyles = {
    height: "10px",
    left: "80vw",
    position: "absolute"
}

function Footer() {
    return (
        <footer style={footerStyle} className="text-center text-xs m-auto">
            &copy; Gurt Data 2023
            <a style={beerContainerStyles} href="https://www.buymeacoffee.com/thebacongardner">
                buy me beer
            </a>
        </footer>
    )
}

export default Footer