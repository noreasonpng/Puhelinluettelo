import { useState } from 'react'

const Filter = ({ searchValue, handleFilter }) =>{


    return(
        <div>
        Filter phonebook: <input value={searchValue} onChange={handleFilter}/>
        </div>
    )

}

export default Filter