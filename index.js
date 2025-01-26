require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

const PhonebookEntry = require('./models/phonebookEntry')

morgan.token('content', (req) => {
  if (req.method === 'POST') {
    return (JSON.stringify(req.body))
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server on ${PORT}`)

//#region routes

app.get('/api/persons', (request, response, next) => {
  PhonebookEntry.find({})
    .then(res => response.status(200).json(res))
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  const currentDate = Date()
  PhonebookEntry.countDocuments({}).then((count) => {
    response.status(200).send(
      `Phonebook has info for ${count} people.
            </br>
            ${currentDate}`
    )
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  PhonebookEntry.findById(id)
    .then(foundPerson =>
      foundPerson ?
        response.status(200).json(foundPerson) :
        response.status(404).end()
    )
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  console.log(`Request.params: ${JSON.stringify(request.params)}`)

  PhonebookEntry.findByIdAndDelete(id, { new: true })
    .then(deletedNote => response.status(200).json(deletedNote))
    .catch(error => next(error))
})

app.post('/api/persons/', (request, response, next) => {
  const body = request.body

  if (!body.name) { return response.status(400).json({
    error: 'No name specified.'
  })}
  if (!body.number) { return response.status(400).json({
    error: 'No number specified.'
  })}

  const person = new PhonebookEntry ({
    name: body.name,
    phoneNumber: body.number,
  })

  person.save()
    .then(res => response.json(res))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const phonebookEntry = {
    name: body.name,
    phoneNumber: body.phoneNumber,
  }

  console.log(`updating to: ${JSON.stringify(phonebookEntry)}`)

  PhonebookEntry.findByIdAndUpdate(request.params.id, phonebookEntry, { new: true, runValidators: true, context: 'query' })
    .then(updated => response.status(200).json(updated))
    .catch(error => next(error))
})

//#endregion

//#region errorhandler

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: { message: 'Malformed id' } })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error })
  }
  console.error('[ERROR]\n')
  console.error(`error.message = ${error.message}`)
  console.error(`error.name = ${error.name}`)
  next(error)
}

app.use(errorHandler)

//#endregion