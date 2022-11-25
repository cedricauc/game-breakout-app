const csv = require('csv-parser');
const fs = require('fs');
const { RESPONSES_INPUT_KEY, RESPONSES_OUTPUT_KEY, RESPONSES_ORBITS_KEY } = require('../datas/constants');

module.exports = (path) => {
  return new Promise(resolve => {
    const initialResponses = [];
    const inputs = [];
    const outputs = [];
    const orbits = [];

    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (data) => { initialResponses.push(data); })
      .on('end', () => {
        initialResponses.forEach((response) => {
          inputs.push(response[RESPONSES_INPUT_KEY]);
          outputs.push(response[RESPONSES_OUTPUT_KEY]);
          orbits.push(response[RESPONSES_ORBITS_KEY]);
        });

        //console.log(`Successfully parsed the response dataset from ${path} ✅`);

        resolve({ inputs, outputs, orbits });
      })
    });
};
