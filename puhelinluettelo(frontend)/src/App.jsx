import { useState, useEffect } from 'react'
import Person from './Components/Person'
import Filter from './Components/Filter'
import PersonForm from './Components/PersonForm'
import personsService from './Services/personsService'
import Notification from './Components/Notification'

const App = () => {

  const [persons, setPersons] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [alert, setAlert] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleFilter = (event) => {
    setSearchValue(event.target.value)
  }

  const handleNewName = (event) => {
    setNewName(event.target.value)
  }

  const handleNewNumber = (event) => {
    setNewNumber(event.target.value)
  }


  const getNextId = () => {
    const previousId = persons.length
    console.log(previousId)
    const newId = previousId+1
    console.log(newId)
    return newId
  }

  const addName = (event) => {
    event.preventDefault()

    const trimmedName = newName.trim()
    const trimmedNumber = newNumber.trim()

    const nameExists = persons.some(person =>
      person.name.toLowerCase() === trimmedName.toLowerCase()
    )
    const numberExists = persons.some(person =>
      person.number.toLowerCase() === trimmedNumber.toLowerCase()
    )

    if (numberExists) {
      setErrorMessage(`${trimmedNumber} is already added to phonebook`)
      setTimeout(() => setErrorMessage(null), 5000)
      return
    }

    if (nameExists) {
      if(window.confirm(`${trimmedName} already exists, replace the old number with a new one?`)){
        handleReplaceNumber(trimmedName, trimmedNumber)
      }

      return
    }

    const nameObject = {
      name: trimmedName,
      number: trimmedNumber,
      id: getNextId()
    }

    personsService
      .create(nameObject)
      .then(returnedPersons =>{
        setPersons(persons.concat(returnedPersons))
        setNewName('')
        setNewNumber('')
        setAlert(`${trimmedName} was added successfully`)
        setTimeout(() => {
          setAlert(null)
        }, 5000)
      })
      .catch(error => {
        const errorMessage = error.response?.data?.error || error.response?.data || 'Validation failed'
        setErrorMessage(errorMessage)
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }

  const handleReplaceNumber = (trimmedName, trimmedNumber) =>{
    const personToUpdate = persons.find(person => person.name === trimmedName)
    console.log(personToUpdate)

    const updatedPerson = {
      name: trimmedName,
      number: trimmedNumber
    }

    personsService
      .update(personToUpdate.id, updatedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(person =>
          person.id === personToUpdate.id ? returnedPerson : person
        ))
        setAlert(`${trimmedName} was updated successfully`)
        setTimeout(() => {
          setAlert(null)
        }, 5000)
        setNewName('')
        setNewNumber('')
      })
      .catch(error => {
        const errorMessage = error.response?.data?.error || error.response?.data || 'Validation failed'
        setErrorMessage(`${errorMessage}`)
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }

  const removePerson = (id) => {
    const personToRemove = persons.find(person => person.id === id)

    if (!window.confirm(`Delete ${personToRemove.name}?`)) {
      return
    }

    personsService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id))
      })
  }

  const personsToShow = searchValue
    ? persons.filter(person => {
      return Object.values(person)
        .join(' ')
        .toLowerCase()
        .includes(searchValue.toLowerCase())
    })
    : persons

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={alert} className="message" />
      <Notification message={errorMessage} className="error" />
      <Filter searchValue={searchValue} handleFilter={handleFilter} />
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNewName={handleNewName}
        handleNewNumber={handleNewNumber}
        addName={addName}
      />
      
      <h2>Numbers</h2>
      <Person personsToShow={personsToShow} removePerson={removePerson} />
    </div>
  )

}

export default App