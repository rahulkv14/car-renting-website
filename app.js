const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const compression = require('compression');

const electricRouter = require('./routes/electric_index');
const gasRouter = require('./routes/gas_index');
const adminRouter = require('./routes/admin');
var UserModel = require("./models/CustomerModel");

const app = express();


// 🔥 CONNECTING TO MONGODB (FIXED)
const db = async () => {
    try {
        const conn = await mongoose.connect(
            'mongodb://host.docker.internal:27017/autorizz', // ✅ FIXED
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );

        console.log("✅ MongoDB connected");

    } catch (err) {
        console.log("❌ MongoDB Error : Failed to connect");
        console.log(err);
        process.exit(1);
    }
};

db();


// 🔥 VIEW ENGINE SETUP
app.engine('.hbs', exphbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', '.hbs');


// 🔥 MIDDLEWARE
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());


// 🔥 SERVER LOG
console.log("🚀 App running on port 5000");


// 🔥 ROUTES
app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home', function (req, res) {
    res.sendFile(path.join(__dirname, "routes/home.html")); // ✅ safer path
});

app.use('/admin', adminRouter);
app.use('/electric', electricRouter);
app.use('/gas', gasRouter);


// 🔥 USER API
app.post('/customer', async (req, res) => {
    try {
        const user = new UserModel({
            name: req.body.username,
            email: req.body.useremail,
            phone: req.body.userphone
        });

        const user_res = await user.save();
        console.log(user_res);

        res.status(201).json({ message: "User saved successfully" }); // ✅ response added

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save user" });
    }
});


// 🔥 404 HANDLER
app.use(function (req, res, next) {
    next(createError(404));
});


// 🔥 ERROR HANDLER
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
