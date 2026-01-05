from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ClientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120, description="Client name", examples=["Jorge Lima"])
    document: str = Field(min_length=5, max_length=20, description="Client document", examples=["10987654321"])
    email: str = Field(min_length=5, max_length=120, description="Client email", examples=["jorge@example.com"])

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Jorge Lima",
                    "document": "10987654321",
                    "email": "jorge@example.com",
                }
            ]
        }
    )

class ClientOut(BaseModel):
    id: int = Field(description="Client id", examples=[1])
    name: str = Field(description="Client name", examples=["Jorge Lima"])
    document: str = Field(description="Client document", examples=["10987654321"])
    email: str | None = Field(default=None, description="Client email", examples=["jorge@example.com"])
    created_at: datetime = Field(description="Created timestamp", examples=["2026-01-05T10:15:30Z"])

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "name": "Jorge Lima",
                    "document": "10987654321",
                    "email": "jorge@example.com",
                    "created_at": "2026-01-05T10:15:30Z",
                }
            ]
        },
    )
