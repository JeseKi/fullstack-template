# -*- coding: utf-8 -*-
"""
认证相关 Pydantic 模型（模板版）

公开接口：
- `UserProfile`、`UserCreate`、`UserUpdate`、`UserLogin`、`TokenResponse`、`PasswordChange`
"""

from enum import Enum
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional


class UserRole(str, Enum):
    """
    用户角色枚举
    """

    USER = "user"
    ADMIN = "admin"


class UserStatus(str, Enum):
    """
    用户状态枚举
    """

    ACTIVE = "active"
    INACTIVE = "inactive"


class UserProfile(BaseModel):
    id: int
    username: str
    email: EmailStr
    name: Optional[str] = Field(default=None)
    role: UserRole
    status: UserStatus

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = Field(default=None, max_length=100)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)
