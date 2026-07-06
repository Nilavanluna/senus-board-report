cd $PSScriptRoot\backend
.\.venv\Scripts\Activate.ps1
$env:DEMO_MODE = "1"
python -m uvicorn app.main:app --reload
