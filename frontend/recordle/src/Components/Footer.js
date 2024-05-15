import React from 'react';


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
    right: "40px",
    position: "absolute"
}

const instructionsButtonStyes = {
    backgroundColor: "rgba(52, 52, 52, 0)",
    color: "white",
    padding: "2px 10px",
    fontFamily: "CustomFont2",
    fontSize: "1.5vh",
    borderRadius: "5px",
    position: "absolute",
    alignItems: "center",
    textAlign: "center",
    right: "62%"
}

const keyboardButtonStyles = {
    backgroundColor: "rgba(52, 52, 52, 0)",
    color: "white",
    padding: "2px 10px",
    fontFamily: "CustomFont2",
    fontSize: "1.5vh",
    borderRadius: "5px",
    position: "absolute",
    alignItems: "center",
    textAlign: "center",
    right: "35%"
}

function Footer({ setShowModal, setShowKeyboard, showKeyboard, setIsIncorrectAnswer }) {
    return (
        <footer style={footerStyle} className="text-center text-xs m-auto">
            &copy; Gurt Data
            <button style={instructionsButtonStyes} onClick={() => setShowModal(true) & setIsIncorrectAnswer(false)}>help</button>
            <button style={keyboardButtonStyles} onClick={() => setShowKeyboard(!showKeyboard) & setIsIncorrectAnswer(false)}>keyboard</button>
            <a style={beerContainerStyles} href="https://www.buymeacoffee.com/thebacongardner">
                buy me a beer
            </a>
        </footer>
    )
}

export default Footer