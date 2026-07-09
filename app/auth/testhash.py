from hashing import hash_password, verify_password

password = "Syed@2001"
print(password)
print(type(password))
print(len(password))

hashed = hash_password(password)

print("Original :", password)
print("Hashed   :", hashed)

print(
    verify_password(
        password,
        hashed
    )
)