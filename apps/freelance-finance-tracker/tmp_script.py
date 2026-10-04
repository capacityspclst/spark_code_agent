import os, json
os.environ['DATABASE_URL']='sqlite:///./tmp_test.db'
from backend.app.main import app
from fastapi.testclient import TestClient
client=TestClient(app)
resp=client.post('/register', json={'email':'a@test.com','password':'StrongPass123!','confirm_password':'StrongPass123!'})
print('register', resp.status_code, resp.text)
resp2=client.post('/login', data={'username':'a@test.com','password':'StrongPass123!'})
print('login form', resp2.status_code, resp2.text)
