# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Supabase setup

1. Create a Supabase project and enable the **Email + Password** auth provider.
2. Create the following tables (or import your existing schema):
   - `products`: columns for `id`, `name`, `description`, `price`, `category`, `sizes` (text[]), `colors` (text[]), `stock`, `image_url`, `vendorId`, and timestamps.
   - `categories`: `id`, `name`, `image_url`.
   - `testimonials`: `id`, `name`, `avatar_url`, `rating`, `text`.
   - `orders`: `id`, `userId`, `productId`, `vendorId`, `salespersonId`, `quantity`, `total`, `status`, `orderDate`, `created_at`.
   - `users`: `id`, `name`, `email`, `role`, `avatarId`, `avatar_url`, `createdAt`.
3. Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Restart the dev server after adding the environment variables so the Supabase client picks them up.
