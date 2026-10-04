import os, sys
# set env variables as test_acceptance does
os.environ['DATABASE_URL']='sqlite:///./test.db'
os.environ['JWT_SECRET']='testsecret'
os.environ['JWT_ALGORITHM']='HS256'
os.environ['ACCESS_TOKEN_EXPIRE_MINUTES']='60'
os.environ['MILEAGE_RATE']='0.5'
os.environ['UPLOAD_DIR']='uploads'
os.environ['CORS_ORIGINS']='http://localhost'

sys.path.append('backend')
from app.main import app
from fastapi.testclient import TestClient
client = TestClient(app)
# Register
resp = client.post('/auth/register', json={'email':'test@example.com','password':'Password1'})
print('register status', resp.status_code)
print('register body', resp.json())
if resp.ok:
    token = resp.json().get('access_token')
    print('got token', token)
    hdr = {'Authorization': f'Bearer {token}'}
    dash = client.get('/dashboard/summary', headers=hdr)
    print('dashboard status', dash.status_code)
    print('dashboard body', dash.text)
else:
    print('register failed')
