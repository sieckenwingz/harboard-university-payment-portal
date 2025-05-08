import os
import sys
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
import csv

load_dotenv()

supabase_url: str = os.getenv('VITE_SUPABASE_URL')
service_role_key: str = os.getenv('SERVICE_ROLE_KEY')

supabase = create_client(
    supabase_url,
    service_role_key,
    options=ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
    )
)

# Read CSV
sr_codes = []
with open('data/3202/cpe_3202.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    sr_codes = [row['sr_code'] for row in reader]

ans = input(f'Found {len(sr_codes)} sr codes. (y/n): ')
if ans != 'y':
    sys.exit()

# Get student ids
students = (
    supabase.table("students")
        .select('id')
        .in_('sr_code', sr_codes)
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
    .order("year", desc=False)   # ascending order
    .order("semester", desc=False)
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
