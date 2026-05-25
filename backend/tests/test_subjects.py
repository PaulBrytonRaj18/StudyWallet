"""
Subject CRUD integration tests.
"""

import pytest
from fastapi import status


def test_create_subject(client, auth_headers):
    response = client.post(
        "/api/subjects",
        json={"name": "Mathematics", "description": "Math subject", "color": "#ef4444"},
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Mathematics"
    assert data["color"] == "#ef4444"


def test_list_subjects(client, auth_headers):
    client.post("/api/subjects", json={"name": "Physics"}, headers=auth_headers)
    client.post("/api/subjects", json={"name": "Chemistry"}, headers=auth_headers)

    response = client.get("/api/subjects", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["total"] == 2


def test_get_subject(client, auth_headers):
    created = client.post(
        "/api/subjects", json={"name": "Biology"}, headers=auth_headers
    ).json()

    response = client.get(f"/api/subjects/{created['id']}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Biology"


def test_update_subject(client, auth_headers):
    created = client.post(
        "/api/subjects", json={"name": "Old Name"}, headers=auth_headers
    ).json()

    response = client.put(
        f"/api/subjects/{created['id']}",
        json={"name": "New Name"},
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "New Name"


def test_delete_subject(client, auth_headers):
    created = client.post(
        "/api/subjects", json={"name": "To Delete"}, headers=auth_headers
    ).json()

    response = client.delete(f"/api/subjects/{created['id']}", headers=auth_headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = client.get(f"/api/subjects/{created['id']}", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_subject_isolation(client, auth_headers):
    other_headers = None
    response = client.post(
        "/api/auth/register",
        json={
            "email": "other@example.com",
            "username": "otheruser",
            "password": "StrongPass1!",
        },
    )
    other_headers = {
        "Authorization": f"Bearer {response.json()['token']['access_token']}"
    }

    client.post("/api/subjects", json={"name": "User1 Subject"}, headers=auth_headers)
    client.post(
        "/api/subjects", json={"name": "User2 Subject"}, headers=other_headers
    )

    response = client.get("/api/subjects", headers=auth_headers)
    assert response.json()["total"] == 1
    assert response.json()["subjects"][0]["name"] == "User1 Subject"
