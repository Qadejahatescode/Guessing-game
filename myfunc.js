

function guessingGame(playerid)  {

           let randomNumber;
                            let attempts;
                            let gameId;

                            function showWelcome() {
                                console.log("Welcome to the Number Guessing Game!");
                                console.log("I have selected a number between 1 and 100.");
                                console.log("Can you guess what it is?");
                                
                                randomNumber = Math.floor(Math.random() * 100) + 1;
                                attempts = 0;

                                // Start a new game and store it in the database
                                const startTime = new Date();
                                connection.query('INSERT INTO games (playerid, start_time) VALUES (?, ?)', [/* playerid */, startTime], function (err, results) {
                                    if (err) {
                                        console.error('Error inserting new game:', err);
                                        return;
                                    }
                                    gameId = results.insertId; // Store the game ID for later use
                                    guessNumber();
                                });
                            }

                            function guessNumber() {
                                console.log(""); // Empty line

                                readline.question("Guess the number: ", function (input) {
                                    const number = parseInt(input);

                                    if (isNaN(number)) {
                                        console.error("Input must be a number");
                                        guessNumber();
                                    } else if (number < 1 || number > 100) {
                                        console.error("Input must be a number between 1 and 100");
                                        guessNumber();
                                    } else {
                                        attempts += 1;

                                        // Store the guess in the database
                                        const dateTime = new Date();
                                        connection.query('INSERT INTO guesses (gameid, guess, date_time) VALUES (?, ?, ?)', [gameId, number, dateTime], function (err) {
                                            if (err) {
                                                console.error('Error inserting guess:', err);
                                                return;
                                            }

                                            // Check if the guess is correct
                                            if (number < randomNumber) {
                                                console.log("Too low");
                                                guessNumber();
                                            } else if (number > randomNumber) {
                                                console.log("Too high");
                                                guessNumber();
                                            } else {
                                                // End the game and update the game record with the end time
                                                const endTime = new Date();
                                                connection.query('UPDATE games SET end_time = ? WHERE gameid = ?', [endTime, gameId], function (err) {
                                                    if (err) {
                                                        console.error('Error updating game end time:', err);
                                                        return;
                                                    }
                                                    console.log(`Congratulations! You've guessed the number, it took you ${attempts} attempts.`);
                                                    restartGame();
                                                });
                                            }
                                        });
                                    }
                                });
                            }

                            function restartGame() {
                                readline.question("Do you want to play again? (yes/no): ", function (input) {
                                    if (input.toLowerCase() === 'yes') {
                                        showWelcome(); // Start a new game
                                    } else {
                                        console.log("Thanks for playing! Goodbye!");
                            
                                    }
                                });
                            }

                            // Start the game
                            showWelcome();
            // mainMenu(playerid);
         return    
        }

        module.exports.guess=guessingGame