const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url).then(() => console.log('[Mongo]Connected.'))

console.log(`[Mongo]Connecting to ${url}`)


const phonebookEntrySchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  phoneNumber: {
    type: String,
    minLength: 8,
    validate: {
      validator: (val) => {
        const idxOfDash = val.indexOf('-')

        if ( !(idxOfDash === 2 || idxOfDash === 3)) {
          return false
        }

        if (isNaN(val.replace('-', ''))) {
          return false
        }
        return true
      },
      message: 'The phonenumber format should comply to the course standards.'
    }
  }
})

phonebookEntrySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('phonebookEntry', phonebookEntrySchema)