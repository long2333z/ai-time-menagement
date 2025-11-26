from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from cryptography.fernet import Fernet
import os

from database import get_db
from models import AIConfig

router = APIRouter()

# Encryption key for API keys (in production, use proper key management)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
cipher_suite = Fernet(ENCRYPTION_KEY)

class AIConfigCreate(BaseModel):
    provider: str
    model_name: str
    api_key: str
    api_endpoint: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 2000
    priority: int = 0

class AIConfigResponse(BaseModel):
    id: str
    provider: str
    model_name: str
    api_endpoint: Optional[str]
    temperature: float
    max_tokens: int
    is_active: bool
    priority: int

    class Config:
        from_attributes = True

def encrypt_api_key(api_key: str) -> str:
    return cipher_suite.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    return cipher_suite.decrypt(encrypted_key.encode()).decode()

@router.get("/", response_model=List[AIConfigResponse])
async def get_ai_configs(db: Session = Depends(get_db)):
    # In production, add admin authentication
    configs = db.query(AIConfig).order_by(AIConfig.priority.desc()).all()
    return configs

@router.post("/", response_model=AIConfigResponse)
async def create_ai_config(
    config_data: AIConfigCreate,
    db: Session = Depends(get_db)
):
    # In production, add admin authentication
    
    # Encrypt API key
    encrypted_key = encrypt_api_key(config_data.api_key)
    
    new_config = AIConfig(
        provider=config_data.provider,
        model_name=config_data.model_name,
        api_key_encrypted=encrypted_key,
        api_endpoint=config_data.api_endpoint,
        temperature=config_data.temperature,
        max_tokens=config_data.max_tokens,
        priority=config_data.priority,
        is_active=True
    )
    
    db.add(new_config)
    db.commit()
    db.refresh(new_config)
    
    return new_config

@router.put("/{config_id}/toggle")
async def toggle_ai_config(
    config_id: str,
    db: Session = Depends(get_db)
):
    # In production, add admin authentication
    config = db.query(AIConfig).filter(AIConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="AI config not found")
    
    config.is_active = not config.is_active
    db.commit()
    
    return {"message": "AI config toggled", "is_active": config.is_active}

@router.get("/active")
async def get_active_ai_config(db: Session = Depends(get_db)):
    # Get the highest priority active config
    config = db.query(AIConfig).filter(
        AIConfig.is_active == True
    ).order_by(AIConfig.priority.desc()).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="No active AI config found")
    
    # Decrypt API key for use
    decrypted_key = decrypt_api_key(config.api_key_encrypted)
    
    return {
        "provider": config.provider,
        "model_name": config.model_name,
        "api_key": decrypted_key,
        "api_endpoint": config.api_endpoint,
        "temperature": config.temperature,
        "max_tokens": config.max_tokens
    }

@router.post("/test")
async def test_ai_config(
    config_id: str,
    test_prompt: str = "Hello, this is a test.",
    db: Session = Depends(get_db)
):
    # In production, add admin authentication
    config = db.query(AIConfig).filter(AIConfig.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="AI config not found")
    
    # Here you would actually call the AI API
    # For now, return a mock response
    return {
        "success": True,
        "message": "AI config test successful",
        "provider": config.provider,
        "model": config.model_name,
        "test_response": "Mock AI response - integration pending"
    }
