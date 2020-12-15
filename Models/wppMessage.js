const mongoose = require('mongoose');

const WppMessageSchema = new mongoose.Schema({
  texto: {
    type: String,
    required: true,
  },

  anexo: {
    type: String,
    required: false,
  },

  baseDeDados: {
    type: String,
    required: false,
  },

  localAEnviar: {
    type: String,
  },
  ownerId: {
    type: mongoose.Types.ObjectId,
    ref: 'wppMessage',
  }
});

const WppMessage = mongoose.model('wppMessage', WppMessageSchema);

module.exports = { WppMessageSchema, WppMessage };
