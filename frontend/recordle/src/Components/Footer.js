import React from 'react'

const footerStyle = {
    fontFamily: "VT323, monospace",
    backgroundPosition: "left",
    justifyContent: "left",
    display: "flex",
    marginRight: "auto",
    fontSize: "15px",
};

function Footer() {
    return (
        <footer style={footerStyle} className="bg-gray-200 text-center text-xs p-3 absolute bottom-0 w-full border-t">
            &copy; 2023
        </footer>
    )
}

export default Footer