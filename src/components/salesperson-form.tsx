
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

export type SalespersonFormData = z.infer<typeof formSchema>;

interface SalespersonFormProps {
  onSubmit: (data: SalespersonFormData) => void;
  defaultValues: SalespersonFormData | null;
}

export const SalespersonForm = React.forwardRef<
  HTMLFormElement,
  SalespersonFormProps
>(({ onSubmit, defaultValues }, ref) => {
  const form = useForm<SalespersonFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
    },
  });
  
  React.useEffect(() => {
    form.reset({
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
    });
  }, [defaultValues, form]);


  return (
    <Form {...form}>
      <form
        ref={ref}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., jane.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
});

SalespersonForm.displayName = 'SalespersonForm';

