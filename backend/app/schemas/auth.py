from pydantic import BaseModel, Field, ConfigDict

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120, description="Full name", examples=["Ana Silva"])
    email: str = Field(min_length=5, max_length=120, description="User email", examples=["ana@example.com"])
    document: str = Field(min_length=5, max_length=20, description="User document", examples=["12345678900"])
    password: str = Field(min_length=6, max_length=128, description="User password", examples=["secret123"])

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Ana Silva",
                    "email": "ana@example.com",
                    "document": "12345678900",
                    "password": "secret123",
                }
            ]
        }
    )

class UserLogin(BaseModel):
    email: str = Field(min_length=5, max_length=120, description="User email", examples=["ana@example.com"])
    password: str = Field(min_length=6, max_length=128, description="User password", examples=["secret123"])

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "email": "ana@example.com",
                    "password": "secret123",
                }
            ]
        }
    )

class UserOut(BaseModel):
    id: int = Field(description="User id", examples=[1])
    name: str = Field(description="Full name", examples=["Ana Silva"])
    email: str = Field(description="User email", examples=["ana@example.com"])
    role: str = Field(description="User role", examples=["user"])

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "name": "Ana Silva",
                    "email": "ana@example.com",
                    "role": "user",
                }
            ]
        },
    )
