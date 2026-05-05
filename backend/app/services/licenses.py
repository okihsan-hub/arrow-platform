from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.license import License, LicenseStatus, generate_license_key


def create_license(
    db: Session,
    *,
    customer_id: int,
    reseller_id: int | None,
    product_name: str,
    starts_at,
    expires_at,
    max_devices: int,
) -> License:
    # retry a few times in the extremely unlikely case of key collision
    for _ in range(5):
        lic = License(
            customer_id=customer_id,
            reseller_id=reseller_id,
            product_name=product_name,
            license_key=generate_license_key(),
            status=LicenseStatus.active,
            starts_at=starts_at,
            expires_at=expires_at,
            max_devices=max_devices,
            bound_devices={},
        )
        db.add(lic)
        try:
            db.commit()
            db.refresh(lic)
            return lic
        except IntegrityError:
            db.rollback()
            continue
    raise RuntimeError("Failed to generate unique license key")


def list_licenses(db: Session) -> list[License]:
    return list(db.scalars(select(License).order_by(License.id.desc())).all())


def get_license(db: Session, license_id: int) -> License | None:
    return db.get(License, license_id)


def set_license_status(db: Session, license_id: int, status: LicenseStatus) -> License | None:
    lic = db.get(License, license_id)
    if not lic:
        return None
    lic.status = status
    db.add(lic)
    db.commit()
    db.refresh(lic)
    return lic


def list_customer_licenses(db: Session, customer_id: int) -> list[License]:
    return list(db.scalars(select(License).where(License.customer_id == customer_id).order_by(License.id.desc())).all())

