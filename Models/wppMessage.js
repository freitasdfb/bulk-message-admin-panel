const mongoose = require('mongoose');


const WppMessageSchema = mongoose.model('wppMessage', {
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

  status: {
      type: String,
      enum: ['aguardando', 'executando', 'executada']
  },
  ownerId: {
      type: String
  }
})

const WppMessage = mongoose.model('wppMessage', WppMessageSchema);

module.exports = { WppMessageSchema, WppMessage };
