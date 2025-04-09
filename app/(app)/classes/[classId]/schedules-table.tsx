"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { schedules } from "@/db/schema";
import { useSchedules } from "@/features/schedules/context/schedules-context";
import { InferSelectModel } from "drizzle-orm";

const timeSlots = [
  { start: "07:00", end: "07:45" },
  { start: "07:45", end: "08:30" },
  { start: "08:30", end: "09:00" },
  { start: "09:00", end: "09:45" },
  { start: "09:45", end: "10:30" },
  { start: "10:30", end: "11:15" },
  { start: "11:15", end: "13:30" },
  { start: "13:30", end: "14:15" },
  { start: "14:15", end: "15:00" },
  { start: "15:00", end: "15:30" },
  { start: "15:30", end: "16:15" },
  { start: "16:15", end: "17:00" },
  { start: "17:00", end: "17:45" },
];

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const subjectColors: { [key: string]: string } = {
  Mathematics:
    "bg-blue-400/10 dark:bg-blue-600/10 text-blue-900 dark:text-blue-100",
  Literature:
    "bg-purple-400/10 dark:bg-purple-600/10 text-purple-900 dark:text-purple-100",
  English:
    "bg-pink-400/10 dark:bg-pink-600/10 text-pink-900 dark:text-pink-100",
  Physics:
    "bg-green-400/10 dark:bg-green-600/10 text-green-900 dark:text-green-100",
  Chemistry:
    "bg-yellow-400/10 dark:bg-yellow-600/10 text-yellow-900 dark:text-yellow-100",
  Biology:
    "bg-teal-400/10 dark:bg-teal-600/10 text-teal-900 dark:text-teal-100",
  History: "bg-red-400/10 dark:bg-red-600/10 text-red-900 dark:text-red-100",
  Geography:
    "bg-orange-400/10 dark:bg-orange-600/10 text-orange-900 dark:text-orange-100",
  "Civic Education":
    "bg-indigo-400/10 dark:bg-indigo-600/10 text-indigo-900 dark:text-indigo-100",
  Informatics:
    "bg-cyan-400/10 dark:bg-cyan-600/10 text-cyan-900 dark:text-cyan-100",
  Technology:
    "bg-gray-400/10 dark:bg-gray-600/10 text-gray-900 dark:text-gray-100",
  "Physical Education":
    "bg-lime-400/10 dark:bg-lime-600/10 text-lime-900 dark:text-lime-100",
  Music: "bg-rose-400/10 dark:bg-rose-600/10 text-rose-900 dark:text-rose-100",
  "Fine Arts":
    "bg-amber-400/10 dark:bg-amber-600/10 text-amber-900 dark:text-amber-100",
  Default: "bg-gray-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
};

export const SchedulesTable = ({
  data,
}: {
  data: (InferSelectModel<typeof schedules> & {
    subject: string;
    teacher: string;
    room: string;
  })[];
}) => {
  // Helper function to compare times
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Check if an event overlaps with a slot
  const getEventForSlot = (
    slot: { start: string; end: string },
    day: string
  ) => {
    return data.filter((event) => {
      const eventStart = timeToMinutes(event.startTime);
      const eventEnd = timeToMinutes(event.endTime);
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);
      const eventDay = event.dayOfWeek.toLowerCase();

      // Check if the event overlaps with the slot on the same day
      return (
        eventDay === day.toLowerCase() &&
        eventStart < slotEnd && // Event starts before slot ends
        eventEnd > slotStart // Event ends after slot starts
      );
    });
  };

  const getSubjectColor = (title: string) => {
    return subjectColors[title] || subjectColors.Default;
  };

  const { setOpen, setCurrentRow } = useSchedules();

  return (
    <div className="schedule-table overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          <TableRow>
            <TableHead>Time</TableHead>
            {daysOfWeek.map((day, index) => (
              <TableHead key={index} className="text-center">
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((slot, slotIndex) => (
            <TableRow key={slotIndex}>
              <TableCell className="font-medium">{`${slot.start}`}</TableCell>
              {daysOfWeek.map((day, dayIndex) => {
                const events = getEventForSlot(slot, day);

                return (
                  <TableCell key={dayIndex} className="align-top text-center">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`relative p-2 rounded-md border mb-2 ${getSubjectColor(
                          event.subject
                        )}`}
                        onClick={() => {
                          setCurrentRow(event);
                          setOpen("update");
                        }}
                      >
                        <div className="text-xs text-muted-foreground">
                          {event.startTime} - {event.endTime}
                        </div>
                        <div>{event.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.teacher}
                        </div>
                      </div>
                    ))}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
