import React from "react";
import '.././fonts.css';
import handleCloseModal from '.././App.js';

const InstructionsModal = ({ show, onToggle }) => {
    if (!show) return null;

    const closeButtonStyles = {
        backgroundColor: "#f44336",
        color: "white",
        padding: "5px 10px",
        fontFamily: "CustomFont",
        borderRadius: "5px",
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Instructions</h2>
                <p>You have 5 attempts to guess the album based on 3 images generated from a stable diffusion model that has been prompted with the album title.</p>
                <p>The artist name can be entered, but only the title will result in a correct answer. The full text is arranged in the following manner:</p>
                <p style={{ textAlign: "center" }}>Prince • Purple Rain</p>
                <p>Entering individual words that exist in the <strong>title or artist name</strong> will be revealed <strong>without the loss of any lives.</strong></p>
                <p>For an additional hint you can reveal the year of release, at a cost of 1 life.</p>
                <p>A new album is added everyday at 00:00 GMT. The album is randomly picked from a longlist without any prior knowledge of how the images will turn out.</p>
                {/* <p>Caution: it's not very easy.</p> */}
                <div>
                    <input type="checkbox" id="do-not-show-again" onChange={onToggle} />
                    <label htmlFor="do-not-show-again">Do not show again</label>
                </div>
                <button style={closeButtonStyles} onClick={handleCloseModal}>Close</button>
            </div>
        </div>
    );
};

export default InstructionsModal;