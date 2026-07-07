const Person = ({ personsToShow, removePerson }) =>{

    return(
        <div>
        <ul>
            {personsToShow.map(person => 
                <li key={person.id}>
                    {person.name} {person.number} <button type="button" onClick={() => removePerson(person.id)}>delete</button>
                </li>
            )}
        </ul>
        </div>
    )

}

export default Person