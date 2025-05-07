import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv('VITE_SUPABASE_URL')
key: str = os.getenv('VITE_SUPABASE_ANON_KEY')

supabase: Client = create_client(url, key)

# Students
students = (
    supabase.table("students")
    .select("*")
    .execute()
)

student_ids = []

print(f'{len(students.data)} Student ids found...')
for student in students.data:
    id = student['id']
    student_ids.append(id)
    print(id)
print('[END] Student ids')

# Organizations
organizations = (
    supabase.table("organizations")
    .select("*")
    .execute()
)

print()
print('organizations: ')
for organization in organizations.data:
    print(f'[{organization['id']}]: {organization['name']}')

organization_id = input('Enter organization ID: ')

# Periods
periods = (
    supabase.table("periods")
    .select("*")
    .execute()
)

print()
print('Periods: ')
for period in periods.data:
    print(f'[{period['id']}]: {period['year']} | {period['semester']}')

period_id = input('Enter period ID: ')

data_to_insert = []
for student_id in student_ids:
    data_to_insert.append({
        'student_id': student_id,
        'organization_id': organization_id,
        'period_id': period_id,
    })

try:
    response = (
        supabase.table("student_periods")
        .insert(data_to_insert)
        .execute()
    )
    print(response)
except Exception as exception:
    print(exception)
