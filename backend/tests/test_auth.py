"""
Authentication integration tests.
Run with: pytest tests/test_auth.py -v
Requires a running PostgreSQL database configured in .env.test
"""

import pytest
from fastapi import status


def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "StrongPass1!",
            "full_name": "New User",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["username"] == "newuser"
    assert "access_token" in data["token"]
    assert data["token"]["token_type"] == "bearer"


def test_register_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "dup@example.com",
            "username": "user1",
            "password": "StrongPass1!",
        },
    )
    response = client.post(
        "/api/auth/register",
        json={
            "email": "dup@example.com",
            "username": "user2",
            "password": "StrongPass1!",
        },
    )
    assert response.status_code == status.HTTP_409_CONFLICT


def test_register_weak_password(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "weak@example.com",
            "username": "weakuser",
            "password": "short",
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "StrongPass1!",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "StrongPass1!"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()["token"]


def test_login_invalid_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@example.com", "password": "WrongPass1!"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_profile(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["email"] == "test@example.com"


def test_get_profile_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == status.HTTP_403_FORBIDDEN
