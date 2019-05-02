const {
  isAlphabeticStringNoNull,
  questionFactory,
  questionPromptFactory,
} = require('./onboadingTrusk')

//first unit test
test('test if a parameter is an alphabetical no null string', () => {
  expect(isAlphabeticStringNoNull('Ä')).toBe(true)
})

//first integration test
test('create question for supply to prompt', () => {
  const data = questionFactory(
    'nbEmployés',
    "Nombre d'employés chez Trusk",
    'string'
  )
  expect(data).toEqual({
    name: 'nbEmployés',
    message: "Nombre d'employés chez Trusk",
    type: 'string',
  })
})

test('prompt a question about trusker name', async () => {
  //user have to reply "Bot" to the prompt
  //I don't know how to test an expected value supply by the user in the prompt, then I suppose he will hint "Bot"
  // to the question "Nom du Test"
  jest.setTimeout(10000)
  const result = await questionPromptFactory(
    'test',
    'Nom du Test',
    'string'
  ).then(data => {
    expect(data).toEqual({ test: 'Bot' })
  })
})
