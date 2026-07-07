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

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

app.get('/', (request, response) => {
    response.send('<p>Hello World</p>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(count => {
            response.send(`<p>Phonebook has info for ${count} people</p>
                            <p>${new Date()}</p>`)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
  })
  .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const name = body.name?.trim()
    const number = body.number?.trim()

    if(!name || !number){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    Person.findById(request.params.id)
        .then(person => {
            if(!person){
                return response.status(404).end()
            }

            return findDuplicatePerson(name, number, request.params.id).then(existingPerson => {
                if(existingPerson){
                    return response.status(400).json({
                        error: 'name and number must be unique'
                    })
                }

                return Person.findByIdAndUpdate(request.params.id, { name, number }, {
                    new: true,
                    runValidators: true
                }).then(updatedPerson => {
                    response.json(updatedPerson)
                })
            })
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    const name = body.name?.trim()
    const number = body.number?.trim()

    if(!name || !number){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const person = new Person({
        name,
        number
    })

    findDuplicatePerson(name, number)
        .then(existingPerson => {
            if(existingPerson){
                return response.status(400).json({
                    error: 'name and number must be unique'
                })
            }

            return person.save().then(savedPerson => {
                response.json(savedPerson)
            })
        })
        .catch(error => response.status(400).json({ error: error.message }))

})

const findDuplicatePerson = (name, number, excludeId) => {
    const query = {
        $or: [{ name }, { number }]
    }

    if(excludeId){
        query._id = { $ne: excludeId }
    }

    return Person.findOne(query)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})



