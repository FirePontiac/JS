var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var app = express();

/*var logger = function (req, res, next){ // Main part for Visible Logging и можно много чего ещё тут
	console.log('Logging ...');
	next();
}

app.use(logger);
*/

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));  // after install nodemon we don't need to restart server 

// Set Static Path; something like jquery or anothere else
app.use(express.static(path.join(__dirname, 'public')));

// Global Vars                       // так работает валидатор! ещё см в index.ejs, проверяется все ли поля введены и если нет то выходится те поля которые не введены с ошибибками пользователю на страницу чтобы он их исправил

app.use(function(req, res, next){
	res.locals.errors = null;
	next();
});

// Legasy for now, Probably must have (Express Validator MiddleWare)
// In this example, the formParam value is going morphed into form body format useful for printing
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;
		while (namespace.length) {
			formParam += '['+ namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));


// Подключить валидатор современный, А ЭТО НЕ работает!

/* const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

app.post('/user', [
  check('username')
    // Every validator method in the validator lib is available as a
    // method in the check() APIs.
    // You can customize per validator messages with .withMessage()
    .isEmail().withMessage('must be an email')

    // Every sanitizer method in the validator lib is available as well!
    .trim()
    .normalizeEmail()

    // ...or throw your own errors using validators created with .custom()
    .custom(value => {
      return findUserByEmail(value).then(user => {
        throw new Error('this email is already in use');
      })
    }),

  // General error messages can be given as a 2nd argument in the check APIs
  check('password', 'passwords must be at least 5 chars long and contain one number')
    .isLength({ min: 5 })
    .matches(/\d/),

  // No special validation required? Just check if data exists:
  check('addresses.*.street').exists(),

  // Wildcards * are accepted!
  check('addresses.*.postalCode').isPostalCode(),

  // Sanitize the number of each address, making it arrive as an integer
  sanitize('addresses.*.number').toInt()
], (req, res, next) => {
  // Get the validation result whenever you want; see the Validation Result API for all options!
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  // matchedData returns only the subset of data validated by the middleware
  const user = matchedData(req);
  createUser(user).then(user => res.json(user));
});

*/


/*const { check, oneOf, validationResult } = require('express-validator/check');
app.post('/start-freelancing', oneOf([
  check('programming_language').isIn(['javascript', 'java', 'php']),
  check('design_tools').isIn(['photoshop', 'gimp'])
]), (req, res, next) => {
  try {
    validationResult(req).throw();

    // yay! we're good to start selling our skilled services :)))
    res.json(...);
  } catch (err) {
    // Oh noes. This user doesn't have enough skills for this...
    res.status(422).json(...);
  }
});
*/
app.get('/', function(req, res) { // Main part for the brouser line!!!
	db.users.find(function (err, docs) {
	// docs is an array of all the documents in mycollection
	res.render('index', {
		title: 'Customers',
		users: docs
	});
	}); 
});

app.post('/users/add', function(req, res){ // проверка все ли поля в форме ввода работают и в консоль выводится соответствующее сообщение
	req.checkBody('first_name', 'First Name is Required').notEmpty();
	req.checkBody('last_name', 'Last Name is Required').notEmpty();
	req.checkBody('email', 'email is Required').notEmpty();

	var errors = req.validationErrors(); // проверка все ли поля в форме ввода работают и в консоль выводится соответствующее сообщение

	if (errors) {
		res.render('index', {
			title: 'Customers',
			users: users,
			errors: errors
	});  

	} else {
		var newUser = {
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		email: req.body.email,
	}

	// console.log(req.body.first_name);
	//console.log('Success');
	db.users.insert(newUser, function(err, result){
		if (err) {console.log(err);}
		res.redirect('/');
	});
	}
	
});

app.delete('/users/delete/:id', function(req, res){  // только выводит их БД ID в консоль после подтверждения в броузере при console.log
	//console.log(req.params.id);
	db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
		if (err){console.log(err)}
		res.redirect('/');
	})
});

app.listen(3000, function() {    // Main part for Console on backside
	console.log('Server Started on Port 3000...');
})
