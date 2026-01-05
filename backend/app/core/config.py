from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./app.db"
    admin_key: str = "carecaBrilhosa"  
    admin_email: str = "admin@financas.local"
    admin_password: str = "admin123"
    auth_salt: str = "change-me"

settings = Settings()
