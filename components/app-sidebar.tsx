"use client";

import {
  IconCalendarClock,
  IconCalendarEvent,
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconNumber100Small,
  IconReorder,
  IconSettings,
  IconSpeakerphone,
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Exams",
      url: "/exams",
      icon: IconListDetails,
    },
    {
      title: "Assignments",
      url: "#",
      icon: IconReorder,
    },
    {
      title: "Results",
      url: "#",
      icon: IconNumber100Small,
    },
    {
      title: "Attendance",
      url: "#",
      icon: IconCalendarClock,
    },
    {
      title: "Events",
      url: "#",
      icon: IconCalendarEvent,
    },
    {
      title: "Announcements",
      url: "#",
      icon: IconSpeakerphone,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/helps",
      icon: IconHelp,
    },
  ],
  other: [
    {
      title: "Students",
      url: "/students",
    },
    {
      title: "Teachers",
      url: "/teachers",
    },
    {
      title: "Classes",
      url: "/classes",
    },
    {
      title: "Classrooms",
      url: "/classrooms",
    },
    {
      title: "Subjects",
      url: "/subjects",
    },
    {
      title: "School Years",
      url: "/school-years",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  School Management.
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarGroup>
          <SidebarGroupLabel>Other</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.other.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>{item.title}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
