import os
import sys
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv
import csv

load_dotenv()

supabase_url: str = os.getenv('VITE_SUPABASE_URL')
service_role_key: str = os.getenv('SERVIC_ROLE_KEY')

supabase = create_client(
    supabase_url,
    service_role_key,
    options=ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
    )
)

users = []
with open('data/3202/cpe_3202.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    users = [row for row in reader]

ans = input(f'Found {len(users)} users. Confirm account creation? (y/n): ')
if ans != 'y':
    sys.exit()

print('[Start] Create accounts')
for user in users:
    try:
        # Create auth account
        auth_response = supabase.auth.admin.create_user(
            {
                "email": f"{user['sr_code']}@g.batstate-u.edu.ph", 
                "password": user['sr_code'],
            }
        )

        try:
            # Insert to students table
            response = (
                supabase.table("students")
                    .insert({
                        "id": auth_response.user.id,  # Use auth id as row id
                        "first_name": user['first_name'],
                        "last_name": user['last_name'],
                        "sr_code": user['sr_code'],
                    })
                    .execute()
                )
            print(f'Created {user['sr_code']} | {user['first_name']} {user['last_name']}')
        except:
            print(f'Created auth account but couldn\'t insert to students table: {user['sr_code']} | {user['first_name']} {user['last_name']}')

    except:
        print(f'Couldn\'t create account for {user['sr_code']} | {user['first_name']} {user['last_name']}')

