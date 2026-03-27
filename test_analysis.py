import urllib.request
import json

data = {
    'file_path': r'c:\Users\Prince Mandal\OneDrive\Desktop\turbulance\backend\uploads\1774087999187-432260663.jpg',
    'file_type': 'image/jpeg'
}

json_data = json.dumps(data).encode('utf-8')

try:
    req = urllib.request.Request('http://localhost:8000/analyze',
                                data=json_data,
                                headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print('Success:', result)
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    print('Response:', e.read().decode('utf-8'))
except Exception as e:
    print('Error:', e)