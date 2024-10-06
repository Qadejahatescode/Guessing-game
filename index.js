const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
const mysql = require("mysql2");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "playerdb",
});

let nickname = "";
let username = "";
let password = "";
function register() {
    readline.question('Enter nickname: ', function(input) {
        nickname = input.trim();
        if (nickname == "") {
            console.log('Nickname cannot be empty.');
            return register();
        }
        readline.question('Enter username: ', function(input) {
             username = input.trim();
            if (username == "") {
                console.log('Username cannot be empty.');
                return register();
            }

            readline.question('Enter password: ', function(input) {
                 password = input;
                if (password.length < 8) {
                    console.log('Password must be at least 8 characters');
                    return register();
                }
                // Use connection.escape within the query
                connection.query(`INSERT INTO players (nickname, username, password) VALUES (${connection.escape(nickname)}, ${connection.escape(username)}, ${connection.escape(password)})`, 
                    function (err) {
                        if (err) {
                            console.log('Username already exists. Please choose a different one.');
                        } else {
                            console.log('Registration successful!');
                        }
                        mainMenu();
                    });
            });
        });
    });
}

// Function to login a player
function login() {
    readline.question('Enter username: ', function(input) {
        username = input.trim();
        if (username == "") {
            console.log('Username cannot be empty.');
            return login(); // Retry login if username is empty
        }
        readline.question('Enter password: ', function(input) {
        password = input;
              if (password == "") {
            console.log('Password cannot be empty.');
            return login(); // Retry login if username is empty
        } 

            // Use connection.escape to prevent SQL injection
            connection.query(`SELECT * FROM players WHERE username = ${connection.escape(username)} AND password = ${connection.escape(password)}`, function(err, results) {
                if (err) {
                    console.error('Error executing query:', err);
                    mainMenu(); // Handle error, return to main menu
                    return;
                }

                if (results.length > 0) { // Check if any rows were returned
                    console.log(`Welcome, ${results[0].nickname}!`);
                    mainMenu(results[0].playerid);
                } else {
                    console.log('Invalid username or password. Please try again.');
                    mainMenu(); // Return to the main menu
                }
            });
        });
    });
}
// Function to show top player by score
function showTopPlayerByScore() {
    connection.query(
        `SELECT p.nickname, attempt

         FROM players  as p
         JOIN attempts as a ON p.playerid = a.playerid
         GROUP BY p.playerid
         ORDER BY SUM(attempt) ASC
         LIMIT 1`, 
        function(err, results) {
            if (err) {
                console.error('Error fetching top player by score:', err);
                return;
            }
            if (results.length > 0) {
                console.log(`Top Player by Score: ${results[0].nickname} with attempts of ${results[0].attempt} `);
               
            }
        }
    );
}

// Function to show top player by average score
function showTopPlayerByAverageScore() {
   connection.query(
        `SELECT p.nickname, AVG(a.attempt) AS AV
         FROM players  as p
         JOIN attempts as a ON p.playerid = a.playerid
         GROUP BY p.playerid
         ORDER BY AVG(attempt) ASC
         LIMIT 1`, 
        function(err, results) {
            if (err) {
                console.error('Error fetching top player by  average score:', err);
                return;
            }
            if (results.length > 0) {
            
                console.log(`Top Player by average Score: ${results[0].nickname} 
                    with average attempts of ${results[0].AV}`);
                    // i got a problem here :<
                
            }
        }
    );
}
function updateAccount(playerid) {
    readline.question('Enter new nickname: ', function(input) {
        const nickname = input.trim();
        if (nickname === "") {
            console.log('Nickname cannot be empty.');
            return updateAccount(playerid); // Retry updating the account
        }

        readline.question('Enter new username: ', function(input) {
            const username = input.trim();
            if (username === "") {
                console.log('Username cannot be empty.');
                return updateAccount(playerid); // Retry updating the account
            }

            readline.question('Enter new password: ', function(input) {
                const password = input;
                if (password.length < 8) {
                    console.log('Password must be at least 8 characters');
                    return updateAccount(playerid); // Retry updating the account
                }

                // Use connection.escape within the query
                connection.query(
                    `UPDATE players SET nickname = ${connection.escape(nickname)}, username = ${connection.escape(username)}, password = ${connection.escape(password)} WHERE playerid = ${connection.escape(playerid)}`,
                    function(err, result) {
                        if (err) {
                            console.error('Error updating account:', err);
                        } else {
                            console.log('Account updated successfully!');
                            console.log(result);
                        }
                        mainMenu(playerid);
                    }
                );
            });
        });
    });
}

function deleteAccount(playerId) {
    readline.question('Are you sure you want to delete your account? (yes/no): ', function(answer) {
        if (answer.toLowerCase() === 'yes') {
            // Use connection.escape within the query
            connection.query(`DELETE FROM attempts WHERE playerid = ${connection.escape(playerId)}`, function(err) {
                if (err) {
                    console.error('Error deleting attempts:', err);
                    return; // Exit if there's an error
                }

                connection.query(`DELETE FROM games WHERE playerid = ${connection.escape(playerId)}`, function(err) {
                    if (err) {
                        console.error('Error deleting games:', err);
                        return; // Exit if there's an error
                    }

                    // Then, delete the player record
                    connection.query(`DELETE FROM players WHERE playerid = ${connection.escape(playerId)}`, function(err) {
                        if (err) {
                            console.error('Error deleting player:', err);
                            return; // Exit if there's an error
                        }

                        console.log('Player and associated attempts deleted successfully.');
                        mainMenu(); // Return to main menu after deletion
                    }); // End of players DELETE query callback
                }); // End of games DELETE query callback
            }); // End of attempts DELETE query callback
        } else {
            console.log('Account deletion cancelled.');
            mainMenu(playerId);
        }
    });
}


// Main menu function
function mainMenu(playerid = null) {
    console.log('\nMain Menu');
    console.log('r: Register');
    console.log('l: Login');
    if (playerid) {
       
        console.log('p: Show top player')
        console.log('s: Start New Game');
        console.log('u: Update Account');
        console.log('d: Delete Account');
        console.log('x: Logout');
    } else {
        console.log('x: Exit');
    }
    
    readline.question('Select an option: ', function(input) {
        choice=input
        if (choice === 'r') {
            register();
        }
        else if (choice === 'p') {
           showTopPlayerByScore()
           console.log("")
           showTopPlayerByAverageScore()
        //    Doesnt wait :<
           mainMenu(playerid)
        } 
         else if (choice === 'l') {
            login();
        } else if (playerid && choice.toLowerCase() === 's') {
            console.log('Starting new game...');
            // Implement game start functional
                            let randomNumber;
                            let attempts;
                            let gameId;

                            function showWelcome() {
                                console.log("Welcome to the Number Guessing Game!");
                                console.log("I have selected a number between 1 and 100.");
                                console.log("Can you guess what it is?");
                                
                                randomNumber = Math.floor(Math.random() *100) + 1;
                                attempts = 0;

                                // Start a new game and store it in the database
                                const startTime = new Date();
                                connection.query(`INSERT INTO games (playerid, start_time) VALUES (${connection.escape(playerid)},${connection.escape(startTime)})`, function (err, results) {
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
            connection.query(
                `INSERT INTO guesses (gameid, guess, date_time) VALUES (${connection.escape(gameId)},${connection.escape(number)},${connection.escape(dateTime)})`, 
                function (err) {
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
                        connection.query(
                            `UPDATE games SET end_time =${connection.escape(endTime)} WHERE gameid = ${connection.escape(gameId)}`, 
                            [endTime, gameId], 
                            function (err) {
                                if (err) {
                                    console.error('Error updating game end time:', err);
                                    return;
                                }

                                // Insert the attempt data
                                connection.query(
                                    `INSERT INTO attempts (gameid, playerid, attempt) VALUES (${connection.escape(gameId)},${connection.escape(playerid)},${connection.escape(attempts)})`, 
                    
                                    function (err) {
                                        if (err) {
                                            console.error('Error inserting attempt:', err);
                                            return;
                                        }
                                        console.log(`Congratulations! You've guessed the number, it took you ${attempts} attempts.`);
                                        restartGame();
                                    }
                                );
                            }
                        );
                    }
                }
            );
        }
    });
}


                            function restartGame() {
                                readline.question("Do you want to play again? (yes/no): ", function (input) {
                                    if (input.toLowerCase() === 'yes') {
                                        showWelcome(); // Start a new game
                                    } else {
                                        console.log("Thanks for playing! Goodbye!");
                                         mainMenu(playerid);
                            
                                    }
                                });
                            }

                            // Start the game
                            showWelcome();
           
       
                 
        } else if (playerid && choice.toLowerCase() === 'u') {
            console.log('Update account...');
            // Implement account update functionality
            updateAccount(playerid)
            
            
            mainMenu(playerid);
        } else if (playerid && choice.toLowerCase() === 'd') {
            console.log('Delete account...');
            // Implement account delete functionality
            deleteAccount(playerid);
            mainMenu(playerid)
        } else if (choice.toLowerCase() === 'x') {
            if (playerid) {
                console.log('Logged out.');
                mainMenu();
            } else {
                console.log('Goodbye!');
                readline.close();
                connection.close();
            }
        } else {
            console.log('Invalid option. Please try again.');
            mainMenu(playerid);
        }
    });
}

// Start the program with the main menu
mainMenu();

