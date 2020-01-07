# Trivia-With-User-Profile
This program adds sessions and user profiles to an existing trivia quiz server. This server serves up information about the quiz history of 10 users and it serves up a quiz that can be completed by any user.

When a user tries to log in, the server validates their username and password by searching for matching entries in the database. If the credentials are correct, that user is logged in to the system and he/she can continue to be classified as logged in until he/she chooses to log out or until the cookie associated with their session expires (5 miniutes). Additionally, once logged in, the user is redirected to their profile page. If the credentials are incorrect, the user is redirected to the homepage.

A GET request for the /users route returns an HTML page containing a list of all users in the server's database that have their privacy value set to "Off" or "false". The entry for each user in this list contains a link to that user's profile with the link text showing their username. Users who have set their privacy value to "On" or "true" do not show up in the search.

A GET request to the parameterized route /users/:userID behaves as follows:
  1. If the requesting user is logged in and requesting their own profile, then the page:
    a. Provides a method for the user to toggle their privacy setting.
    b. Provides a method for the user to 'save' the changes to their privacy setting, which is sends the selected privacy value to the server and updates the database. 
    c. Lists the user's total quizzes completed and average quiz score
    d. Provide a "Log Out" button that, when clicked, logs the user out of the system and redirects them to the home page.
  2. If the requesting user is not logged in or is requesting some other user's profile, then:
    a. If the profile being requested is set to be private, a response with an HTTP status code of 403 is sent to the user.
    b. If the profile being requested is not set to be private, then the page displays the total quizzes and average quiz score of the requested user.

When a POST request is made by a logged in user to the /quiz route to complete a quiz, that user's profile is updated and saved. The user is then be redirected to their own profile. If a user who is not logged in to the system makes a POST request to /quiz, no changes are made to any users and the user is be redirected to the home page.
