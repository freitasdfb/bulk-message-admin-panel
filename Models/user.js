/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const User = new mongoose.Schema('User', {
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
        enum: ['usuario', 'admin'],
        required: true,
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = { UserSchema, User };
