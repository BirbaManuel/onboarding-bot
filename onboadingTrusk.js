const inquirer = require('inquirer')
const redis = require('redis')
const bluebird = require('bluebird')
const chalk = require('chalk')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const configRedis = { host: '127.0.0.1', port: 6379 }

async function initBot() {
  // Step 1 : Le nom du trusker
  const truskNamePrompt = await getValidTruskerPrompt()
  // Step 2 : Le nom de la société
  const truskSociétéNamePrompt = await getValidSocietePrompt()
  // Step 3 : Le nombre d'employés
  const employésPrompt = await getValidNombreEmploye()
  //create template of prompt questions
  const templateEmployées = {
    name: 'nomEmployes',
    message: "Nom de l'employés",
    type: 'string',
  }
  //create an array which contain the current prompt to get each name
  const nomsEmployées = repeatQuestionPrompt(
    templateEmployées,
    employésPrompt.nombreEmployés
  )
  // Step 4 : Pour chaque employé son nom
  const nomsEmployéesArrayRaw = await getEmployeesNameQuestion(nomsEmployées)
  // Step 5 : Le nombre de camion
  const camionPrompt = await getNombreCamionPositif()
  const camions = repeatQuestionPrompt(
    {
      name: 'volumeCamion',
      message: 'le volume en m³ du camion',
      type: 'string',
    },
    camionPrompt.nombreCamion
  )
  const volumeCamionPrompt = getVolumeCamionPrompt(camions)
  //Step 6 : Pour chaque camion le volume en m³ du camion
  const resCamionVolume = await getValidVolumeCamion(volumeCamionPrompt)
  //Step 7 : Le type de camion
  const typeCamionPrompt = getTypeCamionPrompt(camions)
  const resTypeCamion = await getValidTypeCamion(typeCamionPrompt)

  const submitResponse = {
    truskNamePrompt,
    truskSociétéNamePrompt,
    employésPrompt,
    nomsEmployéesArrayRaw,
    camionPrompt,
    resCamionVolume,
    resTypeCamion,
  }
  const endingPrompt = await confirmForm(submitResponse)
}

/*************************************         BEGIN  INPUT VALIDATORS           ********************************************/
function isAlphabeticStringNoNull(str) {
  const lString = new RegExp(
    /[a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]/
  )
  return lString.test(str) && str.length != 0
}
function isNumberSupZéro(num) {
  return Number.isInteger(num) && num >= 0
}
function checkingStringObjectValue(objectString) {
  return Object.values(objectString).every(el => {
    return isAlphabeticStringNoNull(el) === true
  })
}
function checkingNumberObjectValue(objectString) {
  return Object.values(objectString).every(el => {
    return isNumberSupZéro(el) === true
  })
}
/*************************************         END  INPUT VALIDATORS           ********************************************/
/*************************************         BEGIN    PROMPT TEMPLATES          ********************************************/

function questionPromptFactory(name, message, type) {
  const question = questionFactory(name, message, type)
  return inquirer.prompt(question)
}
function getNomTrusker() {
  const question = questionFactory('trusker', 'Nom du Trusker', 'string')
  return inquirer.prompt(question)
}
function getNomSociété() {
  const question = questionFactory('societe', 'Nom de la société', 'string')
  return inquirer.prompt(question)
}
function getNombreEmploye() {
  const questions = questionFactory(
    'nombreEmployés',
    "Nombre d'employés",
    'number'
  )
  return inquirer.prompt(questions)
}
function getNomEmployé() {
  const question = questionFactory('employé', "Nom de l' employé", 'string')
  return inquirer.prompt(question)
}
function getVolumeCamion(params) {
  return inquirer.prompt([
    {
      name: 'nombreCamion',
      message: 'Nombre de Camion',
      type: 'number',
    },
  ])
}
/*************************************          END  PROMPT TEMPLATES            ********************************************/
/*************************************           BEGIN  RECURSIVE PROMPT           ********************************************/
//Action for step 1
async function getValidTruskerPrompt() {
  const res = await getNomTrusker()
  if (!isAlphabeticStringNoNull(res.trusker)) return getValidTruskerPrompt()
  return res
}
//Action for step 2
async function getValidSocietePrompt() {
  const res = await getNomSociété()
  if (!isAlphabeticStringNoNull(res.societe)) return getValidSocietePrompt()
  return res
}
//Action for step 3
async function getValidNombreEmploye() {
  const res = await getNombreEmploye()
  if (!isNumberSupZéro(res.nombreEmployés)) return getValidNombreEmploye()
  return res
}
//Action for step 4
async function getValidNomEmploye(arg) {
  const res = await inquirer.prompt(arg)
  if (!isAlphabeticStringNoNull(res.employe)) return getValidNomEmploye(arg)
  return res
}
//Action for step 5
async function getNombreCamionPositif() {
  const res = await getVolumeCamion()
  if (!isNumberSupZéro(res.nombreCamion)) return getNombreCamionPositif()
  return res
}
//Action for step 6
async function getValidVolumeCamion(arg) {
  const res = await inquirer.prompt(arg)
  if (!checkingNumberObjectValue(res)) return getValidVolumeCamion(arg)
  return res
}
//Action for step 7
async function getValidTypeCamion(arg) {
  const res = await inquirer.prompt(arg)
  if (!checkingStringObjectValue(res)) return getValidTypeCamion(arg)
  return res
}
/*************************************           END  RECURSIVE PROMPT           ********************************************/

/*************************************         BEGIN   QUESTION TEMPLATES           ********************************************/
function questionFactory(name, message, type) {
  const question = new Object({
    name: name,
    message: message,
    type: type,
  })
  return question
}
/*************************************         END    QUESTION TEMPLATES          ********************************************/

/*************************************         BEGIN   FACTORY QUESTIONS TRANSFORMER           ********************************************/
function repeatQuestionPrompt(item, times) {
  return new Array(times).fill(item)
}
async function getEmployeesNameQuestion(nameEmployees) {
  const resmap = await nameEmployees.map((message, i) => {
    return {
      name: `${message.name}-${i + 1}`,
      message: `Nom de l'employés-${i + 1}`,
      type: `${message.type}`,
    }
  })
  const resprompt = await inquirer.prompt(resmap)
  if (!checkingStringObjectValue(resprompt))
    return getEmployeesNameQuestion(nameEmployees)
  return resprompt
}
function getVolumeCamionPrompt(camionsNames) {
  return camionsNames.map((camion, numCamion) => {
    return questionFactory(
      `volumeCamion-${numCamion + 1}`,
      `Volume camion ${numCamion + 1}/${camionsNames.length}`,
      'number'
    )
  })
}
function getTypeCamionPrompt(camionsNames) {
  return camionsNames.map((message, i) => {
    return {
      name: `typeCamion-${i + 1}`,
      message: `Le type du camion ${i + 1}/${camionsNames.length}`,
      type: 'input',
    }
  })
}

function confirmForm(msg) {
  const {
    truskNamePrompt: { trusker: nomDuTrusker },
    truskSociétéNamePrompt: { societe: nomSociete },
    employésPrompt: { nombreEmployés: nbEmployé },
    nomsEmployéesArrayRaw: nomEmployé,
    camionPrompt: { nombreCamion: nbCamion },
    resCamionVolume: volumeCamion,
    resTypeCamion: typeCamion,
  } = msg
  return inquirer
    .prompt({
      name: 'responseIsOk',
      message: `Les réponses sont-elles valides :
                - Le nom du trusker : ${JSON.stringify(nomDuTrusker)}
                - Le nom de la société : ${JSON.stringify(nomSociete)}
                - Le nombre d'employés : ${JSON.stringify(nbEmployé)}
                - Pour chaque employé son nom : ${JSON.stringify(
                  Object.values(nomEmployé)
                )}
                - Le nombre de camion : ${JSON.stringify(nbCamion)}
                - Pour chaque camion le volume en m³ du camion : ${JSON.stringify(
                  volumeCamion
                )}
                - Le type de camion : ${JSON.stringify(typeCamion)}
`,
      type: 'confirm',
    })
    .then(respons => {
      if (!respons.responseIsOk) initBot()
      else {
        console.log('Aurevoir merci')
      }
    })
}
/*************************************         END   FACTORY QUESTIONS TRANSFORMER            ********************************************/
initBot()

exports.isAlphabeticStringNoNull = isAlphabeticStringNoNull
exports.questionPromptFactory = questionPromptFactory
exports.questionFactory = questionFactory
