import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Students</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,250
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="h-4 w-4 text-green-500" />
              +5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <span className="text-green-500">↑ 60 students</span>
            compared to last year
          </div>
          <div className="text-muted-foreground">
            Enrollment growth in 2024-2025
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Teachers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown className="h-4 w-4 text-red-500" />
              -2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <span className="text-red-500">↓ 25 teachers</span>
            compared to last year
          </div>
          <div className="text-muted-foreground">
            Staff reduction in 2024-2025
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Class Size</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            24
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown className="h-4 w-4 text-green-500" />
              -3
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 font-medium">
            <span className="text-green-500">↓ Smaller classes</span> compared
            to last year
          </div>
          <div className="text-muted-foreground">
            Improved student-teacher ratio
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Academic Performance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            89.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="h-4 w-4 text-green-500" />
              +2.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <span className="text-green-500">↑ Higher grades</span>
            across all departments
          </div>
          <div className="text-muted-foreground">
            Overall academic achievement
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
