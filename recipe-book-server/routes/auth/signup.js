'use strict';
const express = require('express');
const router = express.Router();
const { User } = require('../../models/userSchema');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const app = express();
// app.use(express.json());

router.get('/', (req, res) => {
    res.send('Hello world from Signup');
});

// router.post('/',(req, res) => {
//     console.log(req.body);
//     User
//     .create({
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         email: req.body.email,
//         password: req.body.password
//     })
//     .then(user => res.status(201).json(user.serialize()))
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({ error: 'Something went wrong' });
//     });
// });

//Signup new user
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['email', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            locaiton: missingField
        });
    }

    const stringFields = ['email', 'password', 'firstname', 'lastname'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string');
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            locaion: nonStringField
        });
    }
    //Triming the input
    const explicityTrimmedFields = ['email', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            rason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            locaion: nonTrimmedField
        });
    }

    const sizedFields = {
        email: {
            min: 1
        },
        password: {
            min: 6,
            max: 72
        }
    };

    const tooSmallField = Object.keys(sizedFields).find(
        field => 'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
    );
    const tooLargeField = Object.keys(sizedFields).find(
        field =>
            'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).jsn({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField ? `Must be at least ${sizeFields[tooSmallField].min} characters long`
                : `Must be at most ${sizeFields[tooLargeField].max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let { email, password, firstName = '', lastName = '' } = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim();
    return User.find({ email })
        .count()
        .then(count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Email already exists',
                    location: 'email'
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                firstName,
                lastName,
                email,
                password: hash
               
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ code: 500, message: 'Internal server error' });
        });
});



module.exports = router;