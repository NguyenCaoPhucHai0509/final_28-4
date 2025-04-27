- Install requirements:
```
pip3 install -r /path/to/requirements.txt
```
- Install MySQL if not already installed.
- Create a new database:
```
CREATE DATABASE auth;
```
- Import the `.sql` file from `auth` folder
- Adjust `.env` file in auth folder, its content likes below, replace your PASSWORD of MySQL:
```
SECRET_KEY="a5a77b02217117f8a71d0fbdefbb55c8871d30e5494d1ed9f93a3788f868a174"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
PASSWORD="144819"
```