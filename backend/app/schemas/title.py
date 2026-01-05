from pydantic import BaseModel, ConfigDict, Field

class TitleOut(BaseModel):
    id: str = Field(description="Unique title id", examples=["b0f6d2d2e5f44c9eaf7b3c9c7e4c7b10"])
    type: str | None = Field(default=None, description="Title type", examples=["CDB"])
    issuer: str | None = Field(default=None, description="Issuer name", examples=["Banco ABC"])
    maturity_date: str | None = Field(default=None, description="Maturity date (YYYY-MM-DD)", examples=["2027-12-29"])
    indexer: str | None = Field(default=None, description="Indexer or benchmark", examples=["CDI"])
    rate: float | None = Field(default=None, description="Numeric rate", examples=[0.12])
    rate_text: str | None = Field(default=None, description="Rate label", examples=["120% CDI"])
    min_application: float | None = Field(default=None, description="Minimum application amount", examples=[5000.0])
    rating: str | None = Field(default=None, description="Rating", examples=["AA"])
    source_sheet: str | None = Field(default=None, description="Source sheet", examples=["Credito bancario"])
    imported_at: str | None = Field(default=None, description="Import timestamp (ISO)", examples=["2026-01-05T10:15:30Z"])

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "id": "b0f6d2d2e5f44c9eaf7b3c9c7e4c7b10",
                    "type": "CDB",
                    "issuer": "Banco ABC",
                    "maturity_date": "2027-12-29",
                    "indexer": "CDI",
                    "rate": 0.12,
                    "rate_text": "120% CDI",
                    "min_application": 5000.0,
                    "rating": "AA",
                    "source_sheet": "Credito bancario",
                    "imported_at": "2026-01-05T10:15:30Z",
                }
            ]
        }
    )
