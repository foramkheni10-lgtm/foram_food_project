import asyncio
from app.database import database


async def check_admin():
    email = input("Enter your admin email: ").strip().lower()

    user = await database.users.find_one({
        "email": email
    })

    if user:
        print("\nAdmin account found:")
        print("Email:", user.get("email"))
        print("Role:", user.get("role"))
    else:
        print("\nAdmin account NOT FOUND")

    await database.client.close()


asyncio.run(check_admin())