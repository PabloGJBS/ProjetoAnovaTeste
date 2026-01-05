from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.security import admin_required
from app.schemas.imports import ImportTitlesOut
from app.services.titles_importer import (
    excel_to_normalized_df,
    save_csv_uploaded,
    save_normalized_csv,
)

router = APIRouter(prefix="/import", tags=["import"])

@router.post(
    "/titles",
    dependencies=[Depends(admin_required)],
    response_model=ImportTitlesOut,
    summary="Import titles",
    description="Imports titles from CSV/XLSX/XLSM and normalizes the catalog.",
    responses={
        200: {"description": "Import completed"},
        400: {"description": "Invalid file or payload"},
        403: {"description": "Admin access required"},
        500: {"description": "Unexpected error"},
    },
)
async def import_titles(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()
    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail={"error": "empty_file", "filename": file.filename},
        )

    try:
        if filename.endswith(".csv"):
            count = save_csv_uploaded(content)
            return {"message": "CSV importado com sucesso", "titles_count": count}

        if filename.endswith(".xlsx") or filename.endswith(".xlsm"):
            df = excel_to_normalized_df(content)
            count = save_normalized_csv(df)
            return {
                "message": "Excel importado e convertido para CSV normalizado",
                "titles_count": count,
                "sheets_supported": ["Cr?dito banc?rio", "Liq. di?ria", "DPGEs", "T?tulos P?blicos"],
            }

        raise HTTPException(
            status_code=400,
            detail={
                "error": "invalid_extension",
                "allowed": [".csv", ".xlsx", ".xlsm"],
                "filename": file.filename,
            },
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "validation_error",
                "message": str(e),
                "filename": file.filename,
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "import_failed",
                "message": str(e),
                "type": e.__class__.__name__,
                "filename": file.filename,
            },
        )
