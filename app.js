var express = require('express');
var loki = require('lokijs'); 
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

// Crypt
var salt = bcrypt.genSaltSync(10);

var port = 2001;

var app = express();

app.use(express.static("public"));
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.set('view engine', 'pug');
app.use(bodyParser.json());

// Data base
var db = new loki('loki.json');
var users = db.addCollection('users');
var books = db.addCollection('books');

var adminPassword = bcrypt.hashSync("a", salt);
var userPas1 = bcrypt.hashSync("q", salt);
var userPas2 = bcrypt.hashSync("mikeqwerty", salt);
users.insert({'firstName': 'Timur', 'lastName': 'Fatykhov', 'university': 'NSTU', 'email': 'a', 'password': adminPassword, 'booksID': [], 'admin': '1'});
users.insert({'firstName': 'Mike', 'lastName': 'Turchinovich', 'university': 'NSU', 'email': 'mike@mail.ru', 'password': userPas1, 'booksID': []});
users.insert({'firstName': 'Timur', 'lastName': 'Fatykhov', 'university': 'NSTU', 'email': 'q', 'password': userPas2, 'booksID': ['123i','1f3','lk3']});
books.insert({'name': 'Google: How it works', 'genre': 'Fantastic', 'year': '2016', 'amount': '1', 'authors': ['Eric Shmidt','Jonathan Rozenberg'], 'id': '123i'});
books.insert({'name': 'Постигая Agile', 'genre': 'I don\'t know', 'year': '2014', 'amount': '1', 'authors': ['Эндрю Стеллман','Дженнифер Грин'], 'id': '1f3'});
books.insert({'name': 'Богатый папа бедный папа', 'genre': 'I don\'t know', 'year': '2014', 'amount': '1', 'authors': ['Мужчина из Китая','Дженнифер Грин'], 'id': 'lk3'});

function findUser(email, callback)
{
    var searchParameters = {email : email};
    console.log("at findUser")
    var results = users.find(searchParameters);
    // console.log(results);
    if (results.length > 0)
    {
        var user = results[0];
        // console.log(user);
        return callback(null, user);
    }
    return callback(null);
};

passport.serializeUser(function(user, done) 
{
    console.log("serialize start");
    done(null, user.email);
    console.log("serialize end");
});
  
passport.deserializeUser(function(email, done) 
{
console.log("DEserialize start");
findUser(email, function(err, user) 
{
    done(err, user);
});
console.log("DEserialize end");
});

// make our strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
function(email, password, done) 
{
    findUser(email, function(err, user) 
            {
                if (err) 
                { 
                    return done(err); 
                }

                if (!user) 
                {
                    return done(null, false, { message: 'Incorrect username.' });
                }

                if (!bcrypt.compareSync(password, user.password)) 
                {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user);
            });
}
));
   
// Pages for WEB
app.get('/', function(req,res)
{
    // first page
    res.render('index', {title: 'UniLib', message: req.query.message});
});

app.post('/logIn', passport.authenticate('local', { successRedirect: '/mainPage',
                                                    failureRedirect: '/?message=Ivalid username or password', 
                                                    failureFlash: 'Invalid username or password.'})
);

app.all(/\/(mainPage|user)/, function(req,res,next)
{
    if(req.isAuthenticated)
    {
        next();
    }
    else
    {
        res.redirect('/');
    }
});

app.get('/mainPage', function(req,res)
{
    var IDs = [];
    var userBooks = [];
    var user = req.user;
    if (user)
    {
        var email = user.email;
    
        console.log('from main page:' + email);
    
        IDs = user.booksID;
    
        for (var i = 0; i < IDs.length; i++)
        {
            var book = books.find({'id': IDs[i]})[0];
    
            userBooks.push(book);
        }
    
        res.render('mainPage', {title: 'Unilib', user: user, books: userBooks, bookCount: IDs.length});
    }
    else
    {
        res.redirect('/');
    }
});

// Data Base
app.get('/getAllUsers', function(req,res)
{
    res.send(users);
});

app.get('/getAllBooks', function(req,res)
{
    res.send(books);
});

app.post('/addBook', function(req,res)
{
    console.log('I catched POST request! (addBook)');
    console.log(req.body.authors)

    var id = req.body.id;
    console.log(id);
        if ( JSON.stringify( books.find({'id': id})[0] )  != undefined) // this id already exist
        {
            console.log('id is occupied');
            res.end();
            return
        }

    books.insert(req.body);

    res.end(JSON.stringify(req.body));
    console.log(JSON.stringify(req.body));
    console.log('I processed request (addBook)');
});

app.post('/addUser', function(req, res)
{
    console.log('I catched POST request! (addUser)');

    var email = req.body.email;

    if ( JSON.stringify( users.find({'email': email})[0] )  != undefined) // this email already exist
    {
        console.log('email is occupied');
        res.end();
        return
    }
    var password = req.body.password;
    var hashPassword = bcrypt.hashSync(password, salt);
    data = req.body;
    data.password = hashPassword;
    data['booksID'] = []   // user's books
    users.insert(data);

    res.end(JSON.stringify(data));

    console.log(JSON.stringify(data));
    console.log('I processed request (addUser)')
});

app.post('/verification', function(req, res)
{
    console.log('I catched POST request (verification)');
    var email = req.body.email;
    var password = req.body.password;

    var user = users.find( { 'email' : email, 'password' : bcrypt.hashSync(password, salt)});

    console.log(JSON.stringify(user[0])); // delete IT!
    res.end(JSON.stringify(user[0]));    

    console.log('I processed request (verification)');
});

app.post('/searchBook', function(req, res)
{
    console.log('I catched POST request (searchBook)');

    var searchReq = req.body.string;
    var results = books.where(function(obj) 
    {
        if (String(obj.name).includes(searchReq))
        {
            return true;
        }

        if (obj.id == searchReq)
        {
            return true
        }

        if (obj.year == searchReq)
        {
            return true;
        }

        if (obj.amount == searchReq)
        {
            return true;
        }

        var authors = obj.authors;
        for (var i = 0; i < authors.length; i++)
        {
            if (authors[i].includes(searchReq))
            {
                return true;
            }
        }
        return false;
    });

    res.end(JSON.stringify(results));
    console.log('Result: ' + JSON.stringify(results));
    console.log('I processed request (searchBook)');
});

app.post('/searchBookWithID', function(req, res)
{
    console.log('I catched POST request (search with ID)');

    var id = req.body.id;
    var results = books.find({'id': id});

    res.end(JSON.stringify(results));
    console.log('Result: ' + JSON.stringify(results));
    console.log('I processed request (search with ID)');
});

app.post('/bookIt', function(req, res)
{
    console.log('I catched POST request (bookIt)');
    var id = req.body.id;
    var userEmail = req.body.email;

    console.log("id: " + id + "userEmail: " + userEmail);
    var book = books.find({'id': id})[0];
    if (book.amount > 1)
    {
        book.amount = String(book.amount - 1);
        books.update(book);
    
        user = users.find({'email': userEmail})[0];
        user.booksID.push(id);
        users.update(user)
        res.send("Ok");
    }
    else 
    {
        res.send();
    }
    
    console.log('I processed request (bookIt)');
});

app.post('/deleteIt', function(req, res)
{
    console.log('I catched POST request (deleteIt)');
    var id = req.body.id

    var book = books.find({'id': id});
    if (book.length > 0)
    {
        books.remove(book);
        res.send('deleted')
    }
    else
    {
        res.send();
    }
    console.log('I processed request (deleteIt)');    
});

// Data Base for WEB only
app.post('/searchBookWeb', function(req, res)
{
    console.log('I catched POST request (searchBookWeb)');
    var searchReq = req.body.string;
    var results = books.where(function(obj) 
    {

        if (String(obj.name).includes(searchReq))
        {
            return true;
        }

        if (obj.id == searchReq)
        {
            return true
        }

        if (obj.year == searchReq)
        {
            return true;
        }

        if (obj.amount == searchReq)
        {
            return true;
        }

        var authors = obj.authors;
        for (var i = 0; i < obj.authorsCount; i++)
        {
            if (authors[i].includes(searchReq))
            {
                return true;
            }
        }
        return false;
    });
    console.log(results);
    for (book in results)
    {
        if (req.user.booksID.includes(results[book].id))
        {
            results[book]['reserved'] = 1;
        }
        else
        {
            results[book]['reserved'] = 0;
        }
    }
    res.end(JSON.stringify(results));
    console.log('I processed request (searchBookWeb)');
});

app.post('/bookItWeb', function(req, res)
{
    console.log('I catched POST request (bookItWeb)');
    var id = req.body.id;
    var userEmail = req.user.email;

    var book = books.find({'id': id})[0];
    if (book.amount > 0)
    {
        book.amount = String(book.amount - 1);
        books.update(book);
    
        user = users.find({'email': userEmail})[0];
        user.booksID.push(id);
        users.update(user)
    
        res.send("ok");
    }
    else
    {
        res.send()
    }
    
    console.log('I processed request (bookItWeb)');
});

app.post('/userBooksWeb', function(req,res)
{
    var result = [];

    for (id in req.user.booksID)
    {
        result.push(books.find( {id: req.user.booksID[id]} )[0]);
    }

    res.send(JSON.stringify(result));
});

app.post('/userIsAdmin', function(req,res)
{
    if (req.user.admin == '1')
    {
        res.send('1');
    }
    else
    {
        res.send('0');
    }
});

// Run server
app.listen(port, function(){console.log('Server started at port: ' + port)});