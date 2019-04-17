var inquirer = require('inquirer')
inquirer
  .prompt([
    /* Pass your questions in here */
    {
      name: 'trusker',
      message: 'Le nom du trusker :',
    },
    {
      name: 'société',
      message: 'Le nom de la société',
    },
    {
      name: "nombre d'employés",
      message: "Le nombre d'employés",
    },
    {
      name: 'nombre de camions',
      message: 'Le nombre de camion',
    },
  ])
  .then(answers => {
    // Use user feedback for... whatever!!
    console.log(answers)
  })
