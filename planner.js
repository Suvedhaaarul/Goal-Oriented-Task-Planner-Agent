import { getFreeSlots, scheduleTask } from "./calendarAPI.js";
import dayjs from "dayjs";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function plannerAgent(tasks) {
  const scheduledResults = [];

  const sortedTasks = tasks.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  for (const task of sortedTasks) {
    let scheduled = false;
    const maxDays = 2;

    for (let day = 0; day < maxDays; day++) {
      const slots = getFreeSlots(1).map(slot => ({
        start: dayjs(slot.start).add(day, 'day'),
        end: dayjs(slot.end).add(day, 'day'),
      }));

      for (const slot of slots) {
        const { start, end } = slot;
        const taskDeadline = dayjs(task.deadline);
        const slotDuration = end.diff(start, "minute");

        if (start.isBefore(taskDeadline) && slotDuration >= task.duration) {
          const taskEndTime = start.add(task.duration, "minute").format();
          scheduleTask(task.taskName, start.format(), taskEndTime);

          const reason = await logReasoning(task, start.format(), taskEndTime);
          scheduledResults.push({
            task: task.taskName,
            scheduled: true,
            start: start.format(),
            end: taskEndTime,
            reason,
          });

          scheduled = true;
          break;
        }
      }

      if (scheduled) break;
    }

    if (!scheduled) {
      const reason = await logReasoning(task, null, null);
      scheduledResults.push({
        task: task.taskName,
        scheduled: false,
        reason,
      });
    }
  }

  return scheduledResults;
}

async function logReasoning(task, startTime, endTime) {
  const prompt = `
You are a helpful AI planner. The user gave you this task:

- Name: ${task.taskName}
- Duration: ${task.duration} minutes
- Deadline: ${task.deadline}
- Priority: ${task.priority}

${
    startTime
      ? `You scheduled it from ${startTime} to ${endTime}.`
      : `You couldn't find a slot to schedule it before the deadline.`
  }

Explain the reasoning behind this scheduling decision in 2–3 sentences.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  return response.choices[0].message.content.trim();
}
