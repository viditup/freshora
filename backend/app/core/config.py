from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    mongo_url: str = "mongodb://localhost:27017"
    database_name: str = "freshora"
    jwt_secret: str  # required: app refuses to start without it
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    cors_origins: str = "http://localhost:8081,http://localhost:19006,http://localhost:5173"
    delivery_fee: float = 40
    free_delivery_above: float = 499
    delivery_eta_minutes: int = 10  # PART 7: standard ETA, shown on Product Details
    # PART 8: express delivery is a flat priority fee and never free.
    express_delivery_fee: float = 79
    express_eta_minutes: int = 5

    @field_validator("jwt_secret")
    @classmethod
    def strong_secret(cls, v: str) -> str:
        # SECURITY: a short or placeholder secret lets anyone forge admin tokens.
        if len(v) < 16 or v.lower().startswith("change_this"):
            raise ValueError("JWT_SECRET is too weak. Use a random value of 32+ characters: "
                             "python -c \"import secrets; print(secrets.token_hex(32))\"")
        return v


settings = Settings()
