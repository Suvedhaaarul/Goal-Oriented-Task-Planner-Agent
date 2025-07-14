const dayjs = require("dayjs");

function generateSlots(days = 2) {
  const slotsPerDay = [
    { start: "09:00", end: "10:00" },
    { start: "10:30", end: "11:30" },
    { start: "12:00", end: "13:00" },
    { start: "14:00", end: "15:00" },
  ];

  const freeSlots = [];

  for (let i = 0; i < days; i++) {
    const date = dayjs().add(i, "day").format("YYYY-MM-DD");

    slotsPerDay.forEach((slot) => {
      freeSlots.push({
        start: `${date}T${slot.start}`,
        end: `${date}T${slot.end}`,
      });
    });
  }

  return freeSlots;
}

const scheduledEvents = [];

function getFreeSlots(days = 2) {
  return generateSlots(days);
}

function scheduleTask(taskName, startTime, endTime) {
  scheduledEvents.push({ taskName, startTime, endTime });
  console.log(`✅ Scheduled '${taskName}' from ${startTime} to ${endTime}`);
}

module.exports = {
  getFreeSlots,
  scheduleTask,
  scheduledEvents,
};
