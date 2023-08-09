const moment = require('moment');

let startDate = moment().set({
    hour: parseInt(7),
    minute: parseInt(0),
    second: parseInt(0),
});

let endDate = moment().set({
    hour: parseInt(8),
    minute: parseInt(0),
    second: parseInt(0),
});

let currentDate = moment().set({
    hour: parseInt(8),
    minute: parseInt(0),
    second: parseInt(0),
});

console.log(currentDate)
if(currentDate >= startDate && currentDate <= endDate){
    console.log('true')
}else{
    console.log('false')
}