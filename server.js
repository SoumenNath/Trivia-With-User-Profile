let mongo = require('mongodb');
const mongoose = require("mongoose");
const express = require('express');
const Question = require("./QuestionModel");
const User = require("./UserModel");
const session = require('express-session')

//require module, pass it the session module
const MongoDBStore = require('connect-mongodb-session')(session);
//Create the new mongo store, using the database we have been
// using already, and the collection sessiondata
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/quiztracker',
  collection: 'sessiondata'
});

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
// Use the session middleware
//Set the store property in the options and make the cookie expire after 300000 milliseoconds(5 minutes)
app.use(session({ secret: 'some secret here', store: store, cookie: {maxAge: 300000} }));

app.set("view engine", "pug");

app.use(express.static("public"));

//variable thats stores user info
let us = "";
//paths
app.get('/', main);
app.post("/login", login);
app.get("/logout", logout);
app.get("/users", displayUsers);
app.get("/users/:uID", displaySingleU);
app.post("/updateSetting", uSetting);

//function to render the index page
function main(req, res, next) {
  console.log("Main");
  if (us != ""){
    console.log(us);
  }
  //render the index page with a differnt loggedIn value depending on wheter or not the user is logged in
  if(req.session.loggedin){
    res.render("pages/index", {loggedIn: true, user: us});
  }
  else{
    res.render("pages/index", {loggedIn: false, user: us});
  }

};

//function to facilitate the login of the user
function login(req, res, next){
  //if the user is already logged in then notify them with the following message
	if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}
	console.log("Body: "+req.body);
	console.log("Username: "+req.body.username);
  //get the username and password entered in the login form
	let username = req.body.username;
	let password = req.body.password;
  //query the datavbase to rearch for the user witht that username
	db.collection("users").findOne({username: username}, function(err, result){
		if(err)throw err;

		console.log(result);

		if(result){
      //check to see if password matches
			if(result.password === password){
        //set the login status to true
				req.session.loggedin = true;
        //set the session username to the username entered by the user
				req.session.username = username;
        //set the us variable to the user
        us = result;
        //redirect user to their profile
        let url = 'http://localhost:3000/users/'+result._id;
        res.redirect(url);
			}else{
        //if the login was unsuccessful then redirect the user to index page
				res.redirect('http://localhost:3000/');
			}
		}else{
      //if the login was unsuccessful then redirect the user to index page
			res.redirect('http://localhost:3000/');
			return;
		}

	});
}

//function to facilitate the logout of the user
function logout(req, res, next){
	if(req.session.loggedin){
    //if the user is login in, then set their login status to false and then redirect them to the index page
		req.session.loggedin = false;
    us = "";
    res.redirect('http://localhost:3000/');
	}else{
    //if the user is not logged in, then just redirect them to the index page
		res.redirect('http://localhost:3000/');
	}
}

//function that displays the list of users with the privacy seeting of false
function displayUsers(req, res, next){
  //query the database to fin users that have the privacy seeting of false
  db.collection("users").find({privacy: false}).toArray(function(err, result) {
		if(err)throw err;
		console.log(result);
		if(result){
      //render the users page with the login status of the user
      if(req.session.loggedin){
        res.render("pages/users", {Users: result, loggedIn: true, user: us});;
      }
      else{
        res.render("pages/users", {Users: result, loggedIn: false, user: us});
      }
		}
	});
}

//function to display the profile page of a specific user
function displaySingleU(req, res, next){
  //create an object id using the request parameter
  let oid;
	console.log(req.params.uID);
	try{
		oid = new mongo.ObjectID(req.params.uID);
	}catch{
		res.status(404).send("Unknown ID");
		return;
	}
  console.log("Object iD:");
  console.log(oid);
  //if the request parameter is valid then send the information about the question in the requested format
	db.collection("users").findOne({"_id":oid}, function(err, result){
		if(err){
			res.status(404).send("Error reading database.");
			return;
		}
		if(!result){
			res.status(404).send("Error: Unknown ID");
			return;
		}
    //if that users privacy setting is set to false then deny the client access
    if (result.privacy == true && !(req.session.loggedin)){
      res.status(403).send("Error: this profile cannot be accessed.");
			return;
    }
    //render the profile page of that user with the loggin status of the client
    if (req.session.loggedin){
      if (req.session.username != result.username){
        res.status(200).render("pages/singleUser", {uSe:us, user: result, lI: false, disL: false});
      }
      else{
        res.status(200).render("pages/singleUser", {uSe:us, user: result, lI: true, disL: false});
      }
    }
    else{
      res.status(200).render("pages/singleUser", {uSe:us, user: result, lI: false, disL: true});
    }

	});
}

//asynchronous function to update the users privacy setting
async function uSetting(req, res, next){
  console.log("Recieved post");
  let obj = req.body;
  console.log(obj);
  //conver On to true and off to false
  if (obj.pS == 'On'){
    obj.pS = true;
  }
  else{
    obj.pS = false;
  }
  console.log(obj.pS);
  //update the database
  db.collection("users").updateOne({ username: obj.uSn }, { $set: { privacy: obj.pS }}, function(err, result){
		if(err){
			res.send("Error reading database");
			return;
		}
    res.send("Updated Setting");
    return;
	});
}

//Returns a page with a new quiz of 10 random questions
app.get("/quiz", function(req, res, next){
	Question.getRandomQuestions(function(err, results){
		if(err) throw err;
    //render the quiz page with the loggin status of the client
    if(req.session.loggedin){
      res.status(200).render("pages/quiz", {questions: results, loggedIn: true, user: us});
    }
    else{
      res.status(200).render("pages/quiz", {questions: results, loggedIn: false, user: us});
    }
		return;
	});
})

//The quiz page posts the results here
//Extracts the JSON containing quiz IDs/answers
//Calculates the correct answers and replies
app.post("/quiz", function(req, res, next){
	let ids = [];
	try{
		//Try to build an array of ObjectIds
		for(id in req.body){
			ids.push(new mongoose.Types.ObjectId(id));
		}

		//Find all questions with Ids in the array
		Question.findIDArray(ids, function(err, results){
			if(err)throw err; //will be caught by catch below

			//Count up the correct answers
			let correct = 0;
			for(let i = 0; i < results.length; i++){
				if(req.body[results[i]._id] === results[i].correct_answer){
					correct++;
				}
			}
      //if the user is logged in then update their score and redirect that user to their profile page
      if(req.session.loggedin){
        db.collection("users").updateOne({ username: req.session.username }, { $inc: { total_quizzes: 1, total_score: correct}}, function(err, result){
      		if(err){
      			console.log("Error reading database");
      			return;
      		}
          let url = "/users/"+us._id;
        	res.json({url: url, correct: correct});
          return;
      	});
    	}
      else{
        //Otherwise just redirect that client to the index page
        res.json({url: "/", correct: correct});
        return;
      }


		});
	}catch(err){
		//If any error is thrown (casting Ids or reading database), send 500 status
		console.log(err);
		res.status(500).send("Error processing quiz data.");
		return;
	}

});

//Connect to database
mongoose.connect('mongodb://localhost/quiztracker', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	app.listen(3000);
	console.log("Server listening on port 3000");
});
