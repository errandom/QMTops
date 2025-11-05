import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { useTeams } from '@/hooks/use-data';
import { Team, SportType } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function TeamsTable() {
  const [teams, setTeams] = useTeams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sportType: 'tackle' as SportType,
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        sportType: team.sportType,
        contactName: team.contactName || '',
        contactEmail: team.contactEmail || '',
        contactPhone: team.contactPhone || ''
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        sportType: 'tackle',
        contactName: '',
        contactEmail: '',
        contactPhone: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTeam) {
      setTeams((current) =>
        (current || []).map(t =>
          t.id === editingTeam.id
            ? { ...t, ...formData }
            : t
        )
      );
      toast.success('Team updated successfully');
    } else {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        ...formData
      };
      setTeams((current) => [...(current || []), newTeam]);
      toast.success('Team created successfully');
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      setTeams((current) => (current || []).filter(t => t.id !== id));
      toast.success('Team deleted successfully');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Teams</CardTitle>
              <CardDescription>Manage football teams</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={18} />
              Add Team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sport Type</TableHead>
                <TableHead>Contact Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Contact Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams && teams.length > 0 ? (
                teams.map(team => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <Badge variant={team.sportType === 'tackle' ? 'default' : 'secondary'}>
                        {team.sportType}
                      </Badge>
                    </TableCell>
                    <TableCell>{team.contactName || '-'}</TableCell>
                    <TableCell>{team.contactEmail || '-'}</TableCell>
                    <TableCell>{team.contactPhone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(team)}
                          className="gap-1"
                        >
                          <PencilSimple size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(team.id)}
                          className="gap-1"
                        >
                          <Trash size={16} />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No teams found. Click "Add Team" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Edit Team' : 'Add New Team'}</DialogTitle>
            <DialogDescription>
              {editingTeam ? 'Update team information' : 'Create a new team'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sportType">Sport Type *</Label>
              <Select value={formData.sportType} onValueChange={(value: SportType) => setFormData(prev => ({ ...prev, sportType: value }))}>
                <SelectTrigger id="sportType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tackle">Tackle</SelectItem>
                  <SelectItem value="flag">Flag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTeam ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
