"""
Seed the database with sample data for development/testing.
Run: python -m scripts.seed
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.utils.security import hash_password
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.models.resource import Resource, ResourceTag
from app.models.note import Note
from datetime import datetime


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(User).filter(User.email == "demo@studywallet.app").first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        user = User(
            email="demo@studywallet.app",
            username="demo",
            hashed_password=hash_password("DemoPass123!"),
            full_name="Demo User",
            is_verified=True,
        )
        db.add(user)
        db.flush()

        subjects_data = [
            {"name": "Physics", "description": "Physics study materials", "color": "#6366f1", "icon": "book"},
            {"name": "Mathematics", "description": "Mathematics resources", "color": "#ef4444", "icon": "book"},
            {"name": "Computer Science", "description": "CS study materials", "color": "#10b981", "icon": "book"},
        ]

        chapters_data = {
            "Physics": [
                {"name": "Quantum Mechanics", "description": "Quantum physics fundamentals", "order": 1},
                {"name": "Thermodynamics", "description": "Heat and thermodynamics", "order": 2},
                {"name": "Optics", "description": "Light and optics", "order": 3},
            ],
            "Mathematics": [
                {"name": "Calculus", "description": "Differential and integral calculus", "order": 1},
                {"name": "Linear Algebra", "description": "Vectors and matrices", "order": 2},
            ],
            "Computer Science": [
                {"name": "Data Structures", "description": "Arrays, trees, graphs", "order": 1},
                {"name": "Algorithms", "description": "Sorting, searching, DP", "order": 2},
            ],
        }

        resources_data = {
            "Quantum Mechanics": [
                {"title": "Introduction to QM", "resource_type": "pdf", "status": "completed", "url": None, "tags": ["quantum", "basics"]},
                {"title": "Quantum Computing Explained", "resource_type": "youtube_link", "status": "studying", "url": "https://youtube.com/watch?v=example", "tags": ["quantum", "computing"]},
            ],
            "Thermodynamics": [
                {"title": "Thermo Notes", "resource_type": "note", "status": "not_started", "url": None, "tags": ["thermo"]},
            ],
            "Calculus": [
                {"title": "Khan Academy Calculus", "resource_type": "chatgpt_link", "status": "revision_pending", "url": "https://chat.openai.com/share/example", "tags": ["calculus"]},
            ],
        }

        for subj_data in subjects_data:
            subject = Subject(**subj_data, user_id=user.id)
            db.add(subject)
            db.flush()

            for ch_data in chapters_data.get(subj_data["name"], []):
                chapter = Chapter(**ch_data, subject_id=subject.id)
                db.add(chapter)
                db.flush()

                for res_data in resources_data.get(ch_data["name"], []):
                    tags = res_data.pop("tags", [])
                    resource = Resource(
                        **res_data,
                        user_id=user.id,
                        subject_id=subject.id,
                        chapter_id=chapter.id,
                        importance="normal",
                    )
                    db.add(resource)
                    db.flush()

                    for tag_name in tags:
                        db.add(ResourceTag(resource_id=resource.id, tag=tag_name))

        note = Note(
            title="Study Notes - Quantum Mechanics",
            content="# Quantum Mechanics Notes\n\n## Key Concepts\n\n- Wave-particle duality\n- Superposition\n- Quantum entanglement\n\n## Formulas\n\n$$E = h\\nu$$\n$$\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}$$",
            is_markdown=True,
            user_id=user.id,
        )
        db.add(note)

        db.commit()
        print("Database seeded successfully!")
        print("  Email: demo@studywallet.app")
        print("  Password: DemoPass123!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
