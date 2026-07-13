"use client";

import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import type { CalendarPageData } from "@/lib/calendar/types";

import { CalendarFilters } from "./calendar-filters";
import { CalendarGrid } from "./calendar-grid";
import { CalendarToolbar } from "./calendar-toolbar";
import { DayAgenda } from "./day-agenda";
import { EventDetailCard } from "./event-detail-card";
import { EventFormDialog } from "./event-form-dialog";
import { UpcomingEventList } from "./upcoming-event-list";
import { useCalendarManager } from "./hooks/use-calendar-manager";

export function CalendarManager({ data }: { data: CalendarPageData }) {
 const manager = useCalendarManager(data);

 return (
 <div className="space-y-6">
 {data.error ? (
 <Alert variant="destructive" className="rounded-[18px] border-danger/20 bg-danger/5">
 <AlertDescription className="font-semibold text-danger">
 {data.error}
 </AlertDescription>
 </Alert>
 ) : null}

 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <CalendarToolbar
 canCreate={manager.canCreate}
 data={data}
 monthLabel={manager.monthLabel}
 onCreate={() => manager.startCreating()}
 onTodayClick={manager.selectToday}
 selectedIsToday={manager.selectedIsToday}
 todayMonthKey={manager.todayMonthKey}
 />
 <CalendarFilters data={data} onFilterChange={manager.pushFilters} />
 <CalendarGrid
 activeSelectedDate={manager.activeSelectedDate}
 canCreate={manager.canCreate}
 days={manager.days}
 eventCount={data.events.length}
 eventsByDate={manager.eventsByDate}
 onCreate={() => manager.startCreating()}
 onSelectDate={manager.selectDate}
 onSelectEvent={manager.selectEvent}
 timeFormat={manager.timeFormat}
 />
 </section>

 <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
 <DayAgenda
 activeSelectedDate={manager.activeSelectedDate}
 canCreate={manager.canCreate}
 canEditEvent={manager.canEditEvent}
 events={manager.selectedDayEvents}
 onCreate={() => manager.startCreating(manager.activeSelectedDate)}
 onEdit={manager.startEditing}
 onOpen={manager.openEvent}
 selectedIsToday={manager.selectedIsToday}
 timeFormat={manager.timeFormat}
 />

 <div className="space-y-6">
 <EventDetailCard
 canEditEvent={manager.canEditEvent}
 event={manager.selectedEvent}
 onEdit={manager.startEditing}
 onStatusChange={manager.updateEventStatus}
 timeFormat={manager.timeFormat}
 />
 <UpcomingEventList
 events={data.upcomingEvents}
 onOpen={manager.openUpcomingEvent}
 timeFormat={manager.timeFormat}
 />
 </div>
 </div>

 <EventFormDialog
 areaOptions={manager.areaOptions}
 data={data}
 editingEvent={manager.editingEvent}
 form={manager.form}
 onDelete={manager.setDeleteTarget}
 onOpenChange={manager.handleFormOpenChange}
 onSubmit={manager.onSubmit}
 open={manager.formOpen}
 professionalOptions={manager.professionalOptions}
 serverMessage={manager.serverMessage}
 />

 <ConfirmationDialog
 open={Boolean(manager.deleteTarget)}
 title="Eliminar evento"
 description="Esta accion eliminara el evento del calendario y no se puede deshacer."
 confirmLabel="Eliminar"
 cancelLabel="Cancelar"
 tone="destructive"
 onOpenChange={(open) => {
 if (!open) {
 manager.setDeleteTarget(null);
 }
 }}
 onConfirm={manager.confirmDelete}
 />
 </div>
 );
}
