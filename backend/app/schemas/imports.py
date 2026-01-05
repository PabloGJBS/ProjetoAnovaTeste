from pydantic import BaseModel, ConfigDict, Field

class ImportTitlesOut(BaseModel):
    message: str = Field(description="Import result message", examples=["CSV imported successfully"])
    titles_count: int = Field(description="Number of titles imported", examples=[120])
    sheets_supported: list[str] | None = Field(
        default=None,
        description="Supported sheets (for Excel imports)",
        examples=[["Credito bancario", "Liq. diaria", "DPGEs", "Titulos publicos"]],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "message": "Excel imported and normalized",
                    "titles_count": 120,
                    "sheets_supported": ["Credito bancario", "Liq. diaria", "DPGEs", "Titulos publicos"],
                }
            ]
        }
    )
