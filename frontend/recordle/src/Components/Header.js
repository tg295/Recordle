import React from 'react'
import Navigation from './Navigation'
import { Link } from 'react-router-dom'

const headerStyle = {
    // alignSelf: 'flex-end',
    marginTop: -10,
    position: 'absolute',
    right: 20,
}

function Header() {
    return (
        <header className="border-b p-3 flex justify-between items-center" style={headerStyle}>
            {/* <Link to="/" className="font-bold">
                Recordle
            </Link> */}

            <Navigation />
        </header>
    )
}

export default Header