require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
const morgan = require('morgan')
morgan.token('body', (request) => {
    if (request.method !== 'POST' || !request.body) {
        return '-'
    }

    return `{name: ${request.body.name} number: ${request.body.number}}`
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-532532"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-12-111111"
    },
    {
        id: "4",
        name: "Mary Poppendick",
        number: "39-23-000000"
    }
]


app.get('/', (request, response) => {
    response.send('<p>Hello World</p>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
                    <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if(person){
        response.json(note)
    }else{
        response.status(404).end()
    }
  })
  .catch(error => next(error))
})




app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if(!body.number || !body.name){
        return response.status(400).json({
            error: 'content missing'
        })
    }
    if(checkNewNumber(body) === 1){
        return response.status(400).json({
            error: 'Name must be unique'
        })
    }
    if(checkNewNumber(body) === 2){
        return response.status(400).json({
            error: 'Number must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

    persons = persons.concat(person)

})

const checkNewNumber = (body) =>{
    for(let i = 0; i < persons.length; i++){
        let person = persons[i]
        if(body.name === person.name){
            return 1
        }
        if(body.number === person.number){
            return 2
        }
    }
}

const generateId = () => {
   return Math.floor(Math.random() * (10000 - 0 + 1)) + 0
}

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

app.use(errorHandler)