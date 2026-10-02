import pathlib
from setuptools import setup, find_packages

# Read the long description from README if exists
this_directory = pathlib.Path(__file__).parent
long_description = ""
if (this_directory / "README.md").exists():
    long_description = (this_directory / "README.md").read_text(encoding="utf-8")

setup(
    name="freelance-finance-tracker",
    version="0.1.0",
    description="FastAPI backend and React frontend for freelance finance tracking",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="",
    packages=find_packages(exclude=("tests", "frontend")),
    python_requires=">=3.11",
    install_requires=[
        "fastapi==0.115.0",
        "uvicorn[standard]==0.30.6",
        "sqlmodel==0.0.22",
        "python-jose[cryptography]==3.4.0",
        "passlib[bcrypt]==1.7.4",
        "python-multipart==0.0.31",
        "pydantic-settings==2.5.2",
        "reportlab==4.2.2",
    ],
    include_package_data=True,
    zip_safe=False,
)
