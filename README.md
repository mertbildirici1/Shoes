# Shoe Size Finder App

A React Native app that helps users find their correct shoe size based on their shoe collection history.

## Features

- User authentication
- Add shoes to your collection with size and fit information
- Get size recommendations for new shoes based on your collection
- View your shoe collection history

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project and get your project URL and anon key

4. Update the Supabase configuration in `src/lib/supabase.ts`:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

5. Create the following table in your Supabase database:
   ```sql
   create table shoes (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users,
     brand text not null,
     model text not null,
     size text not null,
     fit text not null check (fit in ('too small', 'perfect', 'too large')),
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Add RLS policies
   create policy "Users can read their own shoes"
     on shoes for select
     using (auth.uid() = user_id);

   create policy "Users can insert their own shoes"
     on shoes for insert
     with check (auth.uid() = user_id);
   ```

6. Run the app:
   ```bash
   npm start
   ```

## Development

- Built with React Native and Expo
- Uses Supabase for backend and authentication
- TypeScript for type safety
- React Navigation for routing
- Context API for state management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 