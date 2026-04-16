-- Create library_books table for family book collection
CREATE TABLE IF NOT EXISTS library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  fiction_nonfiction VARCHAR(20) CHECK (fiction_nonfiction IN ('Fiction', 'Non-Fiction')),
  age VARCHAR(50),
  url TEXT,
  drive_url TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS library_books_title_idx ON library_books(title);
CREATE INDEX IF NOT EXISTS library_books_author_idx ON library_books(author);
CREATE INDEX IF NOT EXISTS library_books_category_idx ON library_books(category);
CREATE INDEX IF NOT EXISTS library_books_fiction_nonfiction_idx ON library_books(fiction_nonfiction);
CREATE INDEX IF NOT EXISTS library_books_age_idx ON library_books(age);

-- Add note: this table stores the family's shared book collection
-- Individual users "check out" books from here by creating entries in the books table
