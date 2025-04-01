"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const timeSlots = [
  { start: "07:00", end: "07:45" },
  { start: "07:45", end: "08:30" },
  { start: "08:30", end: "09:00" },
  { start: "09:00", end: "09:45" },
  { start: "09:45", end: "10:30" },
  { start: "10:30", end: "11:15" },
  { start: "13:30", end: "14:15" },
  { start: "14:15", end: "15:00" },
  { start: "15:00", end: "15:30" },
  { start: "15:30", end: "16:15" },
  { start: "16:15", end: "17:00" },
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

export const CustomSchedule = ({
  data,
}: {
  data: {
    title: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    sub?: string;
  }[];
}) => {
  const getEventForSlot = (
    slot: { start: string; end: string },
    day: string
  ) => {
    return data.filter((event) => {
      const eventStartTime = event.startTime;
      const eventEndTime = event.endTime;
      const eventDay = event.dayOfWeek.toLowerCase();

      return (
        eventDay === day.toLowerCase() &&
        eventStartTime >= slot.start &&
        eventEndTime <= slot.end
      );
    });
  };

  // Hàm lấy màu sắc dựa trên tiêu đề môn học
  const getSubjectColor = (title: string) => {
    return subjectColors[title] || subjectColors.Default;
  };

  return (
    <div className="overflow-hidden rounded-lg border">
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
                        key={event.title}
                        className={`p-2 rounded-md border mb-2 ${getSubjectColor(
                          event.title
                        )}`}
                      >
                        <div className="text-xs text-muted-foreground">
                          {event.startTime} - {event.endTime}
                        </div>
                        <div>{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.sub}
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
