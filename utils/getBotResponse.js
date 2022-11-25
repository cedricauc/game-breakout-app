const stringSimilarity = require('string-similarity');
const { RESPONSE_MATCH_THRESHOLD, DEFAULT_RESPONSE } = require('../datas/constants');

module.exports = (input, responses) => {
  if (!responses) { return DEFAULT_RESPONSE; }

  const matches = stringSimilarity.findBestMatch(input, responses.inputs);
  const { bestMatch, bestMatchIndex  } = matches;

  return bestMatch.rating < RESPONSE_MATCH_THRESHOLD
    ? {
      "outputs": DEFAULT_RESPONSE,
      "orbits": null
      }
    : {
      "outputs": responses.outputs[bestMatchIndex],
      "orbits": responses.orbits[bestMatchIndex]
    };
};
