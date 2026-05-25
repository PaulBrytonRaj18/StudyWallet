"""Run this to set up the Supabase database schema and storage RLS policy."""

import os
import re
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlalchemy import create_engine, text
from app.config import settings


def run():
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        isolation_level="AUTOCOMMIT",
    )

    with engine.connect() as conn:
        # Run schema
        sql_path = os.path.join(os.path.dirname(__file__), "..", "setup.sql")
        with open(sql_path) as f:
            sql = f.read()

        # Remove comment lines, then split by semicolons
        cleaned = re.sub(r"--.*", "", sql)
        for statement in cleaned.split(";"):
            stripped = statement.strip()
            if stripped:
                conn.execute(text(stripped + ";"))
        print("Database tables created.")

        # Ensure storage bucket exists
        conn.execute(text("""
            INSERT INTO storage.buckets (id, name, public)
            VALUES ('study-pdfs', 'study-pdfs', false)
            ON CONFLICT (id) DO NOTHING;
        """))
        print("Storage bucket ensured.")

        # Set RLS policy (drop existing first to avoid conflicts)
        conn.execute(text("""
            DROP POLICY IF EXISTS "Users access their own files" ON storage.objects;
        """))
        conn.execute(text("""
            CREATE POLICY "Users access their own files"
            ON storage.objects FOR ALL USING (
              auth.role() = 'service_role' OR
              (storage.foldername(name))[1] = auth.uid()::text
            );
        """))
        print("Storage RLS policy created.")
    print("All done!")


if __name__ == "__main__":
    run()
