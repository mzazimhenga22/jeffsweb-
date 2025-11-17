
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SalespersonForm } from './salesperson-form';
import type { SalespersonFormData } from './salesperson-form';
import type { User } from '@/lib/types';

interface AddEditSalespersonDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (data: SalespersonFormData) => void;
  salesperson: User | null;
}

export function AddEditSalespersonDialog({
  isOpen,
  setIsOpen,
  onSave,
  salesperson,
}: AddEditSalespersonDialogProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSave = () => {
    formRef.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{salesperson ? 'Edit' : 'Add'} Salesperson</DialogTitle>
          <DialogDescription>
            {salesperson
              ? `Update the details for ${salesperson.name}.`
              : 'Fill in the details to add a new salesperson.'}
          </DialogDescription>
        </DialogHeader>
        
        <SalespersonForm
          ref={formRef}
          onSubmit={onSave}
          defaultValues={salesperson}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

