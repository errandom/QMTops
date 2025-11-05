import { useState, useMemo } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarBlank, MapPin, Users, Flag } from '@phosphor-icons/react';
import { useTeams, useFields, useSites, useSchedule } from '@/hooks/use-data';
import { getUpcomingEvents, getEventsBySportType, getEventsByTeam, getTeamById, getFieldById, getSiteById } from '@/lib/data-helpers';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface DashboardProps {
  onRequestFacility: () => void;
  onRequestEquipment: () => void;
  onManagement: () => void;
}

export function Dashboard({ onRequestFacility, onRequestEquipment, onManagement }: DashboardProps) {
  const [teams] = useTeams();
  const [fields] = useFields();
  const [sites] = useSites();
  const [schedule] = useSchedule();
  
  const [sportFilter, setSportFilter] = useState<'all' | 'tackle' | 'flag'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  const upcomingEvents = useMemo(() => {
    let events = getUpcomingEvents(schedule || []);
    events = getEventsBySportType(events, fields || [], teams || [], sportFilter);
    if (teamFilter !== 'all') {
      events = getEventsByTeam(events, teamFilter);
    }
    return events;
  }, [schedule, fields, teams, sportFilter, teamFilter]);

  const tackleTeams = useMemo(() => teams?.filter(t => t.sportType === 'tackle') || [], [teams]);
  const flagTeams = useMemo(() => teams?.filter(t => t.sportType === 'flag') || [], [teams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">QMT Facility Management</h1>
          <p className="text-muted-foreground text-lg mb-8">Upcoming Events & Facility Information</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div>
              <label className="text-sm font-medium mb-2 block">Sport Type</label>
              <ToggleGroup type="single" value={sportFilter} onValueChange={(value) => value && setSportFilter(value as 'all' | 'tackle' | 'flag')}>
                <ToggleGroupItem value="all" aria-label="All sports" className="gap-2">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="tackle" aria-label="Tackle football" className="gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C10.07 2 8.5 3.57 8.5 5.5V7H7c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h1.5v1.5c0 1.93 1.57 3.5 3.5 3.5h1c1.93 0 3.5-1.57 3.5-3.5V14H18c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-1.5V5.5C16.5 3.57 14.93 2 13 2h-1zm-2 8v4h4v-4h-4z"/>
                  </svg>
                  Tackle
                </ToggleGroupItem>
                <ToggleGroupItem value="flag" aria-label="Flag football" className="gap-2">
                  <Flag size={20} weight="fill" />
                  Flag
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Team</label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {tackleTeams.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Tackle</div>
                      {tackleTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </>
                  )}
                  {flagTeams.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Flag</div>
                      {flagTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onRequestFacility} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Request Facility
            </Button>
            <Button onClick={onRequestEquipment} className="bg-accent text-accent-foreground hover:bg-accent/90">
              Request Equipment
            </Button>
            <Button onClick={onManagement} variant="outline">
              Management Section
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarBlank size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No upcoming events scheduled</p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event, index) => {
              const team = getTeamById(teams || [], event.teamId);
              const field = getFieldById(fields || [], event.fieldId);
              const site = field ? getSiteById(sites || [], field.siteId) : undefined;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-l-4" style={{
                    borderLeftColor: team?.sportType === 'tackle' ? 'oklch(0.68 0.18 45)' : 'oklch(0.75 0.15 75)'
                  }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={event.eventType === 'game' ? 'default' : 'secondary'}>
                              {event.eventType}
                            </Badge>
                            {team?.sportType === 'tackle' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
                                <path d="M12 2C10.07 2 8.5 3.57 8.5 5.5V7H7c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h1.5v1.5c0 1.93 1.57 3.5 3.5 3.5h1c1.93 0 3.5-1.57 3.5-3.5V14H18c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-1.5V5.5C16.5 3.57 14.93 2 13 2h-1zm-2 8v4h4v-4h-4z"/>
                              </svg>
                            ) : (
                              <Flag size={16} weight="fill" className="text-accent" />
                            )}
                          </div>
                          <CardTitle className="text-xl">{team?.name || 'Unknown Team'}</CardTitle>
                          {event.opponent && (
                            <CardDescription className="mt-1">vs {event.opponent}</CardDescription>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{format(new Date(event.startTime), 'MMM d, yyyy')}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-muted-foreground" />
                          <span>{site?.name || 'Unknown Site'} - {field?.name || 'Unknown Field'}</span>
                        </div>
                        {site && (
                          <div className="text-muted-foreground">
                            {site.city}, {site.state}
                          </div>
                        )}
                      </div>
                      {event.notes && (
                        <p className="mt-3 text-sm text-muted-foreground">{event.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
