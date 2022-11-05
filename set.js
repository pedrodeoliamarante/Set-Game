/**
 * @author Pedro Amarante
 * @date 02/02/2022
 * Javascript for a set game, triggers on load the funcionality of the page.
 * This includes toggling between game and menu view, creating a random set board of cards,
 * making the game playable (selecting cards, checking if it as set, adding to the count of sets)
 */

"use strict";
(function() {

    let timerId;
    let remainingSeconds;
    window.addEventListener("load", init);

    function init() {
        id("start-btn").addEventListener("click", begin);
        id("back-btn").addEventListener("click", end);
    }

    /**
     * function runned when the start button is clicked,
     * toggles the view,
     * sets the board up and starts the timer
     */
    function begin() {
        toggleView();

        let selectedOption = qs("select");
        let time = selectedOption.value;
        startTimer(time);

        setBoard();

        id("refresh-btn").addEventListener("click", setBoard);
    }

    /**
     * sets up the board with the right amount of cards depending on the difficulty
     */
    function setBoard() {
        let nOfCards;
        let isEasy;
        if (qs("input[name='diff']:checked").value === "easy") {
            nOfCards = 9;
            isEasy = true;
        } else {
            nOfCards = 12;
            isEasy = false;
        }
        id("board").innerHTML = "";
        for (let i = 0; i < nOfCards; i++) {
            let card = generateUniqueCard(isEasy);
            id("board").appendChild(card);
        }
    }

    /**
     * called when the back button is clicked, resets the timer, toggles the view,
     * and resets the counter, also gives back the refresh-btn functionality.
     */
    function end() {
        clearInterval(timerId);
        timerId = null;
        id("set-count").innerText = 0;
        toggleView();
        id("refresh-btn").addEventListener("click", setBoard);
    }

    /**
     * function that is ran when timer reaches 0, makes the game unplayable
     * by removing all playing related event listeners
     */
    function endOutOfTime() {
        let selectedCards = qsa(".selected");
        for (let i = 0; i < selectedCards.length; i++) {
            selectedCards[i].classList.remove("selected");
        }
        let cards = qsa(".card");
        for (let i = 0; i < cards.length; i++) {
            cards[i].removeEventListener('click', cardSelected);
        }
        id("refresh-btn").removeEventListener("click", setBoard);
        clearInterval(timerId);
        timerId = null;
    }

    /**
     * toggles the view between the menu view and game view
     */
    function toggleView() {
        if (id("menu-view").classList.contains("hidden")) {
            removeHidden(id("menu-view"));
            addHidden(id("game-view"));
        } else if (id("game-view").classList.contains("hidden")) {
            addHidden(id("menu-view"));
            removeHidden(id("game-view"));
        }
    }

    /**
     * starts the timer when called, running the advance timer function each second
     */
    function startTimer() {
        let selectedOption = qs("select");
        let startTime = selectedOption.value;
        id('time').innerText = convertToMinutes(startTime);
        timerId = setInterval(advanceTimer(), 1000);
    }

    /**
     * Advances the timer one second, changing it intenally and externally
     * when the timer reaches 0 runs the endOutOfTime function
     * @returns {function} returns a function which does what was previouly mentioned
     */
    function advanceTimer() {
        let selectedOption = qs("select");
        let startTime = selectedOption.value;
        let oldTime = selectedOption.value;

        return function() {
            if (startTime !== 0) {
                startTime--;
                id('time').innerText = convertToMinutes(startTime);
            } else {
                clearInterval(timerId);
                timerId = null;
                startTime = oldTime;
                endOutOfTime();
            }

        };
    }

    /**
     * Generates 3 to 4 random card attributes
     * @param {boolean} isEasy tells the function which difficulty is being played
     * @returns an array of the attributes
     */
    function generateRandomAttributes(isEasy) {
        let attributes = []
        let styles = ['solid', 'outline', 'striped'];
        let colors = ['green', 'purple', 'red'];
        let shapes = ['diamond', 'oval', 'squiggle'];
        let counts = [1, 2, 3];

        if (isEasy) {
            attributes[0] = styles[0];
        } else {
            attributes[0] = styles[getRandomInt(3)];
        }

        attributes[1] = shapes[getRandomInt(3)]
        attributes[2] = colors[getRandomInt(3)]
        attributes[3] = counts[getRandomInt(3)]

        return attributes;
    }

    /**
     * Generates unique cards div,
     * they all contain unique properties, diffrent from other cards in the board
     * also adds the card images, alts and their correct id
     * @param {boolean} isEasy tells the function which difficulty is being played
     * @returns {object} returns a div element with a unique card
     */
    function generateUniqueCard(isEasy) {
        let cardsIds = []
        let previousCards = qsa(".card");

        for (let i = 0; i < previousCards.length; i++) {
            cardsIds.push(previousCards[i].id);
        }

        let attributes = generateRandomAttributes(isEasy);
        while (cardsIds.includes(
                `${attributes[0]}-${attributes[1]}-${attributes[2]}-${attributes[3]}`)) {
            attributes = generateRandomAttributes(isEasy);
        }

        let card = document.createElement("div");
        card.classList.add("card");
        for (let i = 0; i < attributes[3]; i++) {
            let cardImg = document.createElement("img");
            let cardId = `${attributes[0]}-${attributes[1]}-${attributes[2]}`
            cardImg.src = "img/" + cardId + ".png";
            let cardCode = cardId + `-${attributes[3]}`;
            cardImg.alt = cardCode;
            card.appendChild(cardImg);
            card.setAttribute('id', cardCode);
        }
        card.addEventListener('click', cardSelected);
        return card;
    }

    /**
     * Funtion to be added to a click event when selecing cards,
     * gives the selected cards the correct class,
     * after 3 are selected checks if they make a set,
     * if they do display that they make a set and replace the cards with new ones,
     * if they dont simply display that they don't
     */
    function cardSelected() {
        this.classList.add("selected");
        let selectedCards = qsa(".selected");
        let checkedDiffBtn = qs("input[name='diff']:checked");
        let isEasy;

        if (checkedDiffBtn.value === "easy") {
            isEasy = true;
        } else {
            isEasy = false;
        }

        if (selectedCards.length === 3) {
            for (let i = 0; i < selectedCards.length; i++) {
                selectedCards[i].classList.remove("selected");
            }

            if (isASet(selectedCards)) {
                let count = id("set-count").innerText;
                count++;
                id("set-count").innerText = count;

                for (let i = 0; i < 3; i++) {
                    let newCard = generateUniqueCard(isEasy);
                    selectedCards[i].replaceWith(newCard);
                    newCard.classList.add("hide-imgs");

                    let p = document.createElement("p")
                    p.innerText = "SET!"
                    newCard.appendChild(p);

                    setTimeout(() => {
                        newCard.classList.remove("hide-imgs");
                        newCard.removeChild(p);
                    }, 1000);
                }

            } else {
                for (let i = 0; i < selectedCards.length; i++) {
                    selectedCards[i].classList.add("hide-imgs");
                    let p = document.createElement("p")
                    p.innerText = "Not a Set";
                    selectedCards[i].appendChild(p);

                    setTimeout(() => {
                        selectedCards[i].classList.remove("hide-imgs");
                        selectedCards[i].removeChild(p);
                    }, 1000);
                }
            }
        }
    }

    /**
     * Checks if the elements in a nodelist correpond to a set
     * @param {object} selected nodelist containing cards with the .selected class
     * @returns {boolean} return true if the cards form a set, false otherwise.
     */
    function isASet(selected) {
        let attributes = [];
        for (let i = 0; i < selected.length; i++) {
            attributes.push(selected[i].id.split("-"));
        }
        for (let i = 0; i < attributes[0].length; i++) {
            let diff = attributes[0][i] !== attributes[1][i] &&
                attributes[1][i] !== attributes[2][i] &&
                attributes[0][i] !== attributes[2][i];
            let same = attributes[0][i] === attributes[1][i] &&
                attributes[1][i] === attributes[2][i];
            if (!(same || diff)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Helper function, gets the DOM element with the id inputed.
     * @param {string} id - the id of the retrieved element
     * @return {object} the DOM element with the inputed id
     *                  (NULL if no  element has the given id)
     */
    function id(id) {
        return document.getElementById(id);
    }

    /**
     * Helper function, gets the DOM element with the class inputed.
     * @param {string} selector - the class of the retrieved element
     * @return {object} the DOM element with the inputed class
     *                  (NULL if no  element has the given class)
     */
    function qs(selector) {
        return document.querySelector(selector);
    }

    /**
     * Helper function, gets the DOM node list with elements with the class inputed.
     * @param {string} id - the class of elements in the DOM node list
     * @return {object} the DOM node list with the class inputed.
     *                  (If the specified selectors include a CSS pseudo-element,
     *                   the returned list is always empty.)
     */
    function qsa(selector) {
        return document.querySelectorAll(selector);
    }
    /**
     * Remove the element from the hidden class.
     * @param {object} element - the element's id
     */
    function removeHidden(element) {
        element.classList.remove("hidden");
    }

    /**
     * Add the element to the hidden class.
     * @param {object} element - the element's id
     */
    function addHidden(element) {
        element.classList.add("hidden");
    }

    /**
     * Helper method.
     * Converts seconds to a minute based string in the format min:sec
     * @param  {int}  oldSec seconds to be converted
     * @return {string} a string representing the seconds in the min:sec
     * format
     */
    function convertToMinutes(oldSec) {
        let min = convertToTwoDigits(Math.floor(oldSec / 60));
        let sec = convertToTwoDigits(Math.floor(oldSec % 60));
        return min + ":" + sec;
    }

    /**
     * Helper Method.
     * Converts a single digit number into a double digit one.
     * Example: 2 -> 02
     * If a number bigger than 10 is inputed simply returns it.
     * @param {int} number number to be converted
     * @returns {string} a string representing the double digit number
     */
    function convertToTwoDigits(number) {
        let timeString = "";
        if (number < 10) {
            timeString += "0" + number;
        } else {
            timeString += number;
        }
        return timeString;
    }

    /**
     * Helper method
     * Returns a random intenger between 0 and the number inputed
     * @param {int} max upper bound of the random integer
     * @returns {int} random number from 0 to max inclusive
     */
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

})();