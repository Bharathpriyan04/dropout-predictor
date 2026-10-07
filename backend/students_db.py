"""
students_db.py
==============
In-memory persistence layer for student 360 profiles, institutional records,
and retention intervention tracking.
"""

import datetime
from typing import List, Dict, Optional

# Realistic seed students
INITIAL_STUDENTS = [
    {
        "id": "STU-8041",
        "name": "Marcus Vance",
        "email": "m.vance@university.edu",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "department": "Computer Science & Engineering",
        "course": 9500,
        "cohort_year": "2024",
        "current_semester": 3,
        "age": 22,
        "gender": 1,
        "attendance": 1,
        "scholarship": 0,
        "tuition_ok": 0,
        "debtor": 1,
        "displaced": 1,
        "admission_grade": 122.5,
        "prev_grade": 118.0,
        "sem1_enrolled": 6,
        "sem1_approved": 3,
        "sem1_grade": 9.4,
        "sem1_evals": 8,
        "sem2_enrolled": 6,
        "sem2_approved": 1,
        "sem2_grade": 7.2,
        "sem2_evals": 9,
        "unemployment": 12.4,
        "inflation": 2.1,
        "gdp": -0.8,
        "lms_login_frequency": "Low (2 sessions/week)",
        "assignment_completion": 48,
        "advisor_name": "Dr. Sarah Jenkins",
        "interventions": [
            {
                "id": "INT-101",
                "date": "2024-11-12",
                "category": "Academic Advising",
                "title": "Semester 2 Midterm Warning Issued",
                "notes": "Student missed 3 lab sessions and failed CS201 midterm exam.",
                "author": "Dr. Sarah Jenkins",
                "status": "In Progress"
            }
        ]
    },
    {
        "id": "STU-8042",
        "name": "Sophia Rodriguez",
        "email": "s.rodriguez@university.edu",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "department": "Biomedical & Health Sciences",
        "course": 9070,
        "cohort_year": "2024",
        "current_semester": 3,
        "age": 19,
        "gender": 0,
        "attendance": 1,
        "scholarship": 1,
        "tuition_ok": 1,
        "debtor": 0,
        "displaced": 0,
        "admission_grade": 164.0,
        "prev_grade": 158.0,
        "sem1_enrolled": 6,
        "sem1_approved": 6,
        "sem1_grade": 15.8,
        "sem1_evals": 6,
        "sem2_enrolled": 6,
        "sem2_approved": 6,
        "sem2_grade": 16.4,
        "sem2_evals": 6,
        "unemployment": 10.2,
        "inflation": 1.4,
        "gdp": 1.74,
        "lms_login_frequency": "Very High (14 sessions/week)",
        "assignment_completion": 98,
        "advisor_name": "Prof. Alan Chen",
        "interventions": [
            {
                "id": "INT-102",
                "date": "2024-10-05",
                "category": "Honors Program",
                "title": "Undergraduate Research Fellowship Nomination",
                "notes": "Approved for faculty lab research in cellular genetics.",
                "author": "Prof. Alan Chen",
                "status": "Completed"
            }
        ]
    },
    {
        "id": "STU-8043",
        "name": "Devon Miller",
        "email": "d.miller@university.edu",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "department": "Business Administration",
        "course": 9147,
        "cohort_year": "2023",
        "current_semester": 4,
        "age": 25,
        "gender": 1,
        "attendance": 0,
        "scholarship": 0,
        "tuition_ok": 1,
        "debtor": 0,
        "displaced": 1,
        "admission_grade": 128.0,
        "prev_grade": 125.0,
        "sem1_enrolled": 6,
        "sem1_approved": 4,
        "sem1_grade": 11.2,
        "sem1_evals": 7,
        "sem2_enrolled": 6,
        "sem2_approved": 3,
        "sem2_grade": 10.5,
        "sem2_evals": 8,
        "unemployment": 11.1,
        "inflation": 2.8,
        "gdp": 0.3,
        "lms_login_frequency": "Moderate (5 sessions/week)",
        "assignment_completion": 72,
        "advisor_name": "Dr. Emily Taylor",
        "interventions": [
            {
                "id": "INT-103",
                "date": "2024-09-18",
                "category": "Career Counseling",
                "title": "Evening Work-Study Schedule Alignment",
                "notes": "Student works evening shifts; adjusted discussion section to accommodate.",
                "author": "Dr. Emily Taylor",
                "status": "Completed"
            }
        ]
    },
    {
        "id": "STU-8044",
        "name": "Amara Okafor",
        "email": "a.okafor@university.edu",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "department": "Data Science & Artificial Intelligence",
        "course": 9500,
        "cohort_year": "2024",
        "current_semester": 2,
        "age": 20,
        "gender": 0,
        "attendance": 1,
        "scholarship": 1,
        "tuition_ok": 1,
        "debtor": 0,
        "displaced": 0,
        "admission_grade": 152.0,
        "prev_grade": 146.0,
        "sem1_enrolled": 6,
        "sem1_approved": 6,
        "sem1_grade": 14.8,
        "sem1_evals": 6,
        "sem2_enrolled": 6,
        "sem2_approved": 5,
        "sem2_grade": 14.1,
        "sem2_evals": 7,
        "unemployment": 9.4,
        "inflation": 1.1,
        "gdp": 2.0,
        "lms_login_frequency": "High (10 sessions/week)",
        "assignment_completion": 94,
        "advisor_name": "Dr. Sarah Jenkins",
        "interventions": []
    },
    {
        "id": "STU-8045",
        "name": "Lucas Santos",
        "email": "l.santos@university.edu",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "department": "Mechanical Engineering",
        "course": 9238,
        "cohort_year": "2023",
        "current_semester": 4,
        "age": 24,
        "gender": 1,
        "attendance": 1,
        "scholarship": 0,
        "tuition_ok": 0,
        "debtor": 1,
        "displaced": 0,
        "admission_grade": 115.0,
        "prev_grade": 110.0,
        "sem1_enrolled": 6,
        "sem1_approved": 2,
        "sem1_grade": 8.5,
        "sem1_evals": 8,
        "sem2_enrolled": 6,
        "sem2_approved": 0,
        "sem2_grade": 0.0,
        "sem2_evals": 6,
        "unemployment": 13.9,
        "inflation": 3.4,
        "gdp": -1.2,
        "lms_login_frequency": "Critically Low (0-1 sessions/week)",
        "assignment_completion": 25,
        "advisor_name": "Prof. Robert Sterling",
        "interventions": [
            {
                "id": "INT-104",
                "date": "2024-12-01",
                "category": "Financial Aid",
                "title": "Bursar Hold Warning",
                "notes": "Outstanding debt hold placed. Student at urgent risk of disenrollment.",
                "author": "Office of Registrar",
                "status": "Critical Action Required"
            }
        ]
    },
    {
        "id": "STU-8046",
        "name": "Elena Rostova",
        "email": "e.rostova@university.edu",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        "department": "Nursing & Clinical Care",
        "course": 9070,
        "cohort_year": "2024",
        "current_semester": 3,
        "age": 21,
        "gender": 0,
        "attendance": 1,
        "scholarship": 1,
        "tuition_ok": 1,
        "debtor": 0,
        "displaced": 1,
        "admission_grade": 145.0,
        "prev_grade": 142.0,
        "sem1_enrolled": 6,
        "sem1_approved": 5,
        "sem1_grade": 13.5,
        "sem1_evals": 6,
        "sem2_enrolled": 6,
        "sem2_approved": 6,
        "sem2_grade": 14.8,
        "sem2_evals": 6,
        "unemployment": 10.8,
        "inflation": 1.4,
        "gdp": 1.74,
        "lms_login_frequency": "High (9 sessions/week)",
        "assignment_completion": 92,
        "advisor_name": "Prof. Alan Chen",
        "interventions": []
    },
    {
        "id": "STU-8047",
        "name": "Tariq Al-Mansoor",
        "email": "t.almansoor@university.edu",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        "department": "Economics & Quantitative Finance",
        "course": 9147,
        "cohort_year": "2024",
        "current_semester": 2,
        "age": 23,
        "gender": 1,
        "attendance": 1,
        "scholarship": 0,
        "tuition_ok": 1,
        "debtor": 0,
        "displaced": 0,
        "admission_grade": 134.0,
        "prev_grade": 130.0,
        "sem1_enrolled": 6,
        "sem1_approved": 4,
        "sem1_grade": 11.8,
        "sem1_evals": 7,
        "sem2_enrolled": 6,
        "sem2_approved": 4,
        "sem2_grade": 12.1,
        "sem2_evals": 7,
        "unemployment": 11.5,
        "inflation": 1.6,
        "gdp": 0.9,
        "lms_login_frequency": "Moderate (6 sessions/week)",
        "assignment_completion": 78,
        "advisor_name": "Dr. Emily Taylor",
        "interventions": []
    },
    {
        "id": "STU-8048",
        "name": "Chloe Dubois",
        "email": "c.dubois@university.edu",
        "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        "department": "Psychology & Cognitive Science",
        "course": 9670,
        "cohort_year": "2023",
        "current_semester": 4,
        "age": 26,
        "gender": 0,
        "attendance": 1,
        "scholarship": 0,
        "tuition_ok": 1,
        "debtor": 0,
        "displaced": 1,
        "admission_grade": 138.0,
        "prev_grade": 135.0,
        "sem1_enrolled": 6,
        "sem1_approved": 5,
        "sem1_grade": 12.8,
        "sem1_evals": 6,
        "sem2_enrolled": 6,
        "sem2_approved": 3,
        "sem2_grade": 10.2,
        "sem2_evals": 8,
        "unemployment": 12.0,
        "inflation": 2.5,
        "gdp": 0.5,
        "lms_login_frequency": "Moderate (4 sessions/week)",
        "assignment_completion": 65,
        "advisor_name": "Dr. Sarah Jenkins",
        "interventions": [
            {
                "id": "INT-105",
                "date": "2024-10-22",
                "category": "Mental Wellbeing",
                "title": "Academic Counseling Referral",
                "notes": "Discussed stress management and balanced course schedule.",
                "author": "Dr. Sarah Jenkins",
                "status": "In Progress"
            }
        ]
    }
]

class StudentRegistry:
    def __init__(self):
        self.students = {s["id"]: s for s in INITIAL_STUDENTS}
        self.intervention_counter = 200

    def get_all(self, department: str = None, risk_tier: str = None, search: str = None) -> List[Dict]:
        results = list(self.students.values())
        if department and department != "ALL":
            results = [s for s in results if s.get("department") == department]
        if search:
            q = search.lower()
            results = [s for s in results if q in s["name"].lower() or q in s["id"].lower() or q in s["email"].lower()]
        return results

    def get_by_id(self, student_id: str) -> Optional[Dict]:
        return self.students.get(student_id)

    def add_student(self, data: dict) -> Dict:
        new_id = data.get("id", f"STU-{8050 + len(self.students)}")
        data["id"] = new_id
        if "interventions" not in data:
            data["interventions"] = []
        if "avatar" not in data:
            data["avatar"] = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
        self.students[new_id] = data
        return data

    def add_intervention(self, student_id: str, intervention: dict) -> Optional[Dict]:
        student = self.students.get(student_id)
        if not student:
            return None
        self.intervention_counter += 1
        int_obj = {
            "id": f"INT-{self.intervention_counter}",
            "date": datetime.date.today().isoformat(),
            "category": intervention.get("category", "General Advisory"),
            "title": intervention.get("title", "Intervention Logged"),
            "notes": intervention.get("notes", ""),
            "author": intervention.get("author", "Academic Advisor"),
            "status": intervention.get("status", "Active")
        }
        student["interventions"].append(int_obj)
        return int_obj

# Global registry singleton
student_registry = StudentRegistry()
