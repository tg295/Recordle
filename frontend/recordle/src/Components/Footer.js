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
    fontFamily: "VT323, monospace",
    color: "white",
    backgroundPosition: "left",
    justifyContent: "left",
    display: "flex",
    alignItems: "center",
    padding: "5px",
    fontSize: "9px",
    position: "fixed",
    left: "0",
    bottom: "0",
    width: "100%",
    borderTop: "1px solid #ccc",
    backgroundColor: "#009900",
};

function Footer() {
    return (
        <footer style={footerStyle} className="text-center text-xs m-auto">
            &copy; Gurt Data 2023
        </footer>
    )
}

export default Footer