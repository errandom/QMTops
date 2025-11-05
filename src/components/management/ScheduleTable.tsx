import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { useSchedule, useTeams, useFields, useSites } from '@/hooks/use-data';
import { ScheduleEvent } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { getTeamById, getFieldById, getSiteById } from '@/lib/data-helpers';
import { format } from 'date-fns';

export function ScheduleTable() {
  const [schedule, setSchedule] = useSchedule();
  const [teams] = useTeams();
  const [fields] = useFields();
  const [sites] = useSites();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [formData, setFormData] = useState({
    fieldId: '',
    teamId: '',
    startTime: '',
    endTime: '',
    eventType: 'practice' as 'practice' | 'game' | 'tournament',
    opponent: '',
    notes: ''
  });

  const handleOpenDialog = (event?: ScheduleEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        fieldId: event.fieldId,
        teamId: event.teamId,
        startTime: event.startTime.slice(0, 16),
        endTime: event.endTime.slice(0, 16),
        eventType: event.eventType,
        opponent: event.opponent || '',
        notes: event.notes || ''
      });
    } else {
      setEditingEvent(null);
      setFormData({
        fieldId: '',
        teamId: '',
        startTime: '',
        endTime: '',
        eventType: 'practice',
        opponent: '',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent) {
      setSchedule((current) =>
        (current || []).map(ev =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString()
              }
            : ev
        )
      );
      toast.success('Event updated successfully');
    } else {
      const newEvent: ScheduleEvent = {
        id: `event-${Date.now()}`,
        fieldId: formData.fieldId,
        teamId: formData.teamId,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        eventType: formData.eventType,
        opponent: formData.opponent || undefined,
        notes: formData.notes || undefined
      };
      setSchedule((current) => [...(current || []), newEvent]);
      toast.success('Event created successfully');
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setSchedule((current) => (current || []).filter(ev => ev.id !== id));
      toast.success('Event deleted successfully');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Manage scheduled events</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={18} />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule && schedule.length > 0 ? (
                schedule
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                  .map(event => {
                    const team = getTeamById(teams || [], event.teamId);
                    const field = getFieldById(fields || [], event.fieldId);
                    const site = field ? getSiteById(sites || [], field.siteId) : undefined;
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="font-medium">{format(new Date(event.startTime), 'MMM d, yyyy')}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>{team?.name || 'Unknown'}</TableCell>
                        <TableCell>{field?.name || 'Unknown'}</TableCell>
                        <TableCell>{site?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant={event.eventType === 'game' ? 'default' : 'secondary'}>
                            {event.eventType}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.opponent || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(event)}
                              className="gap-1"
                            >
                              <PencilSimple size={16} />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(event.id)}
                              className="gap-1"
                            >
                              <Trash size={16} />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No events found. Click "Add Event" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogDescription>
              {editingEvent ? 'Update event information' : 'Create a new scheduled event'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamId">Team *</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))} required>
                  <SelectTrigger id="teamId">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldId">Field *</Label>
                <Select value={formData.fieldId} onValueChange={(value) => setFormData(prev => ({ ...prev, fieldId: value }))} required>
                  <SelectTrigger id="fieldId">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields?.map(field => {
                      const site = getSiteById(sites || [], field.siteId);
                      return (
                        <SelectItem key={field.id} value={field.id}>
                          {site?.name} - {field.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select value={formData.eventType} onValueChange={(value: 'practice' | 'game' | 'tournament') => setFormData(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger id="eventType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  value={formData.opponent}
                  onChange={(e) => setFormData(prev => ({ ...prev, opponent: e.target.value }))}
                  placeholder="For games only"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional information..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEvent ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
