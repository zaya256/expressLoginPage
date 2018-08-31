//ajillaj bn.
// //EXPRESS DEER LOGIN HIIHED PROTECTED PAGE UUSGEH DASGAL YUM
//EHLEED NPM INIT GEEREI. DARAA N NODE MODULES SUULGAHIIN TULD NPM I _S COOKIE-PARSER EXPRESS GEH MET BUGDIIG N SUULGANA.

//http://localhost:3000/ deer login, user geh met zuils haragdanj bn. buruu hiivel tryagain pagiig haruulna

const express = require('express');
const uuid = require('uuid/v4')
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); // be able to parse form elements
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // a 'strategy' to use for passport
const path = require('path');
const port = process.env.PORT | 3000;
// this is our most "Hacker Proof" users database ;p
// We need to swap this out with a real DB later, but for now this will do!
const users = [
    {id: 0, username: 'jason', password: 'abc', email: 'jason@example.com'},
    {id: 1, username: 'kate', password: '123', email: 'kate@example.com'}
];
// helper function for looking up a user
// Yes, we will replace this with a QUERY loookup later.
function findByUsername(username, callback) {
    for (let i = 0, len = users.length; i < len; i++) {
        const user = users[i];
        if (user.username === username) {
            // callback takes arguments (error,user)
            return callback(null, user);
        }
    }
    return callback(null, null);
}
// define which strategy passport uses
passport.use(new LocalStrategy({
        // this maps the field names in the html form to the passport stuff
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
    const invalidLoginMessage = "Invaild user name and/or password.";
// replace this with a DB QUERY function later
findByUsername(username,  (err, user) =>{
    if (err) {
        return done(err);
    }
    if (!user) {
    console.log(`Missing user object: ${invalidLoginMessage}`);
    return done(null, false, {message: invalidLoginMessage});
} else {
    if (user.password === password) {
        console.log('valid username and password');
        return done(null, user);
    } else {
        console.log(`User name: ${user.username} Password: ${user.password} :: ${password} valid username but password is wrong`);
        return done(null, false, {message: invalidLoginMessage});
    }
}
});
}
));
//Save the user id in session
//could save the user object, choose to only save the user id
passport.serializeUser((user, done)=>{
    console.log(`saving user to session: ${JSON.stringify(user)}`);
done(null, user.id);
});
//Remove the user id out from the session
passport.deserializeUser((id, done) =>{
    //should check if this is a valid user id
    //then using done to remove the user from session
    console.log(`retrive user -${JSON.stringify(id)}- JSON.stringify(${users[id]})`);
const user = users[id];
done(null, user);
});
const app = express();
// configure app
app.use('/', express.static('public')); // set to display index.html could also use sendFile
app.use(cookieParser('cohort6'));
app.use(bodyParser.urlencoded({extended: false})); // use for forms
app.use(bodyParser.json()); // use for JSON
app.use(session({
    genid: (req) => {
    console.log('Inside session middleware genid function')
console.log(`Request object sessionID from client: ${req.sessionID}`)
return uuid() // use UUIDs for session IDs
},
store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
// create the login get and post routes
// app.get('/login', (req, res) => {
//     console.log('Inside GET /login callback')
//     console.log(req.sessionID)
//     res.send(`You got the login page!\n`)
//   });
// custom callback
app.post('/login', (req, res, next) =>{
    passport.authenticate('local',  (err, user, info) =>{
    console.log(err, user, info);
if (user) {
    //console.log('Here Passport');
    // if Authenticated
    //for debug purpose print out user info
    //res.send({user: user});
    //res.redirect('/welcome.html');
    //
    //this login is make it available by passport
    console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
    console.log(`req.user: ${JSON.stringify(req.user)}`);
    req.login(user, (err)=>{
        console.log(`After LOGIN: req.session.passport: ${JSON.stringify(req.session.passport)}`);
    console.log(`req.user: ${JSON.stringify(req.user)} \n ${req.isAuthenticated()}`);
    res.sendFile(path.join(__dirname + '/protected/welcome.html'));
});

} else {
    //for debug purpose print out the login info
    //res.send({error: err, info: info});
    //res.redirect('/tryagain.html');
    res.redirect('/tryagain');
}
})(req, res, next);
});
const tryagainPath = __dirname + '/public/tryagain.html';
app.get('/tryagain', (req, res) =>{
    res.sendFile(tryagainPath);
});
const isAuthenticated = (req, res, next)=>{
    if(req.isAuthenticated()){
        console.log('isAuthenticated');
        return next();
    }
    console.log('NOT Authenticated');
    res.redirect('/login');
};
app.get('/login', (req, res)=>{
    console.log(`get login :${req.isAuthenticated()}`);
res.redirect('/');
})
app.get('/protected', isAuthenticated, function(req, res){
    res.send('You are authorized.  This is protected.');
});
// // Get Homepage
// app.get('/protected', userAuthenticated, function(req, res){
//     console.log('Accessing Protected file');
//  res.sendFile(path.join(__dirname + 'protected/welcome.html'));
// });
// function userAuthenticated(req, res, next){
//  if(req.isAuthenticated()){
//      return next();
//  } else {
//      //req.flash('error_msg','You are not logged in');
//      res.redirect('/');
//  }
// }
// app.use(function (req, res, next) {
//     if (!userAuthenticated(req)) {
//         return res.redirect('/login');
//     }
//     next();
// });
// app.use(express.static(__dirname + '/public'));
app.listen(port, () =>
{
    console.log(`Passport Local Strategy example app listening on port ${port}!`)});