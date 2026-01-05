from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.schemas.title import TitleOut

class AllocationCreate(BaseModel):
    client_id: int = Field(description="Client id", examples=[1])
    title_id: str = Field(min_length=10, description="Title id", examples=["title-1234567890"])
    amount: float = Field(gt=0, description="Allocation amount", examples=[15000.0])

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "client_id": 1,
                    "title_id": "title-1234567890",
                    "amount": 15000.0,
                }
            ]
        }
    )

class AllocationOut(BaseModel):
    id: int = Field(description="Allocation id", examples=[10])
    client_id: int = Field(description="Client id", examples=[1])
    title_id: str = Field(description="Title id", examples=["title-1234567890"])
    amount: float = Field(description="Allocated amount", examples=[15000.0])
    created_at: datetime = Field(description="Created timestamp", examples=["2026-01-05T10:15:30Z"])

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "examples": [
                {
                    "id": 10,
                    "client_id": 1,
                    "title_id": "title-1234567890",
                    "amount": 15000.0,
                    "created_at": "2026-01-05T10:15:30Z",
                }
            ]
        },
    )

class PortfolioItemOut(BaseModel):
    allocation_id: int = Field(description="Allocation id", examples=[10])
    amount: float = Field(description="Allocation amount", examples=[15000.0])
    created_at: datetime = Field(description="Created timestamp", examples=["2026-01-05T10:15:30Z"])
    title: TitleOut | None = Field(default=None, description="Title snapshot")

class PortfolioOut(BaseModel):
    client_id: int = Field(description="Client id", examples=[1])
    items: list[PortfolioItemOut]

class RecentAllocationClient(BaseModel):
    id: int = Field(description="Client id", examples=[1])
    name: str = Field(description="Client name", examples=["Jorge Lima"])
    document: str | None = Field(default=None, description="Client document", examples=["10987654321"])
    email: str | None = Field(default=None, description="Client email", examples=["jorge@example.com"])

class RecentAllocationOut(BaseModel):
    allocation_id: int = Field(description="Allocation id", examples=[10])
    amount: float = Field(description="Allocation amount", examples=[15000.0])
    created_at: datetime = Field(description="Created timestamp", examples=["2026-01-05T10:15:30Z"])
    client: RecentAllocationClient
    title: TitleOut | None = Field(default=None, description="Title snapshot")
