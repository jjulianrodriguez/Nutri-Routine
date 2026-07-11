"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { CalendarPageData } from "@/lib/calendar/types";

import { CalendarFilters } from "./calendar/calendar-filters";
import { CalendarGrid } from "./calendar/calendar-grid";
import { CalendarToolbar } from "./calendar/calendar-toolbar";
import { DayAgenda } from "./calendar/day-agenda";
import { EventDetailCard } from "./calendar/event-detail-card";
import { EventFormDialog } from "./calendar/event-form-dialog";
import { UpcomingEventList } from "./calendar/upcoming-event-list";
import { useCalendarManager } from "./calendar/hooks/use-calendar-manager";

type CalendarManagerProps = {
 data: CalendarPageData;
};

export function CalendarManager({ data }: CalendarManagerProps) {
 const calendar = useCalendarManager(data);

 return (
 <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)] xl:items-start">
 <section className="rounded-[28px] bg-surface p-4 sm:p-6">
 <CalendarToolbar
 canCreate={calendar.canCreate}
 data={data}
 monthLabel={calendar.monthLabel}
 onCreate={() => calendar.startCreating()}
 onTodayClick={calendar.selectToday}
 selectedIsToday={calendar.selectedIsToday}
 todayMonthKey={calendar.todayMonthKey}
 />

 {data.error ? (
 <Alert
 variant="destructive"
 className="mt-5 rounded-[22px] border-danger/20 bg-danger/5 px-5 py-4"
 >
 <AlertDescription className="font-semibold text-danger">
 {data.error}
 </AlertDescription>
 </Alert>
 ) : null}

 <CalendarFilters data={data} onFilterChange={calendar.pushFilters} />

 <CalendarGrid
 activeSelectedDate={calendar.activeSelectedDate}
 canCreate={calendar.canCreate}
 days={calendar.days}
 eventCount={data.events.length}
 eventsByDate={calendar.eventsByDate}
 onCreate={() => calendar.startCreating()}
 onSelectDate={calendar.selectDate}
 onSelectEvent={calendar.selectEvent}
 timeFormat={calendar.timeFormat}
 />
 </section>

 <aside className="space-y-6">
 <EventFormDialog
 areaOptions={calendar.areaOptions}
 data={data}
 editingEvent={calendar.editingEvent}
 form={calendar.form}
 onDelete={calendar.setDeleteTarget}
 onOpenChange={calendar.handleFormOpenChange}
 onSubmit={calendar.onSubmit}
 open={calendar.formOpen}
 professionalOptions={calendar.professionalOptions}
 serverMessage={calendar.serverMessage}
 />

 <DayAgenda
 activeSelectedDate={calendar.activeSelectedDate}
 canCreate={calendar.canCreate}
 canEditEvent={calendar.canEditEvent}
 events={calendar.selectedDayEvents}
 onCreate={() => calendar.startCreating(calendar.activeSelectedDate)}
 onEdit={calendar.startEditing}
 onOpen={calendar.openEvent}
 selectedIsToday={calendar.selectedIsToday}
 timeFormat={calendar.timeFormat}
 />

 <UpcomingEventList
 events={data.upcomingEvents}
 onOpen={calendar.openUpcomingEvent}
 timeFormat={calendar.timeFormat}
 />

 <EventDetailCard
 canEditEvent={calendar.canEditEvent}
 event={calendar.selectedEvent}
 onEdit={calendar.startEditing}
 onStatusChange={calendar.updateEventStatus}
 timeFormat={calendar.timeFormat}
 />
 </aside>

 <ConfirmationDialog
 open={Boolean(calendar.deleteTarget)}
 onOpenChange={(open) => {
 if (!open) {
 calendar.setDeleteTarget(null);
 }
 }}
 onConfirm={calendar.confirmDelete}
 title="Eliminar evento"
 description={`Se eliminara "${
 calendar.deleteTarget?.title ?? "este evento"
 }" del calendario. Esta acción no se puede deshacer.`}
 confirmLabel="Eliminar"
 pendingLabel="Eliminando..."
 tone="destructive"
 />
 </div>
 );
}
