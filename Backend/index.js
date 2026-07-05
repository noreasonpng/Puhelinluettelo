require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.json())

const Person = require('./models/person')

morgan.token('body', (request) => {
    if (request.method !== 'POST' || !request.body) {
        return '-'
    }

    return `{name: ${request.body.name} number: ${request.body.number}}`
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('dist'))

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
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)
  
  console.log(`Person with id ${id} was deleted.`)

  response.status(204).end()
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

    const number = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(number)
    response.json(number)

    return response.status(200)
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