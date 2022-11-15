const {mercuryList} = require("./mercuryList");
const {earthList} = require("./earthList");
const {venusList} = require("./venusList");
const {marsList} = require("./marsList");
const {jupiterList} = require("./jupiterList");
const {saturnList} = require("./saturnList");
const {uranusList} = require("./uranusList");
const {neptuneList} = require("./neptuneList");
const mapList = {
    'mercury': mercuryList,
    'venus': venusList,
    'earth': earthList,
    'mars': marsList,
    'jupiter': jupiterList,
    'saturn': saturnList,
    'uranus': uranusList,
    'neptune': neptuneList
}

module.exports = {mapList}