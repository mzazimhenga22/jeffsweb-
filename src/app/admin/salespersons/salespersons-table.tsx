'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, PlusCircle } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@/lib/types'
import { AddEditSalespersonDialog } from '@/components/add-edit-salesperson-dialog'
import { DeleteSalespersonDialog } from '@/components/delete-salesperson-dialog'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { supabase } from '@/lib/supabase-client'

const ITEMS_PER_PAGE = 10

type FormData = {
  name: string
  email: string
}

type SalespersonRow = Pick<User, 'id' | 'email' | 'role' | 'createdAt' | 'avatar_url'> & {
  name: string
  avatarId?: string | null
}

export function SalespersonsTable({ salespersons: initialSalespersons }: { salespersons: SalespersonRow[] }) {
  const [users, setUsers] = React.useState(initialSalespersons)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isAddEditDialogOpen, setAddEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedSalesperson, setSelectedSalesperson] = React.useState<User | null>(null)
  const [pendingActionId, setPendingActionId] = React.useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const filteredSalespersons = React.useMemo(() => {
    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    )
  }, [users, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredSalespersons.length / ITEMS_PER_PAGE))
  const paginatedSalespersons = filteredSalespersons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleAdd = () => {
    setSelectedSalesperson(null)
    setAddEditDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedSalesperson(user)
    setAddEditDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedSalesperson(user)
    setDeleteDialogOpen(true)
  }

  const handleSaveSalesperson = async (data: FormData) => {
    try {
      if (selectedSalesperson) {
        setPendingActionId(selectedSalesperson.id)
        const { error } = await supabase
          .from('users')
          .update({ full_name: data.name, email: data.email })
          .eq('id', selectedSalesperson.id)
        if (error) throw error
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedSalesperson.id ? { ...user, name: data.name, email: data.email } : user,
          ),
        )
        toast({ title: 'Salesperson Updated', description: `${data.name}'s information has been updated.` })
      } else {
        const newUser: SalespersonRow = {
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          role: 'salesperson',
          avatarId: null,
          avatar_url: null,
          createdAt: new Date().toISOString(),
        }
        const { error } = await supabase
          .from('users')
          .insert({
            id: newUser.id,
            full_name: data.name,
            email: data.email,
            role: 'salesperson',
            avatar_url: null,
            created_at: newUser.createdAt,
          })
        if (error) throw error
        setUsers((prev) => [
          {
            ...newUser,
            avatarId: null,
          },
          ...prev,
        ])
        toast({ title: 'Salesperson Added', description: `${data.name} has been added to the platform.` })
      }
    } catch (error) {
      console.error('Failed to save salesperson', error)
      toast({
        variant: 'destructive',
        title: 'Unable to save salesperson',
        description: 'Please try again.',
      })
    } finally {
      setPendingActionId(null)
      setAddEditDialogOpen(false)
      setSelectedSalesperson(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedSalesperson) return
    try {
      setPendingActionId(selectedSalesperson.id)
      const { error } = await supabase.from('users').delete().eq('id', selectedSalesperson.id)
      if (error) throw error
      setUsers((prev) => prev.filter((user) => user.id !== selectedSalesperson.id))
      toast({
        variant: 'destructive',
        title: 'Salesperson Deleted',
        description: `${selectedSalesperson.name} has been removed.`,
      })
    } catch (error) {
      console.error('Failed to delete salesperson', error)
      toast({
        variant: 'destructive',
        title: 'Unable to delete salesperson',
        description: 'Please try again later.',
      })
    } finally {
      setPendingActionId(null)
      setDeleteDialogOpen(false)
      setSelectedSalesperson(null)
    }
  }

  return (
    <>
      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Salespersons</CardTitle>
              <CardDescription>Manage all salespersons on the platform.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search salespersons..."
                className="w-full sm:w-64"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setCurrentPage(1)
                }}
              />
              <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Salesperson
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salesperson</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSalespersons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    {users.length === 0
                      ? 'No salespersons yet. Add your first teammate to start assigning accounts.'
                      : 'No salespersons match your search.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSalespersons.map((user) => {
                const avatar = PlaceHolderImages.find((p) => p.id === user.avatarId)
                return (
                  <TableRow key={user.id} className="cursor-pointer" onClick={() => router.push(`/admin/salespersons/${user.id}`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {user.avatar_url ? (
                            <AvatarImage src={user.avatar_url} />
                          ) : (
                            avatar && <AvatarImage src={avatar.imageUrl} data-ai-hint={avatar.imageHint} />
                          )}
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                      <TableCell>{user.email}</TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(event) => {
                              event.stopPropagation()
                            }}
                          >
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/salespersons/${user.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(event) => {
                                event.stopPropagation()
                                handleEdit(user)
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDelete(user)
                              }}
                              disabled={pendingActionId === user.id}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedSalespersons.length} of {filteredSalespersons.length} salespersons
            </p>
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddEditSalespersonDialog
        isOpen={isAddEditDialogOpen}
        setIsOpen={setAddEditDialogOpen}
        onSave={handleSaveSalesperson}
        salesperson={selectedSalesperson}
      />

      <DeleteSalespersonDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        salespersonName={selectedSalesperson?.name || ''}
      />
    </>
  )
}
