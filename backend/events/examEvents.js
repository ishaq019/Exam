const EventEmitter = require("events");
const examEvents = new EventEmitter();

examEvents.on("examSubmitted", ({ examId, studentId, score }) => {
  console.log(`Exam submitted | exam=${examId} student=${studentId} score=${score}`);
});

module.exports = examEvents;
