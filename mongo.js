const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const phoneNumber = process.argv[4]

const url =
  `mongodb+srv://damicore:${password}@cluster0.gagvo.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phonebookEntrySchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
})

const PhonebookEntryModel = mongoose.model('phonebookEntry', phonebookEntrySchema)

if (process.argv.length < 4) {
  PhonebookEntryModel.find({}).then(entries => {
    console.log('Phonebook:')

    entries.forEach( e => {
      console.log(`${e.name} ${e.phoneNumber}`)
    })

    mongoose.connection.close()
  })
} else {
  const phonebookEntry = new PhonebookEntryModel({
    name: name,
    phoneNumber: phoneNumber
  })

  phonebookEntry.save(phonebookEntry).then( () => {
    console.log(`Added ${name} to the phonebook.`)
    mongoose.connection.close()
  })
}