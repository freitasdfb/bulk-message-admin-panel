/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },
    encryptedPassword: {
        type: String,
        required: true,
    },
    perfil: {
        type: String,
        enum: ['admin', 'user'],
        required: true,
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = { UserSchema, User };
