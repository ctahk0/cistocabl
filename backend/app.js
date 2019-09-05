const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const adminRoutes = require('./api/routes/admin');
const userRoutes = require('./api/routes/user');


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, ResponseContentType, Accept, Authorization'
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"

    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

app.use(helmet());

/** USE TO LOG REQUESTS TO TERMINAL */
app.use(morgan('dev'));

/** BODY PARSER */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


/** SET UP ROUTES */
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);


/** ERROR HANDLING */
app.use((req, res, next) => {
    const error = new Error('Not found!');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;