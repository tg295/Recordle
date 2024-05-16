# Recordle

<i>Mek gud covers. </i>

An early PoC for a game, currently in the form of a web application built in React. Give it a try at: https://www.recordle.app/


<img src="./screenrec1.gif" alt="screenRec1">


## Rules

You have 5 attempts to guess the album based on 3 images generated by a stable diffusion model.

The artist name can be entered, but only the title will result in a correct answer. The hidden text is arranged like so:

<p style="text-align: center;"><i> Prince • Purple Rain </i></p>

Entering individual words that exist within the title or artist name will be revealed without any loss of lives.

For an additional hint you can reveal the year of release by tapping the question marks in the top right corner of the screen, at a cost of 1 life.

A new, randomly selected, album is added everyday at 00:00 GMT.

New albums are also posted automatically to a [Recordle instagram account](https://www.instagram.com/p/Cz4yCUUIBga):

<img src="./screenrec2.gif" alt="screenRec2">

## Intended improvements

* improve image quality with a new model
* improve navigation of days
* a more reliable keyboard
* better responsiveness / reduce load time 
* fix reveal of artist name
* build as a mobile application
* clean up and modularise existing code
* introduce more robust testing
* post albums to twitter